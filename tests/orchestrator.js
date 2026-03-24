import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import { faker } from '@faker-js/faker';

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}
async function execPendingMigrations() {
  await migrator.execHandlerMigrations();
}

async function createUser(newUser) {

  return await user.create({
    username: newUser.username || faker.internet.userName(),
    email: newUser.email || faker.internet.email(),
    password: newUser.password || "Senha123",
  });
}

const orchestrator = {
  cleanDatabase,
  execPendingMigrations,
  createUser,
};

export default orchestrator;
