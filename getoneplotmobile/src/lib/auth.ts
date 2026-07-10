import { ACCEPTED_ROLES } from '../constants/developments';

export const AUTO_APPROVED_EMAIL = 'samueloseiboatenglistowell57@gmail.com';
export const AUTO_APPROVED_ROLE = 'sysadmin';
export const SUPPORT_EMAIL = 'landandhomesconsult@gmail.com';

export type ApprovalStatus = {
  isApproved: boolean;
  role?: string;
  area?: string;
  lastChecked: string;
};

export type ClerkUserLike = {
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: { emailAddress: string }[];
  publicMetadata?: Record<string, unknown>;
};

/** Same rules as app/api/approval-status/route.js */
export function getApprovalFromClerkUser(user: ClerkUserLike | null | undefined): ApprovalStatus {
  const userRole = (user?.publicMetadata?.role as string) || undefined;
  const userArea = (user?.publicMetadata?.area as string) || undefined;
  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress;
  const isAutoApproved = userEmail?.trim().toLowerCase() === AUTO_APPROVED_EMAIL;
  const effectiveRole = isAutoApproved ? AUTO_APPROVED_ROLE : userRole;

  const isApproved =
    isAutoApproved ||
    (!!effectiveRole && ACCEPTED_ROLES.includes(effectiveRole as (typeof ACCEPTED_ROLES)[number]));

  return {
    isApproved: !!isApproved,
    role: effectiveRole,
    area: userArea,
    lastChecked: new Date().toISOString(),
  };
}

/** Mobile home routes after approval — mirrors web approval redirects */
export function getPostApprovalRoute(role?: string): string {
  if (role === 'chief' || role === 'chief_asst') {
    return '/admin';
  }
  if (role === 'admin' || role === 'sysadmin') {
    return '/admin';
  }
  if (role === 'property_agent') {
    return '/(tabs)/marketplace';
  }
  return '/(tabs)';
}

export function formatClerkError(error: unknown): string {
  if (error && typeof error === 'object' && 'errors' in error) {
    const errs = (error as { errors: { message?: string; longMessage?: string }[] }).errors;
    if (errs?.[0]?.longMessage) return errs[0].longMessage;
    if (errs?.[0]?.message) return errs[0].message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
