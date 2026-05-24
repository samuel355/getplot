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
import { useApprovalStatus } from '../src/hooks/useApprovalStatus';
import { getPostApprovalRoute, SUPPORT_EMAIL } from '../src/lib/auth';
import {
  colors,
  fontSize,
  spacing,
  borderRadius,
} from '../src/constants/theme';

type Phase = 'loading' | 'pending' | 'redirecting';

export default function ApprovalScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { status, initialLoading, isRefreshing, refresh, stopPolling, user } =
    useApprovalStatus({ poll: true });

  const [phase, setPhase] = useState<Phase>('loading');
  const redirectStarted = useRef(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (initialLoading || !status) return;

    if (status.isApproved) {
      if (redirectStarted.current) return;
      redirectStarted.current = true;
      setPhase('redirecting');
      stopPolling();

      const role = status.role || (user?.publicMetadata?.role as string | undefined);
      const destination = getPostApprovalRoute(role);

      // Brief success state, then one clean navigation (matches web ~1s delay)
      const timer = setTimeout(() => {
        router.replace(destination as '/(tabs)');
      }, 800);

      return () => clearTimeout(timer);
    }

    setPhase('pending');
  }, [initialLoading, status, user, router, stopPolling]);

  const showSpinner = phase === 'loading' || (phase === 'pending' && initialLoading);
  const isApprovedView = phase === 'redirecting';
  const isPending = phase === 'pending';

  const title = isApprovedView ? 'Approved!' : isPending ? 'Pending approval' : 'Checking status';
  const message = isApprovedView
    ? "You're all set. Opening your dashboard…"
    : isPending
      ? 'Your account is awaiting approval by a system administrator.'
      : 'Verifying your account…';

  return (
    <View style={[viewStyles.root, { paddingTop: insets.top + spacing.lg }]}>
      <View style={viewStyles.blob} />

      <View style={[viewStyles.card, cardShadow]}>
        <View
          style={[
            viewStyles.iconRing,
            isApprovedView ? viewStyles.iconRingSuccess : viewStyles.iconRingPending,
          ]}
        >
          {showSpinner ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Ionicons
              name={isApprovedView ? 'checkmark-circle' : 'time-outline'}
              size={48}
              color={isApprovedView ? colors.success : colors.primaryAccent}
            />
          )}
        </View>

        <Text style={textStyles.title}>{title}</Text>
        <Text style={textStyles.message}>{message}</Text>

        {isPending && (
          <View style={viewStyles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={textStyles.infoText}>
              Please wait while a system administrator assigns you to your area. Once
              assigned, you will gain access to the dashboard.
            </Text>
          </View>
        )}

        {isApprovedView && (status?.area || status?.role) ? (
          <View style={viewStyles.approvedBox}>
            <View style={viewStyles.approvedHeader}>
              <Ionicons name="checkmark-circle" size={18} color="#166534" />
              <Text style={textStyles.approvedTitle}>Approval details</Text>
            </View>
            {status?.area ? (
              <Text style={textStyles.approvedLine}>
                <Text style={textStyles.bold}>Area: </Text>
                {status.area}
              </Text>
            ) : null}
            {status?.role ? (
              <Text style={textStyles.approvedLine}>
                <Text style={textStyles.bold}>Role: </Text>
                {status.role}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={viewStyles.statusRow}>
          <View style={[viewStyles.dot, isApprovedView && viewStyles.dotSuccess]} />
          <Text style={textStyles.polling}>
            {isApprovedView
              ? 'Redirecting…'
              : isRefreshing
                ? 'Checking status…'
                : 'Status updates every 30 seconds'}
          </Text>
        </View>

        {isPending && (
          <>
            <Button
              title="Check now"
              variant="outline"
              onPress={() => refresh()}
              loading={isRefreshing}
              disabled={isRefreshing}
              fullWidth
            />
            <Button
              title="Go home"
              variant="ghost"
              onPress={() => router.replace('/(tabs)')}
              fullWidth
            />
          </>
        )}

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
  approvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryAccent,
  },
  dotSuccess: {
    backgroundColor: colors.success,
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
    fontSize: fontSize.sm,
  },
  approvedLine: { color: '#15803d', marginBottom: 4, fontSize: fontSize.sm },
  bold: { fontWeight: '700' },
  polling: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  help: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: fontSize.xs,
    color: colors.primaryAccent,
    fontWeight: '600',
  },
});
