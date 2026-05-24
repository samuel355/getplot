import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { formatClerkError } from '../../lib/auth';
import { AuthMessage } from './AuthMessage';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  mode: 'sign-in' | 'sign-up';
  onError?: (message: string) => void;
};

export function OAuthButtons({ mode, onError }: Props) {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

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
      setError(msg);
      onError?.(msg);
    } catch (e) {
      const msg = formatClerkError(e);
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      {error ? <AuthMessage message={error} variant="error" /> : null}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.text,
    fontSize: fontSize.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  divider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  dividerText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
