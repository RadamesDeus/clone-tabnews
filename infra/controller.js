import { InternalServerError, MethodNotAllowedError } from "infra/errors";


export function onNoMatch(req, res) {
  const publicErroObject = new MethodNotAllowedError();
  console.error(publicErroObject);
  res.status(publicErroObject.status_code).json(publicErroObject);
}
export function onError(err, req, res) {
  const publicErroObject = new InternalServerError({ cause: err, status_code: err.status_code });
  console.error(publicErroObject);
  res.status(publicErroObject.status_code).json(publicErroObject);
}