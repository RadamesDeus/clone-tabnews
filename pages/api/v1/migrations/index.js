import { createRouter } from "next-connect";
import controller, { onNoMatch, onError } from "infra/controller";
import migrator from "models/migrator.js";
import { Permissions } from "infra/rule.js";
import authorization from "models/authorization.js";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest(Permissions.MIGRATION_READ), getHandlerMigrations)
  .post(controller.canRequest(Permissions.MIGRATION_RUN), postHandlerMigrations)
  .handler({ onNoMatch, onError });

async function postHandlerMigrations(request, response) {
  const migratedMigrations = await migrator.execHandlerMigrations();

  const userContext = request.context?.user;
  const output = await authorization.filterOutput(
    userContext,
    Permissions.MIGRATION_RUN,
    migratedMigrations,
  );

  return response
    .status(migratedMigrations.length > 0 ? 201 : 200)
    .json(output);
}

async function getHandlerMigrations(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();

  const userContext = request.context?.user;

  const output = await authorization.filterOutput(
    userContext,
    Permissions.MIGRATION_READ,
    pendingMigrations,
  );

  return response.status(200).json(output);
}
