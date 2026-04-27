import crypto from "node:crypto";
import database from "infra/database.js";

const EXPIRESATINDAYS_IN_MILLSECOND = 30 * 24 * 60 * 60 * 1000; //30 days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");

  const result = await database.query({
    text: `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3) RETURNING *;`,
    values: [token, userId, getExpiresAt()],
  });

  return result.rows[0];

  function getExpiresAt() {
    const expiresAt = new Date(Date.now() + EXPIRESATINDAYS_IN_MILLSECOND);
    return expiresAt;
  }
}

const session = {
  create,
  EXPIRESATINDAYS_IN_MILLSECOND,
};

export default session;
