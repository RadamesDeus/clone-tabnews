import { createRouter } from "next-connect";

import database from "infra/database.js";
import controller, { onNoMatch, onError } from "infra/controller.js";
import { Permissions } from "infra/rule.js";
import authorization from "models/authorization.js";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest(Permissions.STATUS_READ), status)
  .handler({ onNoMatch, onError });

async function status(request, response) {
  const updateAt = new Date().toISOString();
  const versionpg = await database.query(`SHOW server_version;`);
  const max_connections = await database.query(`SHOW max_connections;`);

  const databaseStr = process.env.POSTGRES_DB;
  const stat_activity = await database.query({
    text: "SELECT count(*) FROM pg_stat_activity where datname = $1",
    values: [databaseStr],
  });

  const statusObj = {
    update_at: updateAt,
    dependencies: {
      database: {
        max_connections: parseInt(max_connections.rows[0].max_connections),
        opened_connections: parseInt(stat_activity.rows[0].count),
      },
    },
  };
  const userContext = request.context?.user;

  if (await authorization.can(userContext, Permissions.STATUS_READ_FULL))
    statusObj.dependencies.database.version = versionpg.rows[0].server_version;

  return response.status(200).json(statusObj);
}
