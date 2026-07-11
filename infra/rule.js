const user_role = {
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_UPDATE_OTHER: "user:update:other",
  USER_DELETE: "user:delete",
  USER_READ: "user:read",
};

const session_role = {
  SESSION_CREATE: "session:create",
  SESSION_READ: "session:read",
};

const activation_role = {
  ACTIVATION_TOKEN: "activation:token",
};

export const Permissions = {
  ...user_role,
  ...session_role,
  ...activation_role,
  ADMIN: "admin",
};

export const Roles = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
};

export const ROLE_PERMISSIONS = {
  [Roles.ADMIN]: [
    Permissions.USER_CREATE,
    Permissions.USER_UPDATE,
    Permissions.USER_DELETE,
    Permissions.PRODUCT_CREATE,
    Permissions.PRODUCT_UPDATE,
  ],

  [Roles.MANAGER]: [Permissions.PRODUCT_CREATE, Permissions.PRODUCT_UPDATE],

  [Roles.USER]: [],
};
