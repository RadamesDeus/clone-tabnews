import { createRouter } from "next-connect";

import controller, { onNoMatch, onError } from "infra/controller";
import session from "models/session.js";
import user from "models/user.js";
import { Permissions } from "infra/rule.js";

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

  return response.status(200).json(userFound);
}
