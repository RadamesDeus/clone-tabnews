import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
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
