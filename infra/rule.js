const user_role = {
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_UPDATE_OTHER: "user:update:other",
  USER_DELETE: "user:delete",
  USER_READ: "user:read",
  USER_READ_SELF: "user:read:self",
  USER_READ_OTHER: "user:read:other",
};

const session_role = {
  SESSION_CREATE: "session:create",
  SESSION_READ: "session:read",
};

const status_role = {
  STATUS_READ_FULL: "status:read:full",
  STATUS_READ: "status:read",
};

const migration_role = {
  MIGRATION_RUN: "migration:run",
  MIGRATION_READ: "migration:read",
};

const activation_role = {
  ACTIVATION_TOKEN: "activation:token",
};

const admin_role = {
  ADMIN: "admin",
};

export const Permissions = {
  ...admin_role,
  ...user_role,
  ...session_role,
  ...migration_role,
  ...activation_role,
  ...status_role,
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
