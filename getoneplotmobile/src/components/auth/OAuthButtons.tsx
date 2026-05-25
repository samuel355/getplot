import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSize, spacing, borderRadius } from "../../constants/theme";
import { formatClerkError } from "../../lib/auth";
import { AuthMessage } from "./AuthMessage";

WebBrowser.maybeCompleteAuthSession();

type Props = {
  mode: "sign-in" | "sign-up";
  onError?: (message: string) => void;
};

export function OAuthButtons({ mode, onError }: Props) {
  const router = useRouter();
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });
  const [loading, setLoading] = useState<string | null>(null); // 'google' | 'apple' | null
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const handleOAuth = async (strategy: "google" | "apple") => {
    setError(null);
    setLoading(strategy);
    try {
      const startFlow = strategy === "google" ? startGoogleFlow : startAppleFlow;
      const { createdSessionId, setActive, signIn, signUp } = await startFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/approval");
        return;
      }

      if ((signIn?.status === "complete" || signUp?.status === "complete") && setActive) {
        const sessionId = signIn?.createdSessionId || signUp?.createdSessionId;
        if (sessionId) {
          await setActive({ session: sessionId });
          router.replace("/approval");
          return;
        }
      }

      const msg = "Additional verification is required. Try email sign-in instead.";
      setError(msg);
      onError?.(msg);
    } catch (e) {
      const msg = formatClerkError(e);
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.wrap}>
      {error ? <AuthMessage message={error} variant="error" /> : null}

      <View style={{ gap: spacing.sm }}>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            pressed && styles.btnPressed,
            loading === "google" && styles.btnDisabled,
          ]}
          onPress={() => handleOAuth("google")}
          disabled={!!loading}
          accessibilityRole="button"
        >
          {loading === "google" ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.btnText}>
                {mode === "sign-in" ? "Continue with Google" : "Sign up with Google"}
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.black, borderColor: colors.black },
            pressed && { opacity: 0.8 },
            loading === "apple" && styles.btnDisabled,
          ]}
          onPress={() => handleOAuth("apple")}
          disabled={!!loading}
          accessibilityRole="button"
        >
          {loading === "apple" ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="logo-apple" size={20} color={colors.white} />
              <Text style={[styles.btnText, { color: colors.white }]}>
                {mode === "sign-in" ? "Continue with Apple" : "Sign up with Apple"}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or use email</Text>
        <View style={styles.divider} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  btnPressed: { backgroundColor: colors.surface },
  btnDisabled: { opacity: 0.65 },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4285F4",
  },
  btnText: {
    fontWeight: "600",
    color: colors.text,
    fontSize: fontSize.md,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  divider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  dividerText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
