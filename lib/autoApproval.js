export const AUTO_SYSADMIN_EMAIL = "samueloseiboatenglistowell57@gmail.com";
export const AUTO_SYSADMIN_ROLE = "sysadmin";

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isAutoSysadminEmail(email) {
  return normalizeEmail(email) === AUTO_SYSADMIN_EMAIL;
}

export function getUserPrimaryEmail(user) {
  const primaryEmailId = user?.primaryEmailAddressId || user?.primary_email_address_id;
  const emailAddresses = user?.emailAddresses || user?.email_addresses || [];
  const primaryEmail = emailAddresses.find((email) => email.id === primaryEmailId);

  return (
    user?.primaryEmailAddress?.emailAddress ||
    user?.primary_email_address?.email_address ||
    primaryEmail?.emailAddress ||
    primaryEmail?.email_address ||
    emailAddresses?.[0]?.emailAddress ||
    emailAddresses?.[0]?.email_address ||
    ""
  );
}

export function getEffectiveRole(user) {
  const role = user?.publicMetadata?.role || user?.public_metadata?.role;
  if (isAutoSysadminEmail(getUserPrimaryEmail(user))) return AUTO_SYSADMIN_ROLE;
  return role;
}

export async function ensureAutoSysadminMetadata(clerkClient, user) {
  if (!user?.id || !isAutoSysadminEmail(getUserPrimaryEmail(user))) return user;

  const publicMetadata = user.publicMetadata || user.public_metadata || {};
  if (publicMetadata.role === AUTO_SYSADMIN_ROLE) return user;

  return await clerkClient.users.updateUserMetadata(user.id, {
    publicMetadata: {
      ...publicMetadata,
      role: AUTO_SYSADMIN_ROLE,
    },
  });
}
