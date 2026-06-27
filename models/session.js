import crypto from "node:crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors.js";

const EXPIRESATINDAYS_IN_MILLSECOND = 30 * 24 * 60 * 60 * 1000; //30 days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRESATINDAYS_IN_MILLSECOND);

  const result = await database.query({
    text: `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3) RETURNING *;`,
    values: [token, userId, expiresAt],
  });

  return result.rows[0];
}

async function updateById(id) {
  const expiresAt = new Date(Date.now() + EXPIRESATINDAYS_IN_MILLSECOND);

  const result = await database.query({
    text: `Update sessions SET expires_at = $1, updated_at = NOW() WHERE id = $2 RETURNING *;`,
    values: [expiresAt, id],
  });

  return result.rows[0];
}
async function expireById(id) {
  const result = await database.query({
    text: `Update 
              sessions 
            SET 
              expires_at = expires_at - interval '1 year',
              updated_at = NOW() 
            WHERE id = $1 
            RETURNING *;`,
    values: [id],
  });

  return result.rows[0];
}
async function findOneValidByToken(token) {
  const result = await database.query({
    text: `SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW() LIMIT 1;`,
    values: [token],
  });

  if (result.rowCount == 0) {
    throw new UnauthorizedError({
      name: "UnauthorizedError",
      message: "Usuario não posui uma sessão válida.",
      action: "verifique se este usuário está logado e tente novamente.",
    });
  }
  return result.rows[0];
}

const session = {
  create,
  findOneValidByToken,
  updateById,
  expireById,
  EXPIRESATINDAYS_IN_MILLSECOND,
};

export default session;
