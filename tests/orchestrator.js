import fs from "fs/promises";
import path from "path";
import { faker } from "@faker-js/faker";

import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";
import { Permissions } from "infra/rule.js";

const URLHTTPEMAIL = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function createFakeMigration() {
  const migrationsDir = path.join(__dirname, "../infra/migrations");
  const migrationName = `${Date.now()}_fake_pending_migration.js`;
  const migrationPath = path.join(migrationsDir, migrationName);

  await fs.writeFile(
    migrationPath,
    `
    exports.up = async () => {};

    exports.down = async () => {};
`,
  );
  return migrationPath;
}

async function removeFakeMigration(migrationPath) {
  await fs.unlink(migrationPath);
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
  // await user.setFeatures(userId, ["create:session"]);
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

async function activateUser(userId) {
  const features = [
    Permissions.SESSION_CREATE,
    Permissions.SESSION_READ,
    Permissions.USER_READ,
    Permissions.USER_UPDATE,
  ];
  return await user.setFeatures(userId, features);
}

async function addAFeatureToUser(userContext, feature) {
  const features = [...userContext.features, feature];
  return await user.setFeatures(userContext.id, features);
}

const orchestrator = {
  cleanDatabase,
  execPendingMigrations,
  createUser,
  createSession,
  deleteAllEmail,
  getLastEmail,
  activateUser,
  addAFeatureToUser,
  createFakeMigration,
  removeFakeMigration,
};

export default orchestrator;
