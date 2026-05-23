import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AuthShell } from '../../src/components/auth/AuthShell';
import { OAuthButtons } from '../../src/components/auth/OAuthButtons';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { formatClerkError } from '../../src/lib/auth';
import { colors, fontSize, spacing } from '../../src/constants/theme';

type Step = 'sign-in' | 'forgot' | 'reset';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<Step>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password) {
      Alert.alert('Sign in', 'Enter your email and password.');
      return;
    }
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
        Alert.alert('Sign in', 'Additional verification is required for this account.');
      }
    } catch (e) {
      Alert.alert('Sign in failed', formatClerkError(e));
    } finally {
      setLoading(false);
    }
  };

  const onForgotSend = async () => {
    if (!isLoaded || !signIn) return;
    if (!email.trim()) {
      Alert.alert('Reset password', 'Enter your email address first.');
      return;
    }
    setLoading(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });
      setStep('reset');
      Alert.alert('Check your email', 'We sent a password reset code to your inbox.');
    } catch (e) {
      Alert.alert('Reset failed', formatClerkError(e));
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    if (!isLoaded || !signIn) return;
    if (!code || !password) {
      Alert.alert('Reset password', 'Enter the code and your new password.');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/approval');
      }
    } catch (e) {
      Alert.alert('Reset failed', formatClerkError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === 'sign-in' ? 'Welcome back' : 'Reset password'}
      subtitle={
        step === 'sign-in'
          ? 'Sign in to buy plots, save favorites, and access your dashboard.'
          : step === 'forgot'
            ? 'Enter your email to receive a reset code.'
            : 'Enter the code from your email and choose a new password.'
      }
      footer={
        <Text style={styles.footer}>
          No account?{' '}
          <Link href="/(auth)/sign-up" style={styles.link}>
            Sign up
          </Link>
        </Text>
      }
    >
      {step === 'sign-in' && <OAuthButtons mode="sign-in" />}

      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
      />

      {step !== 'forgot' && (
        <Input
          label="Password"
          secureTextEntry
          autoComplete={step === 'sign-in' ? 'password' : 'new-password'}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />
      )}

      {step === 'reset' && (
        <Input
          label="Reset code"
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
        />
      )}

      {step === 'sign-in' && (
        <>
          <Button title="Sign In" onPress={onSignIn} loading={loading} />
          <Button
            title="Forgot password?"
            variant="ghost"
            onPress={() => setStep('forgot')}
          />
        </>
      )}

      {step === 'forgot' && (
        <>
          <Button title="Send reset code" onPress={onForgotSend} loading={loading} />
          <Button title="Back to sign in" variant="outline" onPress={() => setStep('sign-in')} />
        </>
      )}

      {step === 'reset' && (
        <>
          <Button title="Set new password" onPress={onResetPassword} loading={loading} />
          <Button title="Back to sign in" variant="outline" onPress={() => setStep('sign-in')} />
        </>
      )}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  footer: { textAlign: 'center', marginTop: spacing.md, color: colors.textMuted },
  link: { color: colors.primary, fontWeight: '700' },
});
