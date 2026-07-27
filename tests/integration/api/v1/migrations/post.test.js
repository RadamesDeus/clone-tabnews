import orchestrator from "tests/orchestrator.js";
import { Permissions } from "infra/rule.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("POST  /api/v1/migrations", () => {
  describe("Default user", () => {
    describe("Running pending migrations", () => {
      test("for the first time", async () => {
        const createdUser = await orchestrator.createUser({});
        const activatedUser = await orchestrator.activateUser(createdUser.id);
        const sessionObj = await orchestrator.createSession(activatedUser.id);

        await orchestrator.addAFeatureToUser(
          activatedUser,
          Permissions.MIGRATION_RUN,
        );

        const fileMigrationPath = await orchestrator.createFakeMigration();

        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
            headers: {
              Cookie: `session_id=${sessionObj.token}`,
            },
          },
        );
        expect(response.status).toBe(201);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThan(0);

        await orchestrator.removeFakeMigration(fileMigrationPath);
      });

      test("for the second time", async () => {
        const createdUser = await orchestrator.createUser({});
        const activatedUser = await orchestrator.activateUser(createdUser.id);
        const sessionObj = await orchestrator.createSession(activatedUser.id);

        await orchestrator.addAFeatureToUser(
          activatedUser,
          Permissions.MIGRATION_RUN,
        );

        const responseEmpty = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
            headers: {
              Cookie: `session_id=${sessionObj.token}`,
            },
          },
        );
        expect(responseEmpty.status).toBe(200);
        const responseBodyEmpty = await responseEmpty.json();
        expect(responseBodyEmpty.length).toBe(0);
      });
    });
  });

  describe("Anonynous user", () => {
    test("With user anonymous can not running pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });
      expect(response.status).toBe(403);
    });
  });
});
