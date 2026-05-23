import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../../constants/theme';
import { formatClerkError } from '../../lib/auth';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  mode: 'sign-in' | 'sign-up';
};

export function OAuthButtons({ mode }: Props) {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [loading, setLoading] = useState(false);

  const onGoogle = async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/approval');
      }
    } catch (e) {
      Alert.alert(
        mode === 'sign-in' ? 'Google sign in' : 'Google sign up',
        formatClerkError(e)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={onGoogle}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? 'Please wait…' : 'Continue with Google'}
        </Text>
      </Pressable>
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  btn: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontWeight: '600', color: colors.text, fontSize: fontSize.md },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: fontSize.sm },
});
