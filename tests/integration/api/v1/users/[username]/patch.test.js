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
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@gmail.com",
          password: "123475",
        }),
      });
      expect(response.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@gmail.com",
          password: "123475",
        }),
      });
      expect(response2.status).toBe(201);

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
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "useremail1",
          email: "useremail1@gmail.com",
          password: "123475",
        }),
      });
      expect(response.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "useremail2",
          email: "useremail2@gmail.com",
          password: "123475",
        }),
      });
      expect(response2.status).toBe(201);

      const responseUp_email = await fetch(
        "http://localhost:3000/api/v1/users/useremail2",
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
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user3",
          email: "user3@gmail.com",
          password: "123475",
        }),
      });
      expect(response.status).toBe(201);

      const responseUp_username = await fetch(
        "http://localhost:3000/api/v1/users/user3",
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
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user4",
          email: "user4@gmail.com",
          password: "123475",
        }),
      });
      expect(response.status).toBe(201);

      const responseUp_email = await fetch(
        "http://localhost:3000/api/v1/users/user4",
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
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user5",
          email: "user5@gmail.com",
          password: "123475",
        }),
      });
      expect(response.status).toBe(201);
      const responseBodyCreate = await response.json();

      const responseUp_email = await fetch(
        "http://localhost:3000/api/v1/users/user5",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "104213",
          }),
        },
      );

      expect(responseUp_email.status).toBe(200);
      const responseBody = await responseUp_email.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "user5",
        email: "user5@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.updated_at).not.toBe(responseBody.created_at);
      expect(responseBody.password).not.toBe(responseBodyCreate.password);

      const createdUser = await user.findByUsername(responseBody.username);
      const isPasswordHashed = await password.verify(
        "104213",
        createdUser.password,
      );
      const isnotPasswordHashed = await password.verify(
        "123475",
        createdUser.password,
      );
      expect(isPasswordHashed).toBe(true);
      expect(isnotPasswordHashed).toBe(false);
    });
  });
});
