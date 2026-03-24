import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("PATCH  /api/v1/users/[username]", () => {
  describe("Anonynous user", () => {
    test("With noneexist 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UserInexistente",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "UserInexistente",
            email: "testUseremail@gmail.com",
            password: "123475",
          }),
        },
      );

      expect(response.status).toBe(404);
    });

    test("With noupdate username duplicate", async () => {
      await orchestrator.createUser({
        username: "user1",
      })

      await orchestrator.createUser({
        username: "user2",
      })

      const responseUp_username = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "User1",
          }),
        },
      );

      expect(responseUp_username.status).toBe(400);

      const responseUp_usernameBody = await responseUp_username.json();
      expect(responseUp_usernameBody).toEqual({
        name: "ValidationError",
        action: "Utilize outro username para essa operação.",
        message: "Ocorreu um erro de validação.",
        status_code: 400,
      });
    });

    test("With noupdate email duplicate", async () => {

      await orchestrator.createUser({
        email: "useremail1@gmail.com",
      })

      const user2 = await orchestrator.createUser({
        email: "useremail2@gmail.com",
      })

      const responseUp_email = await fetch(
        `http://localhost:3000/api/v1/users/${user2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "useremail1@gmail.com",
          }),
        },
      );

      expect(responseUp_email.status).toBe(400);
      const responseBody = await responseUp_email.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Utilize outro email para essa operação.",
        message: "Erro ao execultar essa operação.",
        status_code: 400,
      });
    });

    test("With update username valid", async () => {

      const userValid = await orchestrator.createUser({
        username: "usernameValid",
      })

      const responseUp_username = await fetch(
        `http://localhost:3000/api/v1/users/${userValid.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "User3Valid",
          }),
        },
      );

      expect(responseUp_username.status).toBe(200);

      const responseUp_usernameBody = await responseUp_username.json();
      expect(responseUp_usernameBody).toEqual({
        id: responseUp_usernameBody.id,
        username: "User3Valid",
        email: responseUp_usernameBody.email,
        password: responseUp_usernameBody.password,
        created_at: responseUp_usernameBody.created_at,
        updated_at: responseUp_usernameBody.updated_at,
      });
      expect(responseUp_usernameBody.updated_at).not.toBe(
        responseUp_usernameBody.created_at,
      );
    });

    test("With update email valid", async () => {

      const emailValid = await orchestrator.createUser({
        email: "emailvalid@gmail.com",
      })

      const responseUp_email = await fetch(
        `http://localhost:3000/api/v1/users/${emailValid.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "User4Valid@gmail.com",
          }),
        },
      );

      expect(responseUp_email.status).toBe(200);
      const responseBody = await responseUp_email.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: "User4Valid@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(responseBody.updated_at).not.toBe(responseBody.created_at);
    });

    test("With update password valid", async () => {
      const userPasswordValid = await orchestrator.createUser({
        password: "passwordvalid",
      })

      const responseUp_email = await fetch(
        `http://localhost:3000/api/v1/users/${userPasswordValid.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPasswordvalid",
          }),
        },
      );

      expect(responseUp_email.status).toBe(200);
      const responseBody = await responseUp_email.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: userPasswordValid.username,
        email: userPasswordValid.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.updated_at).not.toBe(responseBody.created_at);


      const createdUser = await user.findByUsername(responseBody.username);
      const isPasswordHashed = await password.verify(
        "newPasswordvalid",
        createdUser.password,
      );
      const isnotPasswordHashed = await password.verify(
        "passwordInvalid",
        createdUser.password,
      );
      expect(isPasswordHashed).toBe(true);
      expect(isnotPasswordHashed).toBe(false);
    });
  });
});
