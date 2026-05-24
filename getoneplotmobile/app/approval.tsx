import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui/Button';
import { Loading } from '../src/components/ui/Loading';
import { useApprovalStatus } from '../src/hooks/useApprovalStatus';
import { getPostApprovalRoute, SUPPORT_EMAIL } from '../src/lib/auth';
import {
  colors,
  fontSize,
  spacing,
  borderRadius,
} from '../src/constants/theme';

export default function ApprovalScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View style={[viewStyles.root, { paddingTop: insets.top + spacing.lg }]}>
      <View style={viewStyles.blob} />

      <View style={[viewStyles.card, cardShadow]}>
        <View
          style={[
            viewStyles.iconRing,
            approved ? viewStyles.iconRingSuccess : viewStyles.iconRingPending,
          ]}
        >
          {checking ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Ionicons
              name={approved ? 'checkmark-circle' : 'time'}
              size={48}
              color={approved ? colors.success : colors.primaryAccent}
            />
          )}
        </View>

        <Text style={textStyles.title}>{approved ? 'You’re approved' : 'Pending approval'}</Text>
        <Text style={textStyles.message}>
          {checking
            ? 'Checking your approval status…'
            : approved
              ? 'Your account is ready. Taking you to your dashboard.'
              : 'Your account is awaiting approval by a system administrator.'}
        </Text>

        {!approved && (
          <View style={viewStyles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={textStyles.infoText}>
              Please wait while an administrator assigns you to your area. Once assigned,
              you’ll get full access to the app.
            </Text>
          </View>
        )}

        {approved && (status?.area || role) ? (
          <View style={viewStyles.approvedBox}>
            <Text style={textStyles.approvedTitle}>Account details</Text>
            {status?.area ? (
              <Text style={textStyles.approvedLine}>
                <Text style={textStyles.bold}>Area: </Text>
                {status.area}
              </Text>
            ) : null}
            {role ? (
              <Text style={textStyles.approvedLine}>
                <Text style={textStyles.bold}>Role: </Text>
                {role}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Text style={textStyles.polling}>
          {redirecting ? 'Redirecting…' : 'Status refreshes every 30 seconds'}
        </Text>

        <Button
          title="Check now"
          variant="outline"
          onPress={refresh}
          loading={checking}
          disabled={redirecting}
          fullWidth
        />
        <Button
          title="Browse as guest"
          variant="ghost"
          onPress={() => router.replace('/(tabs)')}
          disabled={redirecting}
          fullWidth
        />

        <Text
          style={textStyles.help}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
        >
          Need help? {SUPPORT_EMAIL}
        </Text>
      </View>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  android: { elevation: 10 },
});

const viewStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    top: 80,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primaryAccent,
    opacity: 0.3,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconRingSuccess: { backgroundColor: '#dcfce7' },
  iconRingPending: { backgroundColor: 'rgba(99, 102, 241, 0.12)' },
  infoBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#eff6ff',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  approvedBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
});

const textStyles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  approvedTitle: {
    fontWeight: '700',
    color: '#166534',
    marginBottom: spacing.sm,
    fontSize: fontSize.sm,
  },
  approvedLine: { color: '#15803d', marginBottom: 4, fontSize: fontSize.sm },
  bold: { fontWeight: '700' },
  polling: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.lg,
  },
  help: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: fontSize.xs,
    color: colors.primaryAccent,
    fontWeight: '600',
  },
});
