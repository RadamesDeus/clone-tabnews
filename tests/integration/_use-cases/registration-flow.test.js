import orchestrator from "tests/orchestrator.js";
import activation from "models/activation.js";
import webserver from "infra/webserver.js";
import { NotFoundError } from "infra/errors.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
  await orchestrator.deleteAllEmail();
});

describe("USE case:  Registration Flow.test (all successful)", () => {
  let userRegistrationFlow;
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

  test("Activate account was created", async () => {
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

    const activationTokenMatch = await activation.findActivationByToken(token);
    expect(activationTokenMatch.user_id).toBe(userRegistrationFlow.id);
    expect(activationTokenMatch.used_at).toBe(null);

    let erroToken;

    await expect(
      (erroToken = activation.findActivationByToken(token)),
    ).rejects.toThrow(NotFoundError);

    await expect(erroToken).rejects.toHaveProperty(
      "action",
      "O token de ativação não foi encontrado no sistema ou expirou.",
      400,
      "message",
      "Faça um novo cadastro.",
    );
  });

  test("Login account was created", async () => {});
  test("Get User Details was created", async () => {});
});
