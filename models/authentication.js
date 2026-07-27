import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError, NotFoundError } from "infra/errors.js";

async function getAuthenticationUser(email, passwordinput) {
  // const authUser = await user.login(email, password);
  try {
    const authUser = await user.findByEmail(email);
    const isMatch = await password.verify(passwordinput, authUser.password);
    if (!isMatch) {
      throw new UnauthorizedError({});
    }
    return authUser;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw new UnauthorizedError({ status_code: 401 });
    }
    throw error;
  }
}

const authentication = {
  getAuthenticationUser,
};

export default authentication;
