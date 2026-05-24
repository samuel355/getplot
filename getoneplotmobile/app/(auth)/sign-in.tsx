import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthShell } from '../../src/components/auth/AuthShell';
import { AuthMessage } from '../../src/components/auth/AuthMessage';
import { AuthStepIndicator } from '../../src/components/auth/AuthStepIndicator';
import { OAuthButtons } from '../../src/components/auth/OAuthButtons';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { formatClerkError } from '../../src/lib/auth';
import { colors, fontSize, spacing } from '../../src/constants/theme';

type Step = 'sign-in' | 'forgot' | 'reset';

const STEP_LABELS = ['Sign in', 'Email', 'New password'];

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<Step>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; variant: 'error' | 'success' | 'info' } | null>(
    null
  );

  const stepIndex = step === 'sign-in' ? 0 : step === 'forgot' ? 1 : 2;

  const clearMessage = () => setMessage(null);

  const onSignIn = async () => {
    if (!isLoaded) return;
    clearMessage();
    if (!email.trim() || !password) {
      setMessage({ text: 'Enter your email and password.', variant: 'error' });
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
        setMessage({
          text: 'Additional verification is required for this account. Contact support if this persists.',
          variant: 'info',
        });
      }
    } catch (e) {
      setMessage({ text: formatClerkError(e), variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onForgotSend = async () => {
    if (!isLoaded || !signIn) return;
    clearMessage();
    if (!email.trim()) {
      setMessage({ text: 'Enter your email address first.', variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });
      setStep('reset');
      setMessage({
        text: 'We sent a password reset code to your inbox.',
        variant: 'success',
      });
    } catch (e) {
      setMessage({ text: formatClerkError(e), variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onResendResetCode = async () => {
    await onForgotSend();
  };

  const onResetPassword = async () => {
    if (!isLoaded || !signIn) return;
    clearMessage();
    if (!code.trim() || !password) {
      setMessage({ text: 'Enter the code and your new password.', variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/approval');
      } else {
        setMessage({ text: 'Could not complete password reset. Try again.', variant: 'error' });
      }
    } catch (e) {
      setMessage({ text: formatClerkError(e), variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const goToSignIn = () => {
    clearMessage();
    setStep('sign-in');
    setCode('');
  };

  return (
    <AuthShell
      title={step === 'sign-in' ? 'Welcome back' : 'Reset password'}
      subtitle={
        step === 'sign-in'
          ? 'Sign in to buy plots, save favorites, and access your dashboard.'
          : step === 'forgot'
            ? 'Enter your email and we’ll send you a reset code.'
            : 'Enter the code from your email and choose a new password.'
      }
      headerExtra={
        step !== 'sign-in' ? (
          <AuthStepIndicator steps={STEP_LABELS} current={stepIndex} />
        ) : null
      }
      footer={
        <View style={viewStyles.footerRow}>
          <Text style={textStyles.footerPlain}>No account? </Text>
          <Link href="/(auth)/sign-up">
            <Text style={textStyles.link}>Create one</Text>
          </Link>
        </View>
      }
    >
      {message ? <AuthMessage message={message.text} variant={message.variant} /> : null}

      {step === 'sign-in' && <OAuthButtons mode="sign-in" onError={(text) => setMessage({ text, variant: 'error' })} />}

      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        icon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
      />

      {step !== 'forgot' && (
        <Input
          label={step === 'reset' ? 'New password' : 'Password'}
          secureTextEntry
          autoComplete={step === 'sign-in' ? 'password' : 'new-password'}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
        />
      )}

      {step === 'reset' && (
        <Input
          label="Reset code"
          value={code}
          onChangeText={setCode}
          placeholder="6-digit code"
          keyboardType="number-pad"
          maxLength={6}
          icon={<Ionicons name="key-outline" size={20} color={colors.textMuted} />}
        />
      )}

      {step === 'sign-in' && (
        <View style={viewStyles.actions}>
          <Button title="Sign in" onPress={onSignIn} loading={loading} fullWidth size="lg" />
          <Button
            title="Forgot password?"
            variant="ghost"
            onPress={() => {
              clearMessage();
              setStep('forgot');
            }}
          />
        </View>
      )}

      {step === 'forgot' && (
        <View style={viewStyles.actions}>
          <Button title="Send reset code" onPress={onForgotSend} loading={loading} fullWidth size="lg" />
          <Button title="Back to sign in" variant="outline" onPress={goToSignIn} />
        </View>
      )}

      {step === 'reset' && (
        <View style={viewStyles.actions}>
          <Button title="Set new password" onPress={onResetPassword} loading={loading} fullWidth size="lg" />
          <Button title="Resend code" variant="ghost" onPress={onResendResetCode} loading={loading} />
          <Button title="Back to sign in" variant="outline" onPress={goToSignIn} />
        </View>
      )}
    </AuthShell>
  );
}

const viewStyles = StyleSheet.create({
  actions: { gap: spacing.sm },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});

const textStyles = StyleSheet.create({
  footerPlain: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  link: { color: colors.primaryAccent, fontWeight: '700' },
});
