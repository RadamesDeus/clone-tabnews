import { createRouter } from "next-connect";

import { onNoMatch, onError, setSessionCookie } from "infra/controller";

import autentication from "models/autentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandlerSessions);

export default router.handler({
  onNoMatch,
  onError,
});

async function postHandlerSessions(request, response) {
  const userData = request.body; //JSON.parse(request.body);

  const user = await autentication.getAutenticationUser(
    userData.email,
    userData.password,
  );
  const newSession = await session.create(user.id);

  setSessionCookie(response, newSession.token);

  response.status(201).json(newSession);
}
