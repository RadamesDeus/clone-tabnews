import database from "infra/database.js";

beforeAll(async () => {
  await database.query("drop schema public cascade; create schema public");
});

describe("POST  /api/v1/migrations", () => {
  describe("Anonynous user", () => {
    describe("Running pending migrations", () => {
      test("for the first time", async () => {
        const response = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        expect(response.status).toBe(201);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody)).toBe(true);
        const result = await database.query("SELECT * from pgmigrations");
        expect(result.rows.length).toBeGreaterThan(0);
      });

      test("for the second time", async () => {
        const responseEmpty = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        expect(responseEmpty.status).toBe(200);
        const responseBodyEmpty = await responseEmpty.json();

        expect(responseBodyEmpty.length).toBe(0);
      });
    })
  })
})


