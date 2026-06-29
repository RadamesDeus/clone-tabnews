import orchestrator from "tests/orchestrator.js";
import activation from "models/activation.js";
import webserver from "infra/webserver.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
  await orchestrator.deleteAllEmail();
});

describe("USE case:  Registration Flow.test (all successful)", () => {
  let userRegistrationFlow;
  let activationTokenMatch;

  test("Create user account", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "RegistrationFlow",
        email: "registration.flow@gmail.com",
        password: "RegistrationFlowPassword",
      }),
    });

    expect(response.status).toBe(201);

    userRegistrationFlow = await response.json();
    expect(userRegistrationFlow).toEqual({
      id: userRegistrationFlow.id,
      username: "RegistrationFlow",
      email: "registration.flow@gmail.com",
      features: ["read:activation_token"],
      password: userRegistrationFlow.password,
      created_at: userRegistrationFlow.created_at,
      updated_at: userRegistrationFlow.updated_at,
    });
  });

  test("Receive user account was created", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail).toBeDefined();
    expect(lastEmail.sender).toBe("<contato@clonetabnews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@gmail.com>");
    expect(lastEmail.subject).toBe("Ative seu cadastro no Clone Tabnews");

    const match = lastEmail.text.match(/(?<=\/ativar\/)[0-9a-fA-F-]{36}/);
    const token = match?.[0];

    expect(lastEmail.text).toContain(
      `${webserver.getOrigin()}/cadastro/ativar/${token}`,
    );

    activationTokenMatch = await activation.findActivationByToken(token);
    expect(activationTokenMatch.user_id).toBe(userRegistrationFlow.id);
    expect(activationTokenMatch.used_at).toBe(null);
  });

  test("Activate account was created", async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/activations/${activationTokenMatch.id}`,
      {
        method: "PATCH",
      },
    );
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Date.parse(responseBody.used_at)).not.toBeNaN();

    const userActive = await user.findOneById(activationTokenMatch.user_id);

    expect(userActive.features).not.toContain("read:activation_token");
    expect(userActive.features).toContain("create:session");

    const response2 = await fetch(
      `http://localhost:3000/api/v1/activations/${activationTokenMatch.id}`,
      {
        method: "PATCH",
      },
    );
    expect(response2.status).toBe(404);

    const response2Body = await response2.json();
    expect(response2Body).toEqual({
      name: "NotFoundError",
      action: "O token de ativação não foi encontrado no sistema ou expirou.",
      message: "Faça um novo cadastro.",
      status_code: 404,
    });
  });

  test("Login account was created", async () => {
    const response = await fetch("http://localhost:3000/api/v1/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "registration.flow@gmail.com",
        password: "RegistrationFlowPassword",
      }),
    });

    expect(response.status).toBe(201);

    const bodyResponse = await response.json();
    expect(bodyResponse.user_id).toBe(userRegistrationFlow.id);
  });

  test("Get User Details was created", async () => {});
});
