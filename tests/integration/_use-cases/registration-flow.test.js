import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.execPendingMigrations();
});

describe("USE case:  Registration Flow.test (all successful)", () => {
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

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "RegistrationFlow",
      email: "registration.flow@gmail.com",
      features: [],
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });
  });

  test("Activate account was created", async () => {});
  test("Login account was created", async () => {});
  test("Get User Details was created", async () => {});
});
