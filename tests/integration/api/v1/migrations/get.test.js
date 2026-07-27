import orchestrator from "tests/orchestrator.js";
import { Permissions } from "infra/rule.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("GET  /api/v1/migrations", () => {
  describe("Default user", () => {
    test("Running pending migrations", async () => {
      const createdUser = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(createdUser.id);
      const sessionObj = await orchestrator.createSession(activatedUser.id);

      await orchestrator.addAFeatureToUser(
        activatedUser,
        Permissions.MIGRATION_READ,
      );

      const fileMigrationPath = await orchestrator.createFakeMigration();

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "GET",
        headers: {
          Cookie: `session_id=${sessionObj.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);

      await orchestrator.removeFakeMigration(fileMigrationPath);
    });
  });

  describe("Anonynous user", () => {
    test("With user anonymous can not get pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations");
      expect(response.status).toBe(403);
    });
  });
});
