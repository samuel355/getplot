import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/ui/Button';
import { Loading } from '../src/components/ui/Loading';
import { ACCEPTED_ROLES } from '../src/constants/developments';
import { colors, fontSize, spacing } from '../src/constants/theme';

export default function ApprovalScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [approved, setApproved] = useState(false);
  const [role, setRole] = useState<string>();

  const checkStatus = useCallback(() => {
    if (!user) return;
    const userRole = (user.publicMetadata?.role as string) || '';
    const userEmail =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress;
    const isApproved =
      userEmail === 'samueloseiboatenglistowell57@gmail.com' ||
      (userRole && ACCEPTED_ROLES.includes(userRole as (typeof ACCEPTED_ROLES)[number]));

    setApproved(!!isApproved);
    setRole(userRole);
    setChecking(false);

    if (isApproved) {
      setTimeout(() => {
        if (userRole === 'chief' || userRole === 'chief_asst') {
          router.replace('/admin');
        } else if (userRole === 'admin' || userRole === 'sysadmin') {
          router.replace('/admin');
        } else if (userRole === 'property_agent') {
          router.replace('/(tabs)/marketplace');
        } else {
          router.replace('/(tabs)');
        }
      }, 1200);
    }
  }, [user, router]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
      return;
    }
    if (isLoaded && user) {
      checkStatus();
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoaded, isSignedIn, user, checkStatus, router]);

  if (!isLoaded || checking) return <Loading />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{approved ? 'Approved!' : 'Pending Approval'}</Text>
      <Text style={styles.body}>
        {approved
          ? 'Redirecting you to your dashboard...'
          : 'Your account is awaiting approval by a system administrator. Once assigned a role, you will gain full access.'}
      </Text>
      {role ? <Text style={styles.role}>Current role: {role || 'none'}</Text> : null}
      <Button title="Check Now" variant="outline" onPress={checkStatus} />
      <Button title="Go Home" variant="ghost" onPress={() => router.replace('/(tabs)')} />
      <Text style={styles.help}>
        Need help? landandhomesconsult@gmail.com
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  role: { textAlign: 'center', marginBottom: spacing.lg, fontWeight: '600' },
  help: { textAlign: 'center', marginTop: spacing.xl, fontSize: fontSize.sm, color: colors.textMuted },
});
