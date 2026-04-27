import { version as uuidVersion } from "uuid";
import setCookiePparser from "set-cookie-parser";

import orchestrator from "tests/orchestrator.js";
import session from "models/session";
import { tr } from "@faker-js/faker";
// import user from "models/user";
// import password from "models/password";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("POST  /api/v1/sessions", () => {
  describe("Anonynous user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password: "SenhaCorrect",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "Email_Errado@gmail.com",
          password: "SenhaCorrect",
        }),
      });

      expect(response.status).toBe(401);
      const bodyResponse = await response.json();
      expect(bodyResponse).toEqual({
        name: "UnauthorizedError",
        message: "Os dados informados não conferem.",
        action: "verifique se os dados estão corretos.",
        status_code: 401,
      });
    });

    test("With incorrect `password` but correct `email`", async () => {
      await orchestrator.createUser({
        email: "Email_Correto@gmail.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "Email_Correto@gmail.com",
          password: "SenhaINCorrect",
        }),
      });

      expect(response.status).toBe(401);
      const bodyResponse = await response.json();
      expect(bodyResponse).toEqual({
        name: "UnauthorizedError",
        message: "Os dados informados não conferem.",
        action: "verifique se os dados estão corretos.",
        status_code: 401,
      });
    });

    test("With `password` and `email` incorrect", async () => {
      await orchestrator.createUser({});

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "Email_INCorrect@gmail.com",
          password: "Senha_INCorrect",
        }),
      });

      expect(response.status).toBe(401);
      const bodyResponse = await response.json();
      expect(bodyResponse).toEqual({
        name: "UnauthorizedError",
        message: "Os dados informados não conferem.",
        action: "verifique se os dados estão corretos.",
        status_code: 401,
      });
    });

    test("With `password` and `email` correct", async () => {
      const user = await orchestrator.createUser({
        email: "Email_Correct@gmail.com",
        password: "Senha_Correct",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "Email_Correct@gmail.com",
          password: "Senha_Correct",
        }),
      });

      expect(response.status).toBe(201);
      const bodyResponse = await response.json();

      expect(bodyResponse).toEqual({
        created_at: bodyResponse.created_at,
        expires_at: bodyResponse.expires_at,
        id: bodyResponse.id,
        token: bodyResponse.token,
        user_id: user.id,
      });

      expect(uuidVersion(bodyResponse.id)).toBe(4);
      expect(Date.parse(bodyResponse.created_at)).not.toBeNaN();
      expect(Date.parse(bodyResponse.expires_at)).not.toBeNaN();
      expect(bodyResponse.created_at < bodyResponse.expires_at).toBe(true);

      const created_at = new Date(bodyResponse.created_at);
      const expires_at = new Date(bodyResponse.expires_at);

      created_at.setMilliseconds(0);
      expires_at.setMilliseconds(0);

      const diffInMilles = expires_at.getTime() - created_at.getTime();

      expect(diffInMilles).toBe(session.EXPIRESATINDAYS_IN_MILLSECOND);

      const cookies = await setCookiePparser(response, { map: true });

      expect(cookies.session_id).toEqual({
        name: "session_id",
        value: bodyResponse.token,
        httpOnly: true,
        path: "/",
        maxAge: session.EXPIRESATINDAYS_IN_MILLSECOND / 1000,
      });
    });
  });
});
