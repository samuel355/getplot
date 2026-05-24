import { useAuth, useUser } from '@clerk/clerk-expo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { checkApprovalStatus } from '../lib/api';
import { getApprovalFromClerkUser, type ApprovalStatus } from '../lib/auth';

const POLL_MS = 30_000;

type Options = {
  /** Poll every 30s (approval screen). Default false. */
  poll?: boolean;
  /** Set false to disable fetches entirely */
  enabled?: boolean;
};

export function useApprovalStatus(options?: Options) {
  const poll = options?.poll ?? false;
  const enabled = options?.enabled ?? true;

  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollStoppedRef = useRef(false);
  const fetchingRef = useRef(false);
  const userRef = useRef(user);
  const getTokenRef = useRef(getToken);
  const userId = user?.id;

  useEffect(() => {
    userRef.current = user;
    getTokenRef.current = getToken;
  }, [user, getToken]);

  const stopPolling = useCallback(() => {
    pollStoppedRef.current = true;
  }, []);

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      const currentUser = userRef.current;
      if (!currentUser || fetchingRef.current) return null;
      const silent = opts?.silent ?? false;

      fetchingRef.current = true;
      if (!silent) {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        try {
          const data = await checkApprovalStatus(() => getTokenRef.current());
          const next: ApprovalStatus = {
            isApproved: !!data.isApproved,
            role: data.role,
            area: data.area,
            lastChecked: data.lastChecked || new Date().toISOString(),
          };
          setStatus(next);
          return next;
        } catch {
          const fallback = getApprovalFromClerkUser(currentUser);
          setStatus(fallback);
          return fallback;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to check approval';
        setError(msg);
        const fallback = getApprovalFromClerkUser(currentUser);
        setStatus(fallback);
        return fallback;
      } finally {
        fetchingRef.current = false;
        setInitialLoading(false);
        if (!silent) {
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled || !isLoaded || !isSignedIn || !user) {
      if (isLoaded && !isSignedIn) {
        setInitialLoading(false);
      }
      return;
    }
    refresh();
  }, [enabled, isLoaded, isSignedIn, userId, refresh]);

  useEffect(() => {
    if (!enabled || !poll || !isLoaded || !isSignedIn || !userId) return;

    const id = setInterval(() => {
      if (!pollStoppedRef.current) {
        refresh({ silent: true });
      }
    }, POLL_MS);

    return () => clearInterval(id);
  }, [enabled, poll, isLoaded, isSignedIn, userId, refresh]);

  return {
    status,
    initialLoading,
    isRefreshing,
    error,
    refresh,
    stopPolling,
    isLoaded,
    isSignedIn,
    user,
  };
}
