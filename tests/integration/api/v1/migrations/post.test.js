import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
});

describe("POST  /api/v1/migrations", () => {
  describe("Anonynous user", () => {
    describe("Running pending migrations", () => {
      test("for the first time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response.status).toBe(201);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThan(0);
      });

      test("for the second time", async () => {
        const responseEmpty = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(responseEmpty.status).toBe(200);
        const responseBodyEmpty = await responseEmpty.json();
        expect(responseBodyEmpty.length).toBe(0);
      });
    });
  });
});
