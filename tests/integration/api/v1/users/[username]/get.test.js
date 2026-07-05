import orchestrator from "tests/orchestrator.js";
import { Permissions } from "infra/rule.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("GET  /api/v1/users/[username]", () => {
  describe("Anonynous user", () => {
    test("With exact case match `username`", async () => {
      const createdUser = await orchestrator.createUser({
        username: "MesmoCase",
        email: "MesmoCase@gmail.com",
        password: "123475",
      });

      await orchestrator.activateUser(createdUser.id);
      const sessionObj = await orchestrator.createSession(createdUser.id);

      const response1 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
        },
      );
      expect(response1.status).toBe(200);

      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MesmoCase",
        email: "MesmoCase@gmail.com",
        features: [
          Permissions.SESSION_CREATE,
          Permissions.SESSION_READ,
          Permissions.USER_READ,
          Permissions.USER_UPDATE,
        ],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });

    test("With case mismatch `username`", async () => {
      const createdUser = await orchestrator.createUser({
        username: "caseMismatch",
        email: "caseMismatch@gmail.com",
        password: "123475",
      });

      await orchestrator.activateUser(createdUser.id);
      const sessionObj = await orchestrator.createSession(createdUser.id);

      const response1 = await fetch(
        "http://localhost:3000/api/v1/users/casemismatch",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
        },
      );
      expect(response1.status).toBe(200);

      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "caseMismatch",
        email: "caseMismatch@gmail.com",
        features: [
          Permissions.SESSION_CREATE,
          Permissions.SESSION_READ,
          Permissions.USER_READ,
          Permissions.USER_UPDATE,
        ],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });

    test("With user not existing `username`", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/noUserNameExist",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      expect(response.status).toBe(403);
    });
  });
});
