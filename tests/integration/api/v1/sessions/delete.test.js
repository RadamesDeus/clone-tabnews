import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";
import setCookiePparser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("DELETE  /api/v1/sessions", () => {
  describe("Default user", () => {
    test("Delete With valid session", async () => {
      const createUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObj = await orchestrator.createSession(createUser.id);

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObj.token}`,
        },
      });

      expect(response.status).toBe(200);

      const sessionUpdated = await response.json();

      expect(
        sessionUpdated.expires_at < sessionObj.expires_at.toISOString(),
      ).toBe(true);
      expect(
        sessionUpdated.updated_at > sessionObj.updated_at.toISOString(),
      ).toBe(true);

      const cookies = await setCookiePparser(response, { map: true });

      expect(cookies.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        httpOnly: true,
        path: "/",
        maxAge: -1,
      });

      const response2 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObj.token}`,
        },
      });

      expect(response2.status).toBe(401);

      const cookies2 = await setCookiePparser(response2, { map: true });

      expect(cookies2.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        httpOnly: true,
        path: "/",
        maxAge: -1,
      });
    });

    test("Delete With invalid session", async () => {
      const nonexistenTokenSession =
        "1979cc8720d10f3d642ec4e3146b99f48627eb4ed254630132fdd08cf2133d3fe46f01ed903842cb2ecf5149fda48378";
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${nonexistenTokenSession}`,
        },
      });
      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        action: "verifique se este usuário está logado e tente novamente.",
        message: "Usuario não posui uma sessão válida.",
        status_code: 401,
      });
    });

    test("Delete With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(
          Date.now() - session.EXPIRESATINDAYS_IN_MILLSECOND - 10000,
        ),
      });

      const createUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObj = await orchestrator.createSession(createUser.id);
      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObj.token}`,
        },
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        action: "verifique se este usuário está logado e tente novamente.",
        message: "Usuario não posui uma sessão válida.",
        status_code: 401,
      });
    });
  });
});
