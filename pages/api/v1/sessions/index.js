import { createRouter } from "next-connect";

import {
  onNoMatch,
  onError,
  setSessionCookie,
  cleanSessionCookie,
  injectAnonymousOrUser,
  canRequest,
} from "infra/controller";

import autentication from "models/autentication.js";
import session from "models/session.js";

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
  console.log("request.context", request.context);

  const user = await autentication.getAutenticationUser(
    userData.email,
    userData.password,
  );
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
