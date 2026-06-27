import { createRouter } from "next-connect";

import { onNoMatch, onError, setSessionCookie } from "infra/controller";
import session from "models/session.js";
import user from "models/user.js";

const router = createRouter();

router.get(getHandlerUser);

export default router.handler({
  onNoMatch,
  onError,
});

async function getHandlerUser(request, response) {
  const sessionValid = await session.findOneValidByToken(
    request.cookies.session_id,
  );
  console.log("sessionValid", sessionValid);

  const sessionUpdated = await session.updateById(sessionValid.id);

  const userFound = await user.findOneById(sessionUpdated.user_id);

  setSessionCookie(response, sessionUpdated.token);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );

  return response.status(200).json(userFound);
}
