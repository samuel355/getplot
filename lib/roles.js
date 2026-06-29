export const ROLES = {
  SYSADMIN: "sysadmin",
  ADMIN: "admin",
  AGENT: "agent",
  LAND_MANAGER: "land_manager",
};

export function getUserRole(user) {
  return user?.publicMetadata?.role ?? null;
}

export function isSysadmin(user) {
  const role = getUserRole(user);
  return role === ROLES.SYSADMIN || role === ROLES.ADMIN;
}

export function isAgent(user) {
  const role = getUserRole(user);
  return role === ROLES.AGENT || role === ROLES.SYSADMIN;
}

export function isLandManager(user) {
  const role = getUserRole(user);
  return role === ROLES.LAND_MANAGER || role === ROLES.SYSADMIN;
}

// Sites assigned to a land manager (array of slugs)
export function getUserSites(user) {
  return user?.publicMetadata?.sites ?? [];
}

// Can the user manage a specific site?
export function canManageSite(user, siteSlug) {
  if (isSysadmin(user)) return true;
  if (getUserRole(user) !== ROLES.LAND_MANAGER) return false;
  return getUserSites(user).includes(siteSlug);
}

// Where should a logged-in user land after sign-in?
export function getPortalPath(role) {
  switch (role) {
    case ROLES.SYSADMIN:
    case ROLES.ADMIN:
      return "/dashboard";
    case ROLES.AGENT:
      return "/agent";
    case ROLES.LAND_MANAGER:
      return "/manager";
    default:
      return "/approval";
  }
}
