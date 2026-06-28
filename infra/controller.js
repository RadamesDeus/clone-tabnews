import * as cookie from "cookie";

import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors.js";
import session from "models/session.js";

export function onNoMatch(req, res) {
  const publicErroObject = new MethodNotAllowedError();
  console.error(publicErroObject);
  res.status(publicErroObject.status_code).json(publicErroObject);
}
export function onError(err, req, res) {
  if (err instanceof ValidationError || err instanceof NotFoundError) {
    return res.status(err.status_code).json(err);
  }

  if (err instanceof UnauthorizedError) {
    cleanSessionCookie(res);
    return res.status(err.status_code).json(err);
  }

  const publicErroObject = new InternalServerError({
    cause: err,
  });
  console.error(publicErroObject);
  res.status(publicErroObject.status_code).json(publicErroObject);
}

export function setSessionCookie(response, sessionToken) {
  const setCookes = cookie.serialize("session_id", sessionToken, {
    httpOnly: true,
    path: "/",
    maxAge: session.EXPIRESATINDAYS_IN_MILLSECOND / 1000,
    secure: process.env.NODE_ENV === "production",
  });

  response.setHeader("Set-Cookie", setCookes);
}

export function cleanSessionCookie(response) {
  const setCookes = cookie.serialize("session_id", "invalid", {
    httpOnly: true,
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
  });

  response.setHeader("Set-Cookie", setCookes);
}
