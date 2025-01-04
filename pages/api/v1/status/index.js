import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updateAt = new Date().toISOString();
    const versionpg = await database.query(`SHOW server_version;`);
    const max_connections = await database.query(`SHOW max_connections;`);

    const databaseStr = process.env.POSTGRES_DB;
    const stat_activity = await database.query({
      text: "SELECT count(*) FROM pg_stat_activity where datname = $1",
      values: [databaseStr],
    });

    response.status(200).json({
      update_at: updateAt,
      dependencies: {
        database: {
          version: versionpg.rows[0].server_version,
          max_connections: parseInt(max_connections.rows[0].max_connections),
          opened_connections: parseInt(stat_activity.rows[0].count),
        },
      },
    });
  } catch (error) {
    const publicErroObject = new InternalServerError({ cause: error.message });

    console.log("\n Erro dentro co catch do controller:");
    console.log(publicErroObject);
    response.status(500).json(publicErroObject);
  }
}

export default status;
