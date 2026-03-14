import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("POST  /api/v1/users", () => {
  describe("Anonynous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testuser",
          email: "rainbow@gmail.com",
          password: "123475",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "testuser",
        email: "rainbow@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const createdUser = await user.findByUsername(responseBody.username);
      const isPasswordHashed = await password.verify(
        "123475",
        createdUser.password,
      );
      const isnotPasswordHashed = await password.verify(
        "senhaErrada",
        createdUser.password,
      );
      expect(isPasswordHashed).toBe(true);
      expect(isnotPasswordHashed).toBe(false);
    });

    test("With duplicate `email`", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "EmailDuplicate1",
          email: "emailduplicate@gmail.com",
          password: "123475",
        }),
      });
      expect(response1.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "EmailDuplicate2",
          email: "EmailDuplicate@gmail.com",
          password: "123475",
        }),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Erro ao execultar essa operação.",
        action: "Utilize outro email para essa operação.",
        status_code: 400,
      });
    });

    test("With duplicate `username`", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameDuplicate",
          email: "usernameDuplicate1@gmail.com",
          password: "123475",
        }),
      });
      expect(response1.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "UsernameDuplicate",
          email: "usernameDuplicate2@gmail.com",
          password: "123475",
        }),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Ocorreu um erro de validação.",
        action: "Utilize outro username para essa operação.",
        status_code: 400,
      });
    });
  });
});
