describe("POST  /api/v1/status", () => {
  describe("Anonynous user", () => {
    test("Retrieeving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", { method: "POST" });
      expect(response.status).toBe(405);


      const bodyResponse = await response.json();
      expect(bodyResponse.error).toEqual("Method Not Allowed");


    });
  });
});
