import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/ui/Button';
import { Loading } from '../src/components/ui/Loading';
import { useApprovalStatus } from '../src/hooks/useApprovalStatus';
import { getPostApprovalRoute, SUPPORT_EMAIL } from '../src/lib/auth';
import { colors, fontSize, spacing } from '../src/constants/theme';

export default function ApprovalScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { status, checking, refresh, user } = useApprovalStatus({ poll: true });
  const [redirecting, setRedirecting] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!status?.isApproved || redirected.current) return;
    redirected.current = true;
    setRedirecting(true);
    const role = status.role || (user?.publicMetadata?.role as string);
    const destination = getPostApprovalRoute(role);
    const t = setTimeout(() => {
      router.replace(destination as '/admin');
    }, 1100);
    return () => clearTimeout(t);
  }, [status?.isApproved, status?.role, user, router]);

  if (!isLoaded || (!status && checking)) return <Loading />;

  const approved = status?.isApproved;
  const role = status?.role;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          {checking ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Text style={styles.icon}>{approved ? '✓' : '⏳'}</Text>
          )}
        </View>

        <Text style={styles.title}>{approved ? 'Approved!' : 'Pending Approval'}</Text>
        <Text style={styles.message}>
          {checking
            ? 'Checking your approval status…'
            : approved
              ? "Congratulations! You've been approved."
              : 'Your account is awaiting approval by a system administrator'}
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Please wait while a system administrator assigns you to your area. Once
            assigned, you will gain access to the dashboard.
          </Text>
        </View>

        {approved && (
          <View style={styles.approvedBox}>
            <Text style={styles.approvedTitle}>Approval details</Text>
            {status?.area ? (
              <Text style={styles.approvedLine}>
                <Text style={styles.bold}>Area:</Text> {status.area}
              </Text>
            ) : null}
            {role ? (
              <Text style={styles.approvedLine}>
                <Text style={styles.bold}>Role:</Text> {role}
              </Text>
            ) : null}
          </View>
        )}

        <Text style={styles.waiting}>
          {redirecting ? 'Redirecting…' : 'Status updates every 30 seconds'}
        </Text>

        <Button
          title="Check Now"
          variant="outline"
          onPress={refresh}
          loading={checking}
          disabled={redirecting}
        />
        <Button
          title="Go Home"
          variant="ghost"
          onPress={() => router.replace('/(tabs)')}
          disabled={redirecting}
        />

        <Text style={styles.help}>
          Need help? Contact {SUPPORT_EMAIL}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(5, 1, 76, 0.08)',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: { color: colors.textMuted, lineHeight: 22, textAlign: 'center' },
  approvedBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  approvedTitle: { fontWeight: '700', color: '#166534', marginBottom: spacing.sm },
  approvedLine: { color: '#15803d', marginBottom: 4 },
  bold: { fontWeight: '700' },
  waiting: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  help: {
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
