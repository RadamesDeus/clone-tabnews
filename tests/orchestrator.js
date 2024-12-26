process.stdout.write("🔴 Aguardando servidor");
async function awaitForAllServices() {
  try {
    const webServiceStatusCode = await awaitForWebService();

    if (webServiceStatusCode === 200) {
      process.stdout.write("\n🟢 Servidor inicializado!\n\n");

      return;
    }
  } catch (error) {
    process.stdout.write(".");

    setTimeout(awaitForAllServices, 100);
  }

  async function awaitForWebService() {
    const response = await fetch("http://localhost:3000/api/v1/status");

    await response.json();

    return response.status;
  }
}

awaitForAllServices();
