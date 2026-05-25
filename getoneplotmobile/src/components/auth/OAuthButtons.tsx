<<<<<<< HEAD
import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { formatClerkError } from '../../lib/auth';
import { AuthMessage } from './AuthMessage';
=======
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSize, spacing, borderRadius } from "../../constants/theme";
import { formatClerkError } from "../../lib/auth";
import { AuthMessage } from "./AuthMessage";
>>>>>>> mobile

WebBrowser.maybeCompleteAuthSession();

type Props = {
<<<<<<< HEAD
  mode: 'sign-in' | 'sign-up';
=======
  mode: "sign-in" | "sign-up";
>>>>>>> mobile
  onError?: (message: string) => void;
};

export function OAuthButtons({ mode, onError }: Props) {
  const router = useRouter();
<<<<<<< HEAD
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [loading, setLoading] = useState(false);
=======
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });
  const [loading, setLoading] = useState<string | null>(null); // 'google' | 'apple' | null
>>>>>>> mobile
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

<<<<<<< HEAD
  const onGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const { createdSessionId, setActive, signIn, signUp } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/approval');
        return;
      }

      // Handle additional steps if Clerk returns an in-progress sign-in/up
      if (signIn?.status === 'complete' && setActive) {
        await setActive({ session: signIn.createdSessionId! });
        router.replace('/approval');
        return;
      }
      if (signUp?.status === 'complete' && setActive) {
        await setActive({ session: signUp.createdSessionId! });
        router.replace('/approval');
        return;
      }

      const msg = 'Additional verification is required. Try email sign-in instead.';
=======
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
>>>>>>> mobile
      setError(msg);
      onError?.(msg);
    } catch (e) {
      const msg = formatClerkError(e);
      setError(msg);
      onError?.(msg);
    } finally {
<<<<<<< HEAD
      setLoading(false);
=======
      setLoading(null);
>>>>>>> mobile
    }
  };

  return (
    <View style={styles.wrap}>
      {error ? <AuthMessage message={error} variant="error" /> : null}

<<<<<<< HEAD
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          pressed && styles.btnPressed,
          loading && styles.btnDisabled,
        ]}
        onPress={onGoogle}
        disabled={loading}
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <>
            <View style={styles.googleIcon}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.btnText}>
              {mode === 'sign-in' ? 'Continue with Google' : 'Sign up with Google'}
            </Text>
          </>
        )}
      </Pressable>
=======
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
>>>>>>> mobile

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
<<<<<<< HEAD
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
=======
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
>>>>>>> mobile
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
<<<<<<< HEAD
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4285F4',
  },
  btnText: {
    fontWeight: '600',
=======
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
>>>>>>> mobile
    color: colors.text,
    fontSize: fontSize.md,
  },
  dividerRow: {
<<<<<<< HEAD
    flexDirection: 'row',
    alignItems: 'center',
=======
    flexDirection: "row",
    alignItems: "center",
>>>>>>> mobile
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  divider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  dividerText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
<<<<<<< HEAD
    fontWeight: '600',
    textTransform: 'uppercase',
=======
    fontWeight: "600",
    textTransform: "uppercase",
>>>>>>> mobile
    letterSpacing: 0.6,
  },
});
