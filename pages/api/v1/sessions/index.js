import { createRouter } from "next-connect";
import {
  onNoMatch,
  onError,
  setSessionCookie,
  cleanSessionCookie,
  injectAnonymousOrUser,
  canRequest,
} from "infra/controller";

import authentication from "models/authentication.js";
import authorization from "models/authorization.js";
import session from "models/session.js";
import { ForbiddenError } from "infra/errors.js";

const router = createRouter();

router.use(injectAnonymousOrUser);
router.post(canRequest("create:session"), postHandlerSessions);
router.delete(deleteHandlerSessions);

export default router.handler({
  onNoMatch,
  onError,
});

async function postHandlerSessions(request, response) {
  const userData = request.body; //JSON.parse(request.body);

  const user = await authentication.getAuthenticationUser(
    userData.email,
    userData.password,
  );

  const authorizated = await authorization.can(user.features, "create:session");

  if (!authorizated)
    throw new ForbiddenError({
      message: `O usuário não possui permissão para executar esta ação.`,
      action: `Verifique se o seu usuário possui a feature`,
    });

  const newSession = await session.create(user.id);

  setSessionCookie(response, newSession.token);

  response.status(201).json(newSession);
}

async function deleteHandlerSessions(request, response) {
  const sessionValid = await session.findOneValidByToken(
    request.cookies.session_id,
  );
  const sessionValidUpdated = await session.expireById(sessionValid.id);
  cleanSessionCookie(response);
  return response.status(200).json(sessionValidUpdated);
}
