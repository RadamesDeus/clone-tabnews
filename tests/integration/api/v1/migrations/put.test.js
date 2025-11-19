import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
});

describe("PUT  /api/v1/migrations", () => {
  describe("Anonynous user", () => {

    test("Metodo não permitido para este endpoint.", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/migrations",
        {
          method: "PUT",
        },
      );
      expect(response.status).toBe(405);
      const bodyResponse = await response.json();
      expect(bodyResponse).toEqual({
        name: "MethodNotAllowedError",
        message: "Metodo não permitido para este endpoint.",
        action: "Verifique se o método HTTP enviado é valido para este endpont.",
        status_code: 405,
      });
    });




  });
});
