import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";
import { faker } from "@faker-js/faker";

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}
async function execPendingMigrations() {
  await migrator.execHandlerMigrations();
}

async function createUser(newUser) {
  return await user.create({
    username: newUser.username || faker.internet.username(),
    email: newUser.email || faker.internet.email(),
    password: newUser.password || "Senha123",
  });
}

async function createSession(userId) {
  const newSession = await session.create(userId);
  return newSession;
}

const orchestrator = {
  cleanDatabase,
  execPendingMigrations,
  createUser,
  createSession,
};

export default orchestrator;
