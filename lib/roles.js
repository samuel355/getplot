export const ROLES = {
  SYSADMIN: "sysadmin",
  ADMIN: "admin",
  AGENT: "agent",
  PROPERTY_AGENT: "property_agent",
  LAND_MANAGER: "land_manager",
  CHIEF: "chief",
  CHIEF_ASST: "chief_asst",
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
  return role === ROLES.AGENT || role === ROLES.PROPERTY_AGENT || role === ROLES.SYSADMIN;
}

export function isLandManager(user) {
  const role = getUserRole(user);
  return (
    role === ROLES.LAND_MANAGER ||
    role === ROLES.CHIEF ||
    role === ROLES.CHIEF_ASST ||
    role === ROLES.SYSADMIN
  );
}

// Sites assigned to a land manager (array of slugs)
export function getUserSites(user) {
  const metadata = user?.publicMetadata ?? {};
  const sites = Array.isArray(metadata.sites) ? metadata.sites : [];
  const areas = Array.isArray(metadata.areas) ? metadata.areas : metadata.area ? [metadata.area] : [];

  return [...new Set([...sites, ...areas.map(normalizeSiteAssignment).filter(Boolean)])];
}

// Can the user manage a specific site?
export function canManageSite(user, siteSlug) {
  if (isSysadmin(user)) return true;
  if (!isLandManager(user)) return false;
  return getUserSites(user).includes(siteSlug);
}

function normalizeSiteAssignment(value) {
  const map = {
    asokore_mampong: "asokore-mampong",
    royal_court_estate: "royal-court-estate",
    legon_hills: "legon-hills",
    dar_es_salaam: "ejisu-adense",
    nthc: "kwadaso-nthc",
    new_trabuom: "trabuom-sector-2",
    trabuom: "trabuom-sector-1",
  };

  return map[value] ?? value;
}

// Where should a logged-in user land after sign-in?
export function getPortalPath(role) {
  switch (role) {
    case ROLES.SYSADMIN:
    case ROLES.ADMIN:
      return "/dashboard";
    case ROLES.AGENT:
    case ROLES.PROPERTY_AGENT:
      return "/agent";
    case ROLES.LAND_MANAGER:
    case ROLES.CHIEF:
    case ROLES.CHIEF_ASST:
      return "/manager";
    default:
      return "/approval";
  }
}
