import webserver from "infra/webserver.js";

describe("POST  /api/v1/status", () => {
  describe("Anonynous user", () => {
    test("Retrieeving current system status", async () => {
      const response = await fetch(`${webserver.getOrigin()}/api/v1/status`, {
        method: "POST",
      });
      expect(response.status).toBe(405);

      const bodyResponse = await response.json();
      expect(bodyResponse).toEqual({
        name: "MethodNotAllowedError",
        message: "Metodo não permitido para este endpoint.",
        action:
          "Verifique se o método HTTP enviado é valido para este endpont.",
        status_code: 405,
      });
    });
  });
});
