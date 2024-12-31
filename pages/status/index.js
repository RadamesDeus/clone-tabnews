import userSWR from "swr";
async function fetchAPI(key) {
  const response = await fetch(key);
  const bodyResponse = await response.json();
  return bodyResponse;
}

function Status({ tipo }) {
  const { data, isLoading } = userSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 60000,
  });
  console.log(tipo);

  if (!isLoading) {
    let loading = "teste";
    const { version, max_connections, opened_connections } =
      data.dependencies.database;
    switch (tipo) {
      case "update_at":
        loading = (
          <div>
            última atualização:{" "}
            {new Date(data.update_at).toLocaleString("pt-BR")}
          </div>
        );
        break;
      case "version":
        loading = <div>Servidor Version: {version}</div>;
        break;
      case "opened_connections":
        loading = <div>Connections Abertas: {opened_connections}</div>;
        break;
      case "max_connections":
        loading = <div>Max de Connections {max_connections}</div>;
        break;
    }
    return loading; //JSON.stringify(data, null, 2)
  }
  return <div>Loading...</div>;
}

export default function statusPage() {
  return (
    <>
      <h1>Status</h1>

      <Status tipo="update_at" />
      <Status tipo="version" />
      <Status tipo="opened_connections" />
      <Status tipo="max_connections" />
    </>
  );
}
