import { useAuth, useUser } from '@clerk/clerk-expo';
import { useCallback, useEffect, useState } from 'react';
import { checkApprovalStatus } from '../lib/api';
import { getApprovalFromClerkUser, type ApprovalStatus } from '../lib/auth';

const POLL_MS = 30_000;

export function useApprovalStatus(options?: { poll?: boolean }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return null;
    setChecking(true);
    setError(null);
    try {
      try {
        const data = await checkApprovalStatus(getToken);
        const next: ApprovalStatus = {
          isApproved: !!data.isApproved,
          role: data.role,
          area: data.area,
          lastChecked: data.lastChecked || new Date().toISOString(),
        };
        setStatus(next);
        return next;
      } catch {
        const fallback = getApprovalFromClerkUser(user);
        setStatus(fallback);
        return fallback;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to check approval';
      setError(msg);
      const fallback = getApprovalFromClerkUser(user);
      setStatus(fallback);
      return fallback;
    } finally {
      setChecking(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    refresh();
    if (options?.poll === false) return;
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [isLoaded, isSignedIn, user, refresh, options?.poll]);

  return { status, checking, error, refresh, isLoaded, isSignedIn, user };
}
