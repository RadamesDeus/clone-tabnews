import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(userInputValues) {
  await getEmailDuplicate(userInputValues.email);
  await getUsernameDuplicate(userInputValues.username);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const result = await database.query({
      text: `INSERT INTO users (username, email, password)
            VALUES ($1,$2,$3)
              returning *
              ;`,
      values: [
        userInputValues.username.trim(),
        userInputValues.email.trim(),
        userInputValues.password.trim(),
      ],
    });

    return result.rows[0];
  }
}

async function getEmailDuplicate(email) {
  const result = await database.query({
    text: `SELECT email FROM users WHERE LOWER(email) = LOWER($1)`,
    values: [email],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      cause: "Email já cadastrado.",
      action: "Utilize outro email para essa operação.",
      message: "Erro ao execultar essa operação.",
      status_code: 400,
    });
  }
}

async function getUsernameDuplicate(username) {
  const result = await database.query({
    text: `SELECT username FROM users WHERE LOWER(username) = LOWER($1)`,
    values: [username],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      cause: "Username já cadastrado.",
      action: "Utilize outro username para essa operação.",
      message: "Ocorreu um erro de validação.",
      status_code: 400,
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const result = await password.hash(userInputValues.password);
  userInputValues.password = result;

  return userInputValues;
}

async function findByUsername(username) {
  const result = await database.query({
    text: `SELECT 
          * 
          FROM users 
          WHERE LOWER(username) = LOWER($1) LIMIT 1;`,
    values: [username],
  });

  if (result.rowCount == 0) {
    throw new NotFoundError({
      cause: "Username não encontrado.",
      action: "verifique o username e tente novamente.",
      message: `O username informado [${username}] não existe.`,
      status_code: 404,
    });
  }
  return result.rows[0];
}

async function update(username, userInputValue) {
  const currentUser = await findByUsername(username);

  if (
    userInputValue.username &&
    userInputValue.username.toLowerCase() !== currentUser.username.toLowerCase()
  ) {
    await getUsernameDuplicate(userInputValue.username);
  }
  if (userInputValue.email && userInputValue.email.toLowerCase() !== currentUser.email.toLowerCase()) {
    await getEmailDuplicate(userInputValue.email);
  }

  const userUpdated = { ...currentUser, ...userInputValue };

  if (userInputValue.password) {
    await hashPasswordInObject(userUpdated);
  }

  const result = await database.query({
    text: `UPDATE  
            users
          SET
            username = $1,
            email = $2,
            password = $3,
            updated_at = timezone('utc'::text, now())
          WHERE id = $4
          RETURNING *;`,
    values: [
      userUpdated.username,
      userUpdated.email,
      userUpdated.password,
      userUpdated.id,
    ],
  });

  return result.rows[0];
}

const user = {
  create,
  findByUsername,
  update,
};

export default user;
