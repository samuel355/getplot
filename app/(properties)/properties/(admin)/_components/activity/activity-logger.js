import useActivityLogStore from "../_store/useActivityLogStore";

export const logActivity = async ({
  type,
  action,
  details,
  userId,
  status = "success",
  metadata = {},
}) => {
  const { createLog } = useActivityLogStore.getState();

  return createLog({
    type,
    action,
    details,
    user_id: userId,
    status,
    metadata,
  });
};

export const LOG_TYPES = {
  PROPERTY: "property",
  USER: "user",
  SETTINGS: "settings",
  SYSTEM: "system",
};

export const LOG_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  APPROVE: "approve",
  REJECT: "reject",
  BAN: "ban",
  UNBAN: "unban",
  ROLE_CHANGE: "role_change",
  SETTINGS_UPDATE: "settings_update",
  LOGIN: "login",
  LOGOUT: "logout",
};
