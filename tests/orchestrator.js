import database from "infra/database.js";
import migrator from "models/migrator.js";

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}
async function execPendingMigrations() {
  await migrator.execHandlerMigrations();
}
const orchestrator = {
  cleanDatabase,
  execPendingMigrations
};

export default orchestrator;
