import email from "infra/email.js";
import { Permissions } from "infra/rule.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import { NotFoundError, ForbiddenError } from "infra/errors.js";
import user from "models/user.js";
import authorization from "models/authorization.js";
import { validate } from "uuid";

const EXPIRE_TOKENS_AT_IN_MILLISECONDS = 60 * 15 * 1000; //15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRE_TOKENS_AT_IN_MILLISECONDS);

  const result = await database.query({
    text: `INSERT INTO user_activation_tokens (user_id, expires_at) VALUES ($1, $2) RETURNING *;`,
    values: [userId, expiresAt],
  });

  return result.rows[0];
}

async function sendEmailToUser(userSend, token) {
  await email.sendEmail({
    from: "Clone Tabnews <contato@radames.dev.br>",
    to: `${userSend.userSendname} <${userSend.email}>`,
    subject: "Ative seu cadastro no Clone Tabnews",
    text: `Olá, ${userSend.username}! Para ativar sua conta, clique no link abaixo:

${webserver.getOrigin()}/cadastro/ativar/${token}

Se você não solicitou a criação desta conta, ignore este e-mail.

Obrigado,
Equipe Clone Tabnews`,
  });
}
async function findActivationByToken(token) {
  const NotFoundErrorObject = new NotFoundError({
    action: "O token de ativação não foi encontrado no sistema ou expirou.",
    message: "Faça um novo cadastro.",
  });

  if (!validate(token)) {
    throw new NotFoundError(NotFoundErrorObject);
  }

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
    throw new NotFoundError(NotFoundErrorObject);
  }

  return result.rows[0];
}

async function activateUserbyUserId(userId) {
  const userToActivate = await user.findOneById(userId);
  const isauthorizated = await authorization.can(
    userToActivate,
    Permissions.ACTIVATION_TOKEN,
  );

  if (!isauthorizated) {
    throw new ForbiddenError({
      message: `O usuário não possui token de ativação.`,
      action: `Entre em contato com o suporte do sistema.`,
    });
  }

  const features = [
    Permissions.SESSION_CREATE,
    Permissions.SESSION_READ,
    Permissions.USER_READ,
    Permissions.USER_UPDATE,
  ];
  await user.setFeatures(userId, features);
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
  activateUserbyUserId,
  EXPIRE_TOKENS_AT_IN_MILLISECONDS,
};

export default activation;
