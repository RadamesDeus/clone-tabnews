import authorization from "models/authorization.js";
import { InternalServerError } from "infra/errors.js";

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("without  `userContext`", async () => {
      await expect(async () => {
        await authorization.can();
      }).rejects.toThrow(InternalServerError);
    });

    test("without `requestFeature`", async () => {
      await expect(async () => {
        const user = {
          username: "UsuarioDoContexto",
        };
        await authorization.can(user);
      }).rejects.toThrow(InternalServerError);
    });

    test("without uniknow `requestFeature`", async () => {
      await expect(async () => {
        const user = {
          username: "UsuarioDoContexto",
        };
        await authorization.can(user, "unknow:read");
      }).rejects.toThrow(InternalServerError);
    });

    test("with user and feature know", async () => {
      const user = {
        features: ["session:read"],
      };

      await expect(await authorization.can(user, "session:read")).toBe(true);
      await expect(await authorization.can(user, "session:create")).toBe(false);
    });
  });

  describe(".filterOutput()", () => {
    test("without  `userContext`", async () => {
      await expect(async () => {
        await authorization.filterOutput();
      }).rejects.toThrow(InternalServerError);
    });

    test("without `requestFeature`", async () => {
      await expect(async () => {
        const user = {
          username: "UsuarioDoContexto",
        };
        await authorization.filterOutput(user);
      }).rejects.toThrow(InternalServerError);
    });

    test("without uniknow `requestFeature`", async () => {
      await expect(async () => {
        const user = {
          username: "UsuarioDoContexto",
        };
        await authorization.filterOutput(user, "unknow:read");
      }).rejects.toThrow(InternalServerError);
    });

    test("with user and feature know and but no resourceTarget", async () => {
      await expect(async () => {
        await authorization.filterOutput({}, "user:read");
      }).rejects.toThrow(InternalServerError);
    });

    test("with user and feature know and resourceTarget", async () => {
      const user = {
        features: ["user:read"],
      };

      const resource = {
        id: 1,
        username: "NomeQualquer",
        features: ["activation:token"],
        created_at: "",
        updated_at: "",
        email: "NomeQualquer@teste.com",
        password: "123",
      };

      await expect(
        await authorization.filterOutput(user, "user:read", resource),
      ).toEqual({
        id: 1,
        username: "NomeQualquer",
        features: ["activation:token"],
        created_at: "",
        updated_at: "",
      });
    });
  });
});
