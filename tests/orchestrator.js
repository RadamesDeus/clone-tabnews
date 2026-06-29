import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";
import { faker } from "@faker-js/faker";

const URLHTTPEMAIL = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

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

async function deleteAllEmail() {
  fetch(`${URLHTTPEMAIL}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const response = await fetch(`${URLHTTPEMAIL}/messages`);
  const emails = await response.json();

  const lastEmail = emails.pop(); //[emails.length - 1]

  if (!lastEmail) {
    return;
  }

  const lastEmailText = await fetch(
    `${URLHTTPEMAIL}/messages/${lastEmail.id}.plain`,
  );

  lastEmail.text = await lastEmailText.text();

  return lastEmail;
}

const orchestrator = {
  cleanDatabase,
  execPendingMigrations,
  createUser,
  createSession,
  deleteAllEmail,
  getLastEmail,
};

export default orchestrator;
