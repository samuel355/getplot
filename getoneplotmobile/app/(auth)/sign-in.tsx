import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { colors, fontSize, spacing } from '../../src/constants/theme';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/approval');
      } else {
        Alert.alert('Sign in', 'Additional verification required.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign in failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>Get One Plot</Text>
        <Text style={styles.subtitle}>Welcome back — sign in to continue</Text>

        <Input
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />

        <Button title="Sign In" onPress={onSignIn} loading={loading} />

        <Text style={styles.footer}>
          No account?{' '}
          <Link href="/(auth)/sign-up" style={styles.link}>
            Sign up
          </Link>
        </Text>
        <Link href="/(tabs)" style={styles.guest}>
          Continue as guest
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: { fontSize: fontSize.md, color: colors.textMuted, marginBottom: spacing.xl },
  footer: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
  link: { color: colors.primary, fontWeight: '700' },
  guest: { textAlign: 'center', marginTop: spacing.md, color: colors.textMuted },
});
