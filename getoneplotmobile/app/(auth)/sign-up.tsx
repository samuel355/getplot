import { useSignUp } from '@clerk/clerk-expo';
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

const SIGN_UP_STEPS = ['Your details', 'Verify email'];

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string; variant: 'error' | 'success' | 'info' } | null>(
    null
  );

  const clearMessage = () => setMessage(null);

  const onSignUp = async () => {
    if (!isLoaded) return;
    clearMessage();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setMessage({ text: 'Please fill in all fields.', variant: 'error' });
      return;
    }
    if (password.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters.', variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
      setMessage({
        text: 'We sent a verification code to your email.',
        variant: 'success',
      });
    } catch (e) {
      setMessage({ text: formatClerkError(e), variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded || !signUp) return;
    clearMessage();
    setLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setMessage({ text: 'A new verification code has been sent.', variant: 'success' });
    } catch (e) {
      setMessage({ text: formatClerkError(e), variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    clearMessage();
    if (!code.trim()) {
      setMessage({ text: 'Enter the code from your email.', variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/approval');
      } else {
        setMessage({
          text: 'Additional verification steps are required. Contact support if this persists.',
          variant: 'info',
        });
      }
    } catch (e) {
      setMessage({ text: formatClerkError(e), variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={pendingVerification ? 'Check your email' : 'Create your account'}
      subtitle={
        pendingVerification
          ? `We sent a 6-digit code to ${email || 'your email'}.`
          : 'Join Get One Plot to browse land, buy plots, and list properties.'
      }
      headerExtra={
        <AuthStepIndicator
          steps={SIGN_UP_STEPS}
          current={pendingVerification ? 1 : 0}
        />
      }
      footer={
        <View style={viewStyles.footerRow}>
          <Text style={textStyles.footerPlain}>Already have an account? </Text>
          <Link href="/(auth)/sign-in">
            <Text style={textStyles.link}>Sign in</Text>
          </Link>
        </View>
      }
    >
      {message ? <AuthMessage message={message.text} variant={message.variant} /> : null}

      {!pendingVerification && (
        <OAuthButtons mode="sign-up" onError={(text) => setMessage({ text, variant: 'error' })} />
      )}

      {!pendingVerification ? (
        <>
          <View style={viewStyles.nameRow}>
            <View style={viewStyles.nameField}>
              <Input
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoComplete="given-name"
                placeholder="First"
                icon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
              />
            </View>
            <View style={viewStyles.nameField}>
              <Input
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoComplete="family-name"
                placeholder="Last"
                icon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
              />
            </View>
          </View>
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
          <Input
            label="Password"
            secureTextEntry
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 8 characters"
            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
            hint="Use at least 8 characters with letters and numbers."
          />
          <Button title="Create account" onPress={onSignUp} loading={loading} fullWidth size="lg" />
        </>
      ) : (
        <View style={viewStyles.actions}>
          <Input
            label="Verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholder="6-digit code"
            maxLength={6}
            icon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.textMuted} />}
          />
          <Button title="Verify email" onPress={onVerify} loading={loading} fullWidth size="lg" />
          <Button title="Resend code" variant="ghost" onPress={onResendCode} loading={loading} />
          <Button
            title="Edit email"
            variant="outline"
            onPress={() => {
              clearMessage();
              setPendingVerification(false);
              setCode('');
            }}
          />
        </View>
      )}
    </AuthShell>
  );
}

const viewStyles = StyleSheet.create({
  nameRow: { flexDirection: 'row', gap: spacing.md },
  nameField: { flex: 1 },
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
