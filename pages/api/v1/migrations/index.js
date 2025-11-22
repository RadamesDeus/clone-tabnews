import { createRouter } from "next-connect";
import { onNoMatch, onError } from "infra/controller";
import migrator from "model/migrator.js";

const router = createRouter();

router.get(getHandlerMigrations);
router.post(postHandlerMigrations);

export default router.handler({
  onNoMatch,
  onError,
});


async function postHandlerMigrations(request, response) {

  const migratedMigrations = await migrator.execHandlerMigrations();
  return response
    .status(migratedMigrations.length > 0 ? 201 : 200)
    .json(migratedMigrations);

}

async function getHandlerMigrations(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}
