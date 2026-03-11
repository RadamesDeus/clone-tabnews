import orchestrator from "tests/orchestrator.js";
// import database from "infra/database.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("GET  /api/v1/users/[username]", () => {
  describe("Anonynous user", () => {
    test("With exact case match `username`", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "MesmoCase",
          email: "MesmoCase@gmail.com",
          password: "123475",
        }),
      });
      expect(response.status).toBe(201);

      const response1 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      expect(response1.status).toBe(200);

      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MesmoCase",
        email: "MesmoCase@gmail.com",
        password: "123475",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });

    test("With case mismatch `username`", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "caseMismatch",
          email: "caseMismatch@gmail.com",
          password: "123475",
        }),
      });
      expect(response.status).toBe(201);

      const response1 = await fetch(
        "http://localhost:3000/api/v1/users/casemismatch",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      expect(response1.status).toBe(200);

      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "caseMismatch",
        email: "caseMismatch@gmail.com",
        password: "123475",
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
      expect(response.status).toBe(404);
    });
  });
});
