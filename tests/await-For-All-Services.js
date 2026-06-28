process.stdout.write("🔴 Aguardando servidor");
async function awaitForAllServices() {
  try {
    const webServiceStatusCode = await awaitForWebService();
    const emailServiceStatusCode = await awaitForEmailService();

    if (webServiceStatusCode === 200 && emailServiceStatusCode === 200) {
      process.stdout.write("\n🟢 Servidor inicializado!\n\n");

      return;
    }
  } catch {
    //catch(error)
    process.stdout.write(".");

    setTimeout(awaitForAllServices, 100);
  }

  async function awaitForWebService() {
    const response = await fetch("http://localhost:3000/api/v1/status");

    await response.json();

    return response.status;
  }
  const URLHTTPEMAIL = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

  async function awaitForEmailService() {
    const response = await fetch(`${URLHTTPEMAIL}/messages`);
    await response.json();

    return response.status;
  }
}

awaitForAllServices();
