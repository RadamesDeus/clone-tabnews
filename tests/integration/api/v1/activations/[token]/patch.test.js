import { version as uuidVersion } from "uuid";

import activation from "models/activation";
import orchestrator from "tests/orchestrator.js";
import user from "models/user";
import { Permissions } from "infra/rule.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
  await orchestrator.deleteAllEmail();
});

describe("PATCH:  /api/v1/activations/:token", () => {
  test("Default anonymous user", async () => {
    const response = await fetch(
      `${webserver.getOrigin()}/api/v1/activations/550e8400-e29b-41d4-a716-446655440000`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(response.status).toBe(404);
  });

  test("With invalid token format", async () => {
    const response = await fetch(
      `${webserver.getOrigin()}/api/v1/activations/invalidToken`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(response.status).toBe(404);
  });

  test("With expired token", async () => {
    jest.useFakeTimers({
      now: new Date(
        Date.now() - activation.EXPIRE_TOKENS_AT_IN_MILLISECONDS * 2, // 16 minutes later
      ),
    });
    const userValid = await orchestrator.createUser({});
    const expiredToken = await activation.create(userValid.id);

    jest.useRealTimers();

    const response = await fetch(
      `${webserver.getOrigin()}/api/v1/activations/${expiredToken.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(response.status).toBe(404);
  });

  test("With already used token", async () => {
    const userValid = await orchestrator.createUser({});
    const usedToken = await activation.create(userValid.id);
    await activation.markTokenAsUsed(usedToken.id);

    const response = await fetch(
      `${webserver.getOrigin()}/api/v1/activations/${usedToken.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(response.status).toBe(404);
  });

  test("With valid token", async () => {
    const userValid = await orchestrator.createUser({});
    const usedToken = await activation.create(userValid.id);

    const response = await fetch(
      `${webserver.getOrigin()}/api/v1/activations/${usedToken.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(Date.parse(responseBody.used_at)).not.toBeNaN();

    expect(responseBody).toEqual({
      id: usedToken.id,
      used_at: responseBody.used_at,
      user_id: usedToken.user_id,
      expires_at: usedToken.expires_at.toISOString(),
      created_at: usedToken.created_at.toISOString(),
      updated_at: responseBody.updated_at,
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(uuidVersion(responseBody.user_id)).toBe(4);

    expect(Date.parse(responseBody.used_at)).not.toBeNaN();
    expect(Date.parse(responseBody.created_at)).not.toBeNaN();
    expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    expect(responseBody.created_at < responseBody.updated_at).toBe(true);

    const created_at = new Date(responseBody.created_at);
    const expires_at = new Date(responseBody.expires_at);

    created_at.setMilliseconds(0);
    expires_at.setMilliseconds(0);

    expect(expires_at - created_at).toBeGreaterThanOrEqual(
      activation.EXPIRE_TOKENS_AT_IN_MILLISECONDS,
    );
    const userActivated = await user.findOneById(userValid.id);
    expect(userActivated.features).toEqual([
      Permissions.SESSION_CREATE,
      Permissions.SESSION_READ,
      Permissions.USER_READ,
      Permissions.USER_UPDATE,
    ]);
  });

  test("With valid token but already activated", async () => {
    const userValid = await orchestrator.createUser({});
    const userActivated = await orchestrator.activateUser(userValid.id);
    const usedToken = await activation.create(userActivated.id);

    const response = await fetch(
      `${webserver.getOrigin()}/api/v1/activations/${usedToken.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(response.status).toBe(403);
  });
});
