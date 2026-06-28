process.stdout.write("🔴 Aguardando servidor");

async function awaitForAllServices() {
  try {
    if (webServiceStatusCode != 200) {
      webServiceStatusCode = await awaitForWebService();
    }
    if (emailServiceStatusCode != 200) {
      emailServiceStatusCode = await awaitForEmailService();
    }

    if (webServiceStatusCode === 200 && emailServiceStatusCode === 200) {
      process.stdout.write("\n🟢 Servidor inicializado!");
      process.stdout.write("\n🟢 Servidor Email inicializado!\n");
      return;
    }
  } catch {
    //catch(error)
    process.stdout.write(".");
    setTimeout(awaitForAllServices, 100);
  }

  async function awaitForWebService() {
    const response = await fetch("http://localhost:3000/api/v1/status");
    if (response.status != 200) {
      Error();
    }
    return response.status;
  }

  async function awaitForEmailService() {
    const response = await fetch(`http://localhost:1080`);
    if (response.status != 200) {
      Error();
    }
    return response.status;
  }
}

let webServiceStatusCode = 0;
let emailServiceStatusCode = 0;
awaitForAllServices();
