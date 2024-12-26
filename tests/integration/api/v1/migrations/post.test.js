import database from "infra/database.js";

beforeAll(async () => {
  await database.query("drop schema public cascade; create schema public");
});

test("POST to /api/v1/migrations should return 201", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response.status).toBe(201);

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toBe(true);
  const result = await database.query("SELECT * from pgmigrations");
  expect(result.rows.length).toBeGreaterThan(0);

  const responseEmpty = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  const responseBodyEmpty = await responseEmpty.json();

  expect(responseBodyEmpty.length).toBe(0);
});
