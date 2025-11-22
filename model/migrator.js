import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { ServiceError } from "infra/errors.js";

const configOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function execHandlerMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...configOptions,
      dbClient,
      dryRun: false,
    });
    return migratedMigrations
  } catch (error) {
    throw new ServiceError({
      cause: error,
      message: "Erro ao Eecutar as Pendencia da Migrations.",
    });
  } finally {
    dbClient?.end();
  }
}

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...configOptions,
      dbClient,
    });
    return pendingMigrations;
  } catch (error) {
    throw new ServiceError({
      cause: error,
      message: "Erro ao Listar Pendencia da Migrations.",
    });
  } finally {
    dbClient?.end();
  }
}

const migrator = {
  execHandlerMigrations,
  listPendingMigrations,
};

export default migrator;