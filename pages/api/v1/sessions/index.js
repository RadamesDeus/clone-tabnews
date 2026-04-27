import { createRouter } from "next-connect";
import * as cookie from "cookie";

import { onNoMatch, onError } from "infra/controller.js";
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

  const setCookes = cookie.serialize("session_id", newSession.token, {
    httpOnly: true,
    path: "/",
    maxAge: session.EXPIRESATINDAYS_IN_MILLSECOND / 1000,
    secure: process.env.NODE_ENV === "production",
  });

  response.setHeader("Set-Cookie", setCookes);
  response.status(201).json(newSession);
}
