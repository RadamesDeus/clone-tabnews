import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import { NotFoundError } from "infra/errors.js";

const EXPIRE_TOKENS_AT_IN_MILLISECONDS = 60 * 15 * 1000; //15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRE_TOKENS_AT_IN_MILLISECONDS);

  const result = await database.query({
    text: `INSERT INTO user_activation_tokens (user_id, expires_at) VALUES ($1, $2) RETURNING *;`,
    values: [userId, expiresAt],
  });

  return result.rows[0];
}

// async function findOneByUserId(userId) {
//   const result = await database.query({
//     text: `SELECT * FROM user_activation_tokens WHERE user_id = $1;`,
//     values: [userId],
//   });

//   return result.rows[0];
// }

async function sendEmailToUser(user, token) {
  await email.sendEmail({
    from: "Clone Tabnews <contato@clonetabnews.com.br>",
    to: `${user.username} <${user.email}>`,
    subject: "Ative seu cadastro no Clone Tabnews",
    text: `Olá, ${user.username}! Para ativar sua conta, clique no link abaixo:

${webserver.getOrigin()}/cadastro/ativar/${token}

Se você não solicitou a criação desta conta, ignore este e-mail.

Obrigado,
Equipe Clone Tabnews`,
  });
}
async function findActivationByToken(token) {
  const result = await database.query({
    text: `SELECT 
            * 
           FROM 
              user_activation_tokens 
            WHERE 
              expires_at > NOW() AND 
              used_at IS NULL AND 
              id = $1;`,
    values: [token],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      action: "O token de ativação não foi encontrado no sistema ou expirou.",
      message: "Faça um novo cadastro.",
    });
  }

  const userActivationToken = result.rows[0];
  await markTokenAsUsed(userActivationToken.id);

  return userActivationToken;
}

async function markTokenAsUsed(id) {
  const result = await database.query({
    text: `Update 
              user_activation_tokens 
            SET 
              used_at = NOW(),
              updated_at = NOW() 
            WHERE id = $1 
            RETURNING *;`,
    values: [id],
  });

  return result.rows[0];
}

const activation = {
  sendEmailToUser,
  create,
  findActivationByToken,
  markTokenAsUsed,
};

export default activation;
