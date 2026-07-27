import { createRouter } from "next-connect";
import controller, { onNoMatch, onError } from "infra/controller";
import { Permissions } from "infra/rule.js";

import authentication from "models/authentication.js";
import authorization from "models/authorization.js";
import session from "models/session.js";
import { ForbiddenError } from "infra/errors.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(
  controller.canRequest(Permissions.SESSION_CREATE),
  postHandlerSessions,
);
router.delete(deleteHandlerSessions);

export default router.handler({
  onNoMatch,
  onError,
});

async function postHandlerSessions(request, response) {
  const userData = request.body; //JSON.parse(request.body);

  const userAuthenticated = await authentication.getAuthenticationUser(
    userData.email,
    userData.password,
  );

  const authorizated = await authorization.can(
    userAuthenticated,
    Permissions.SESSION_CREATE,
  );

  if (!authorizated)
    throw new ForbiddenError({
      message: `O usuário não possui permissão para executar esta ação.`,
      action: `Verifique se o seu usuário possui a feature`,
    });

  const newSession = await session.create(userAuthenticated.id);
  controller.setSessionCookie(response, newSession.token);

  const output = await authorization.filterOutput(
    userAuthenticated,
    Permissions.SESSION_READ,
    newSession,
  );

  response.status(201).json(output);
}

async function deleteHandlerSessions(request, response) {
  const sessionValid = await session.findOneValidByToken(
    request.cookies.session_id,
  );
  const sessionValidUpdated = await session.expireById(sessionValid.id);
  controller.cleanSessionCookie(response);

  const userContext = request.context?.user;
  const output = await authorization.filterOutput(
    userContext,
    Permissions.SESSION_READ,
    sessionValidUpdated,
  );
  return response.status(200).json(output);
}
