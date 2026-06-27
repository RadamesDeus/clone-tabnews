import orchestrator from "tests/orchestrator.js";
import session from "models/session";
import { version as uuidVersion } from "uuid";
import setCookiePparser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("GET  /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObj = await orchestrator.createSession(createUser.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObj.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createUser.id,
        username: "UserWithValidSession",
        email: createUser.email,
        password: createUser.password,
        created_at: createUser.created_at.toISOString(),
        updated_at: createUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const sessionValidUpdated = await session.findOneValidByToken(
        sessionObj.token,
      );

      expect(sessionValidUpdated.expires_at.getTime()).toBeGreaterThan(
        sessionObj.expires_at.getTime(),
      );
      expect(sessionValidUpdated.updated_at.getTime()).toBeGreaterThan(
        sessionObj.updated_at.getTime(),
      );

      // set-Cookies Sessions

      const cookies = await setCookiePparser(response, { map: true });
      expect(cookies.session_id).toEqual({
        name: "session_id",
        value: sessionValidUpdated.token,
        httpOnly: true,
        path: "/",
        maxAge: session.EXPIRESATINDAYS_IN_MILLSECOND / 1000,
      });
    });

    test("With nonexistenToken session", async () => {
      const nonexistenTokenSession =
        "1979cc8720d10f3d642ec4e3146b99f48627eb4ed254630132fdd08cf2133d3fe46f01ed903842cb2ecf5149fda48378";
      const response = await fetch("http://localhost:3000/api/v1/user", {
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

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(
          Date.now() - session.EXPIRESATINDAYS_IN_MILLSECOND - 3600,
        ),
      });

      const createUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObj = await orchestrator.createSession(createUser.id);
      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
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

    test("With session about to expire", async () => {
      const createUser = await orchestrator.createUser({
        username: "UserWithAboutToExpireSession",
      });

      jest.useFakeTimers({
        now: new Date(
          Date.now() - session.EXPIRESATINDAYS_IN_MILLSECOND + 3000,
        ),
      });
      const sessionObj = await orchestrator.createSession(createUser.id);

      console.log("sessionObj:", sessionObj);

      console.log("data fake:", new Date(Date.now()));

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObj.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createUser.id,
        username: "UserWithAboutToExpireSession",
        email: createUser.email,
        password: createUser.password,
        created_at: createUser.created_at.toISOString(),
        updated_at: createUser.updated_at.toISOString(),
      });

      jest.useRealTimers();
      console.log("data atual:", new Date(Date.now()));

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const sessionValidUpdated = await session.findOneValidByToken(
        sessionObj.token,
      );
      console.log("sessionValidUpdated:", sessionValidUpdated);

      expect(sessionValidUpdated.expires_at.getTime()).toBeGreaterThan(
        sessionObj.expires_at.getTime(),
      );
      expect(sessionValidUpdated.updated_at.getTime()).toBeGreaterThan(
        sessionObj.updated_at.getTime(),
      );

      // set-Cookies Sessions

      const cookies = await setCookiePparser(response, { map: true });
      expect(cookies.session_id).toEqual({
        name: "session_id",
        value: sessionValidUpdated.token,
        httpOnly: true,
        path: "/",
        maxAge: session.EXPIRESATINDAYS_IN_MILLSECOND / 1000,
      });
    });
  });
});
