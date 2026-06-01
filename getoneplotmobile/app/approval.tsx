import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../src/components/ui/Button";
import { useApprovalStatus } from "../src/hooks/useApprovalStatus";
import { getPostApprovalRoute, SUPPORT_EMAIL } from "../src/lib/auth";
import { useTheme } from "../src/constants/theme";

type Phase = "loading" | "pending" | "redirecting";

export default function ApprovalScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize, isDark } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { status, initialLoading, isRefreshing, refresh, stopPolling, user } = useApprovalStatus({
    poll: true,
  });

  const [phase, setPhase] = useState<Phase>("loading");
  const redirectStarted = useRef(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (initialLoading || !status) return;

    if (status.isApproved) {
      if (redirectStarted.current) return;
      redirectStarted.current = true;
      setPhase("redirecting");
      stopPolling();

      const role = status.role || (user?.publicMetadata?.role as string | undefined);
      const destination = getPostApprovalRoute(role);

      const timer = setTimeout(() => {
        router.replace(destination as "/(tabs)");
      }, 800);

      return () => clearTimeout(timer);
    }

    setPhase("pending");
  }, [initialLoading, status, user, router, stopPolling]);

  const showSpinner = phase === "loading" || (phase === "pending" && initialLoading);
  const isApprovedView = phase === "redirecting";
  const isPending = phase === "pending";

  const title = isApprovedView ? "Approved!" : isPending ? "Account Pending" : "Verifying Account";
  const message = isApprovedView
    ? "Welcome back! Redirecting you to your dashboard..."
    : isPending
      ? "Your account is awaiting approval by a system administrator. This usually takes less than 24 hours."
      : "Please wait while we check your current approval status.";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[styles.blob, { backgroundColor: colors.primary, opacity: isDark ? 0.1 : 0.05 }]}
      />
      <View
        style={[
          styles.blob2,
          { backgroundColor: colors.primaryAccent, opacity: isDark ? 0.1 : 0.05 },
        ]}
      />

      <View style={[styles.container, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: 32,
            },
          ]}
        >
          {/* Visual Indicator */}
          <View
            style={[
              styles.iconRing,
              {
                backgroundColor: isApprovedView
                  ? colors.success + "15"
                  : isPending
                    ? colors.warning + "15"
                    : colors.info + "15",
              },
            ]}
          >
            {showSpinner ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <Ionicons
                name={isApprovedView ? "checkmark-circle" : "time"}
                size={48}
                color={isApprovedView ? colors.success : colors.warning}
              />
            )}
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: fontSize.xxl,
                fontWeight: fontWeight.bold as TextStyle["fontWeight"],
              },
            ]}
          >
            {title}
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary, fontSize: fontSize.base }]}>
            {message}
          </Text>

          {isPending && (
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text
                style={[
                  styles.infoText,
                  { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
                ]}
              >
                Our team is currently reviewing your application. You'll gain full access once your
                assigned area is verified.
              </Text>
            </View>
          )}

          {isApprovedView && (status?.area || status?.role) ? (
            <View
              style={[
                styles.approvedBox,
                {
                  backgroundColor: colors.success + "10",
                  borderColor: colors.success + "30",
                  borderRadius: borderRadius.lg,
                },
              ]}
            >
              <View style={styles.approvedHeader}>
                <Ionicons name="ribbon" size={20} color={colors.success} />
                <Text
                  style={[
                    styles.approvedTitle,
                    { color: colors.success, fontSize: fontSize.md, fontWeight: "700" },
                  ]}
                >
                  Account verified
                </Text>
              </View>
              <View style={{ gap: 4 }}>
                {status?.area && (
                  <Text style={[styles.approvedLine, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: "700" }}>Area: </Text>
                    {status.area}
                  </Text>
                )}
                {status?.role && (
                  <Text style={[styles.approvedLine, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: "700" }}>Role: </Text>
                    {status.role.replace(/_/g, " ").toUpperCase()}
                  </Text>
                )}
              </View>
            </View>
          ) : null}

          {/* Action Row */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.pulse,
                { backgroundColor: isApprovedView ? colors.success : colors.warning },
              ]}
            />
            <Text style={[styles.polling, { color: colors.textMuted, fontSize: fontSize.xs }]}>
              {isApprovedView
                ? "Launching your console..."
                : isRefreshing
                  ? "Updating status..."
                  : "Auto-refreshing every 30s"}
            </Text>
          </View>

          {isPending && (
            <View style={{ gap: spacing.md, width: "100%" }}>
              <Button
                title="Refresh Status"
                variant="primary"
                onPress={() => refresh()}
                loading={isRefreshing}
                fullWidth
                size="lg"
              />
              <Button
                title="Back to marketplace"
                variant="ghost"
                onPress={() => router.replace("/(tabs)")}
                fullWidth
              />
            </View>
          )}
        </View>

        <Pressable
          style={styles.helpButton}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
        >
          <Text style={[styles.helpText, { color: colors.primary, fontSize: fontSize.sm }]}>
            Need assistance? <Text style={{ fontWeight: "700" }}>Contact Support</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  blob: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  blob2: {
    position: "absolute",
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  card: {
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    width: "100%",
  },
  infoText: {
    flex: 1,
  },
  approvedBox: {
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    width: "100%",
    gap: 12,
  },
  approvedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  approvedTitle: {},
  approvedLine: {
    fontSize: 13,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  polling: {
    fontWeight: "500",
  },
  helpButton: {
    marginTop: 32,
    alignSelf: "center",
    padding: 8,
  },
  helpText: {
    textAlign: "center",
  },
});
