import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user";
import password from "models/password";
import { Permissions } from "infra/rule.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("PATCH  /api/v1/users/[username]", () => {
  describe("Anonynous user", () => {
    test("With update 'username' valid", async () => {
      const userValid = await orchestrator.createUser({
        username: "usernameValid",
      });

      const responseUp_username = await fetch(
        `${webserver.getOrigin()}/api/v1/users/${userValid.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "User3Valid",
          }),
        },
      );

      expect(responseUp_username.status).toBe(403);

      const responseUp_usernameBody = await responseUp_username.json();

      expect(responseUp_usernameBody).toEqual({
        action: `Verifique se o seu usuário possui a feature [${Permissions.USER_UPDATE}]`,
        message: "O usuário não possui permissão para executar esta ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With noneexist 'username'", async () => {
      const createdUser = await orchestrator.createUser({});

      const activatedUser = await orchestrator.activateUser(createdUser.id);
      const sessionObj = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${webserver.getOrigin()}/api/v1/users/UserInexistente`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            username: "UserInexistente",
            email: "testUseremail@gmail.com",
            password: "123475",
          }),
        },
      );

      expect(response.status).toBe(404);
    });

    test("With no update 'username' duplicate", async () => {
      const createdUser1 = await orchestrator.createUser({});
      const createdUser2 = await orchestrator.createUser({});

      const activatedUser2 = await orchestrator.activateUser(createdUser2.id);
      const sessionObj = await orchestrator.createSession(activatedUser2.id);

      const responseUp_username = await fetch(
        `${webserver.getOrigin()}/api/v1/users/${activatedUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            username: `${createdUser1.username}`,
          }),
        },
      );

      expect(responseUp_username.status).toBe(400);

      const responseUp_usernameBody = await responseUp_username.json();
      expect(responseUp_usernameBody).toEqual({
        name: "ValidationError",
        action: "Utilize outro username para essa operação.",
        message: "Ocorreu um erro de validação.",
        status_code: 400,
      });
    });

    test("With no update 'username' the another user", async () => {
      const createdUser1 = await orchestrator.createUser({});
      const createdUser2 = await orchestrator.createUser({});

      const activatedUser2 = await orchestrator.activateUser(createdUser2.id);
      const sessionObj = await orchestrator.createSession(activatedUser2.id);

      const responseUp_username = await fetch(
        `${webserver.getOrigin()}/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            username: `umUsuarioQualquer`,
          }),
        },
      );

      expect(responseUp_username.status).toBe(403);

      const responseUp_usernameBody = await responseUp_username.json();
      expect(responseUp_usernameBody).toEqual({
        name: "ForbiddenError",
        action: `Verifique se o seu usuário possui a feature [${Permissions.USER_UPDATE}]`,
        message: "O usuário não possui permissão para executar esta ação.",
        status_code: 403,
      });
    });

    test("With no update 'email' duplicate", async () => {
      const createdUser1 = await orchestrator.createUser({
        email: "useremail1@gmail.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "useremail2@gmail.com",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2.id);

      const sessionObj = await orchestrator.createSession(activatedUser2.id);

      const responseUp_email = await fetch(
        `${webserver.getOrigin()}/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            email: `${createdUser1.email}`,
          }),
        },
      );

      expect(responseUp_email.status).toBe(400);
      const responseBody = await responseUp_email.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Utilize outro email para essa operação.",
        message: "Erro ao executar essa operação.",
        status_code: 400,
      });
    });

    test("With update 'username' valid", async () => {
      const userValid = await orchestrator.createUser({
        username: "usernameValid2",
      });

      const activatedUser = await orchestrator.activateUser(userValid.id);
      const sessionObj = await orchestrator.createSession(activatedUser.id);

      const responseUp_username = await fetch(
        `${webserver.getOrigin()}/api/v1/users/${userValid.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            username: "usernameValid3",
          }),
        },
      );

      expect(responseUp_username.status).toBe(200);

      const responseUp_usernameBody = await responseUp_username.json();
      expect(responseUp_usernameBody).toEqual({
        id: responseUp_usernameBody.id,
        username: "usernameValid3",
        features: [
          Permissions.SESSION_CREATE,
          Permissions.SESSION_READ,
          Permissions.USER_READ,
          Permissions.USER_UPDATE,
        ],
        created_at: responseUp_usernameBody.created_at,
        updated_at: responseUp_usernameBody.updated_at,
      });
      expect(responseUp_usernameBody.updated_at).not.toBe(
        responseUp_usernameBody.created_at,
      );
    });

    test("With update 'email' valid", async () => {
      const emailValid = await orchestrator.createUser({
        email: "emailvalid@gmail.com",
      });

      const activatedUser = await orchestrator.activateUser(emailValid.id);
      const sessionObj = await orchestrator.createSession(activatedUser.id);

      const responseUp_email = await fetch(
        `${webserver.getOrigin()}/api/v1/users/${emailValid.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            email: "User4Valid@gmail.com",
          }),
        },
      );

      expect(responseUp_email.status).toBe(200);
      const responseBody = await responseUp_email.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        features: [
          Permissions.SESSION_CREATE,
          Permissions.SESSION_READ,
          Permissions.USER_READ,
          Permissions.USER_UPDATE,
        ],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(responseBody.updated_at).not.toBe(responseBody.created_at);
    });

    test("With update 'password' valid", async () => {
      const userPasswordValid = await orchestrator.createUser({
        password: "passwordvalid",
      });

      const activatedUser = await orchestrator.activateUser(
        userPasswordValid.id,
      );
      const sessionObj = await orchestrator.createSession(activatedUser.id);

      const responseUp_email = await fetch(
        `${webserver.getOrigin()}/api/v1/users/${userPasswordValid.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            password: "newPasswordvalid",
          }),
        },
      );

      expect(responseUp_email.status).toBe(200);
      const responseBody = await responseUp_email.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: userPasswordValid.username,
        features: [
          Permissions.SESSION_CREATE,
          Permissions.SESSION_READ,
          Permissions.USER_READ,
          Permissions.USER_UPDATE,
        ],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.updated_at).not.toBe(responseBody.created_at);

      const createdUser = await user.findByUsername(responseBody.username);
      const isPasswordHashed = await password.verify(
        "newPasswordvalid",
        createdUser.password,
      );
      const isnotPasswordHashed = await password.verify(
        "passwordInvalid",
        createdUser.password,
      );
      expect(isPasswordHashed).toBe(true);
      expect(isnotPasswordHashed).toBe(false);
    });
  });

  describe("Privileged user", () => {
    test("With no update username the another user", async () => {
      const createdUser1 = await orchestrator.createUser({});
      const createdUser2 = await orchestrator.createUser({});

      const activatedUser2 = await orchestrator.activateUser(createdUser2.id);
      const sessionObj = await orchestrator.createSession(activatedUser2.id);

      await orchestrator.addAFeatureToUser(
        activatedUser2,
        Permissions.USER_UPDATE_OTHER,
      );

      const responseUp_username = await fetch(
        `${webserver.getOrigin()}/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            username: `umUsuarioAlterado`,
          }),
        },
      );

      expect(responseUp_username.status).toBe(200);

      const responseUp_usernameBody = await responseUp_username.json();
      expect(responseUp_usernameBody).toEqual({
        id: createdUser1.id,
        username: "umUsuarioAlterado",
        features: createdUser1.features,
        created_at: createdUser1.created_at.toISOString(),
        updated_at: responseUp_usernameBody.updated_at,
      });
      expect(
        responseUp_usernameBody.updated_at >
          createdUser1.updated_at.toISOString(),
      ).toBe(true);
    });
  });
});
