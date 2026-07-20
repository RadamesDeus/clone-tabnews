import { Permissions } from "infra/rule.js";

async function can(userContext, requestFeature, resourceTarget) {
  let authorized = false;

  if (userContext.features.includes(Permissions.ADMIN)) return true;

  if (userContext.features.includes(requestFeature)) authorized = true;

  if (requestFeature === Permissions.USER_UPDATE && resourceTarget) {
    authorized = false;
    if (
      userContext.username === resourceTarget.username ||
      userContext.features.includes(Permissions.USER_UPDATE_OTHER)
    ) {
      authorized = true;
    }
  }

  return authorized;
}

const filterOutput = async (userContext, requestFeature, resourceTarget) => {
  if (!resourceTarget) return null;

  if (requestFeature === Permissions.USER_READ) {
    return {
      id: resourceTarget.id,
      username: resourceTarget.username,
      features: resourceTarget.features,
      created_at: resourceTarget.created_at,
      updated_at: resourceTarget.updated_at,
    };
  }

  if (
    requestFeature === Permissions.USER_READ_SELF &&
    userContext.id === resourceTarget.id
  ) {
    return {
      id: resourceTarget.id,
      username: resourceTarget.username,
      email: resourceTarget.email,
      features: resourceTarget.features,
      created_at: resourceTarget.created_at,
      updated_at: resourceTarget.updated_at,
    };
  }

  if (
    requestFeature === Permissions.SESSION_READ &&
    userContext.id === resourceTarget.user_id
  ) {
    return {
      id: resourceTarget.id,
      token: resourceTarget.token,
      user_id: resourceTarget.user_id,
      created_at: resourceTarget.created_at,
      updated_at: resourceTarget.updated_at,
      expires_at: resourceTarget.expires_at,
    };
  }

  if (requestFeature === Permissions.ACTIVATION_TOKEN) {
    return {
      id: resourceTarget.id,
      used_at: resourceTarget.used_at,
      user_id: resourceTarget.user_id,
      expires_at: resourceTarget.expires_at,
      created_at: resourceTarget.created_at,
      updated_at: resourceTarget.updated_at,
    };
  }

  if (
    requestFeature === Permissions.MIGRATION_READ ||
    requestFeature === Permissions.MIGRATION_RUN
  ) {
    return resourceTarget.map((migration) => {
      return {
        name: migration.name,
        path: migration.path,
        timestamp: migration.timestamp,
      };
    });
  }

  return null;
};

const authorization = {
  can,
  filterOutput,
};

export default authorization;
