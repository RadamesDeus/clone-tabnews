import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";

async function create(userInputVlaues) {
  await getEmailDuplicate(userInputVlaues.email);
  await getUsernameDuplicate(userInputVlaues.username);

  const newUser = await runInsertQuery(userInputVlaues);
  return newUser;

  async function getEmailDuplicate(email) {
    const result = await database.query({
      text: `SELECT email FROM users WHERE LOWER(email) = LOWER($1)`,
      values: [email],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        cause: "Email já cadastrado.",
        action: "Utilize outro email para criar sua conta.",
        message: "Erro ao Eecutar a criação do usuário.",
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
        action: "Utilize outro username para criar sua conta.",
        message: "Erro ao Eecutar a criação do usuário.",
        status_code: 400,
      });
    }
  }

  async function runInsertQuery(userInputVlaues) {
    const result = await database.query({
      text: `INSERT INTO users (username, email, password)
            VALUES ($1,$2,$3)
              returning *
              ;`,
      values: [
        userInputVlaues.username,
        userInputVlaues.email,
        userInputVlaues.password,
      ],
    });

    return result.rows[0];
  }
}

const user = {
  create,
};

export default user;
