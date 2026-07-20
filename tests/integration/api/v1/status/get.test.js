import orchestrator from "tests/orchestrator.js";
import { Permissions } from "infra/rule.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("GET  /api/v1/status", () => {
  describe("Anonynous user", () => {
    test("Retrieving can't Anonymous user current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(403);
    });
  });

  describe("Default user", () => {
    test("Retrieving current system status", async () => {
      const createdUser = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(createdUser.id);
      const sessionObj = await orchestrator.createSession(activatedUser.id);

      await orchestrator.addAFeatureToUser(
        activatedUser,
        Permissions.STATUS_READ,
      );

      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "GET",
        headers: {
          Cookie: `session_id=${sessionObj.token}`,
        },
      });
      expect(response.status).toBe(200);

      const bodyResponse = await response.json();

      expect(bodyResponse.update_at).toBeDefined();

      const parsedUpdateAt = new Date(bodyResponse.update_at).toISOString();
      expect(bodyResponse.update_at).toEqual(parsedUpdateAt);
      expect(bodyResponse.dependencies.database.max_connections).toEqual(100);
      expect(bodyResponse.dependencies.database.opened_connections).toEqual(1);

      expect(bodyResponse.dependencies.database).not.toHaveProperty("version");
    });

    test("With user privilage retrieving current system status", async () => {
      const createdUser = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(createdUser.id);
      const sessionObj = await orchestrator.createSession(activatedUser.id);

      const userFull = await orchestrator.addAFeatureToUser(
        activatedUser,
        Permissions.STATUS_READ,
      );
      await orchestrator.addAFeatureToUser(
        userFull,
        Permissions.STATUS_READ_FULL,
      );

      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "GET",
        headers: {
          Cookie: `session_id=${sessionObj.token}`,
        },
      });
      expect(response.status).toBe(200);

      const bodyResponse = await response.json();
      expect(bodyResponse.update_at).toBeDefined();

      const parsedUpdateAt = new Date(bodyResponse.update_at).toISOString();
      expect(bodyResponse.update_at).toEqual(parsedUpdateAt);
      expect(bodyResponse.dependencies.database.version).toEqual("16.1");
      expect(bodyResponse.dependencies.database.max_connections).toEqual(100);
      expect(bodyResponse.dependencies.database.opened_connections).toEqual(1);
    });
  });
});
