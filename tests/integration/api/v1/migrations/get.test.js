import database from "infra/database.js";

beforeAll(async () => {
  await database.query("drop schema public cascade; create schema public");
});

describe("GET  /api/v1/migrations", () => {
  describe("Anonynous user", () => {
    test("Running pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "GET",
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);
    });
  });
});
