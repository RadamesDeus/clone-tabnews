import { createRouter } from "next-connect";
import { onNoMatch, onError } from "infra/controller";

import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";

const router = createRouter();

router.get(getHandlerMigrations);
router.post(postHandlerMigrations);

export default router.handler({
  onNoMatch,
  onError,
});

const configOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function postHandlerMigrations(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...configOptions,
      dbClient,
      dryRun: false,
    });
    return response
      .status(migratedMigrations.length > 0 ? 201 : 200)
      .json(migratedMigrations);
  } finally {
    dbClient.end();
  }
}

async function getHandlerMigrations(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...configOptions,
      dbClient,
    });
    return response.status(200).json(pendingMigrations);
  } finally {
    dbClient.end();
  }
}
