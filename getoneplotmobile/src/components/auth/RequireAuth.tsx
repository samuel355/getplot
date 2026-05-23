import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Loading } from '../ui/Loading';

type Props = {
  children: ReactNode;
};

/**
 * Redirects unauthenticated users to sign-in (same as web middleware for protected routes).
 */
export function RequireAuth({ children }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace('/(auth)/sign-in');
    }
  }, [isLoaded, isSignedIn, router, segments]);

  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <Loading />;

  return <>{children}</>;
}
