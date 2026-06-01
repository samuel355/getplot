import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

type Props = {
  children: ReactNode;
};

/**
 * Redirects unauthenticated users to sign-in (same as web middleware for protected routes).
 * Use a minimal loading indicator to avoid introducing extra hooks during auth checks.
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

  // Always render children to avoid conditionally mounting/unmounting the navigation Stack
  // This keeps hook order stable. If the auth state isn't ready or user isn't signed in,
  // show a fullscreen loading overlay while redirecting to sign-in.
  const showOverlay = !isLoaded || !isSignedIn;

  return (
    <>
      {children}
      {showOverlay && (
        <View style={styles.centerOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)' },
});
