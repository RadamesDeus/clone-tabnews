import { createRouter } from "next-connect";

import controller, { onNoMatch, onError } from "infra/controller";
import session from "models/session.js";
import user from "models/user.js";
import { Permissions } from "infra/rule.js";
import authorization from "models/authorization.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest(Permissions.SESSION_READ), getHandlerUser);

export default router.handler({
  onNoMatch,
  onError,
});

async function getHandlerUser(request, response) {
  const sessionValid = await session.findOneValidByToken(
    request.cookies.session_id,
  );

  const sessionUpdated = await session.updateById(sessionValid.id);

  const userFound = await user.findOneById(sessionUpdated.user_id);

  controller.setSessionCookie(response, sessionUpdated.token);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );

  const userContext = request.context?.user;
  const output = await authorization.filterOutput(
    userContext,
    Permissions.USER_READ_SELF,
    userFound,
  );

  return response.status(200).json(output);
}
