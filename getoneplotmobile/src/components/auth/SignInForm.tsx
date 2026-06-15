import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthMessage } from './AuthMessage';
import { AuthStepIndicator } from './AuthStepIndicator';
import { OAuthButtons } from './OAuthButtons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatClerkError } from '../../lib/auth';
import { colors, fontSize, spacing } from '../../constants/theme';

type Step = 'sign-in' | 'forgot' | 'reset';

const STEP_LABELS = ['Sign in', 'Email', 'New password'];

type Props = {
  onSwitchToSignUp?: () => void;
  showSwitchLink?: boolean;
  onStepChange?: (step: Step) => void;
};

export function SignInForm({ onSwitchToSignUp, showSwitchLink = true, onStepChange }: Props) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<Step>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    variant: 'error' | 'success' | 'info';
  } | null>(null);

  const stepIndex = step === 'sign-in' ? 0 : step === 'forgot' ? 1 : 2;
  const clearMessage = () => setMessage(null);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

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
    <>
      {step !== 'sign-in' ? (
        <AuthStepIndicator steps={STEP_LABELS} current={stepIndex} />
      ) : null}

      {message ? <AuthMessage message={message.text} variant={message.variant} /> : null}

      {step === 'sign-in' && (
        <OAuthButtons mode="sign-in" onError={(text) => setMessage({ text, variant: 'error' })} />
      )}

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
          <Button title="Resend code" variant="ghost" onPress={onForgotSend} loading={loading} />
          <Button title="Back to sign in" variant="outline" onPress={goToSignIn} />
        </View>
      )}

      {showSwitchLink && step === 'sign-in' && onSwitchToSignUp ? (
        <View style={viewStyles.footerRow}>
          <Text style={textStyles.footerPlain}>No account? </Text>
          <Pressable onPress={onSwitchToSignUp}>
            <Text style={textStyles.link}>Create one</Text>
          </Pressable>
        </View>
      ) : null}

      {showSwitchLink && step === 'sign-in' && !onSwitchToSignUp ? (
        <View style={viewStyles.footerRow}>
          <Text style={textStyles.footerPlain}>No account? </Text>
          <Link href="/(auth)/sign-up">
            <Text style={textStyles.link}>Create one</Text>
          </Link>
        </View>
      ) : null}
    </>
  );
}

export function getSignInShellCopy(step: Step) {
  if (step === 'sign-in') {
    return {
      title: 'Welcome back',
      subtitle: 'Sign in to buy plots, save favorites, and access your dashboard.',
    };
  }
  if (step === 'forgot') {
    return {
      title: 'Reset password',
      subtitle: 'Enter your email and we’ll send you a reset code.',
    };
  }
  return {
    title: 'Reset password',
    subtitle: 'Enter the code from your email and choose a new password.',
  };
}

const viewStyles = StyleSheet.create({
  actions: { gap: spacing.sm, marginTop: spacing.lg },
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
