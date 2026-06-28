import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.deleteAllEmail();
});

describe("sendmail  /infra/email", () => {
  test("sendEmail", async () => {
    await email.sendEmail({
      from: "Radames <raihard@tabnews.com.br>",
      to: "John Doe <john@example.com>",
      subject: "Test Email",
      text: "This is a test email.",
    });

    await email.sendEmail({
      from: "Radames <raihard@tabnews.com.br>",
      to: "Joao <Joao@example.com>",
      subject: "Test Last Email",
      text: "This is a test Last email.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail).toBeDefined();
    expect(lastEmail.sender).toBe("<raihard@tabnews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<Joao@example.com>");
    expect(lastEmail.subject).toBe("Test Last Email");
    expect(lastEmail.text).toBe("This is a test Last email.\n");
  });
});
