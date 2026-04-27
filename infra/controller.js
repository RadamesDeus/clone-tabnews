import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors";

export function onNoMatch(req, res) {
  const publicErroObject = new MethodNotAllowedError();
  console.error(publicErroObject);
  res.status(publicErroObject.status_code).json(publicErroObject);
}
export function onError(err, req, res) {
  if (
    err instanceof ValidationError ||
    err instanceof NotFoundError ||
    err instanceof UnauthorizedError
  ) {
    return res.status(err.status_code).json(err);
  }

  const publicErroObject = new InternalServerError({
    cause: err,
  });
  console.error(publicErroObject);
  res.status(publicErroObject.status_code).json(publicErroObject);
}
