import { Permissions } from "infra/rule.js";

async function can(userContext, requestFeature, resourceTarget) {
  let authorized = false;

  if (userContext.features.includes(Permissions.ADMIN)) authorized = true;
  if (userContext.features.includes(requestFeature)) authorized = true;

  if (requestFeature === Permissions.USER_UPDATE && resourceTarget) {
    authorized = false;
    if (userContext.username === resourceTarget.username) authorized = true;
  }

  return authorized;
}

const authorization = {
  can,
};

export default authorization;
