import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { AuthShell } from '../../src/components/auth/AuthShell';
import { OAuthButtons } from '../../src/components/auth/OAuthButtons';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { formatClerkError } from '../../src/lib/auth';
import { colors, spacing } from '../../src/constants/theme';

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

  const onSignUp = async () => {
    if (!isLoaded) return;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert('Sign up', 'Please fill in all fields.');
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
      Alert.alert(
        'Verify your email',
        'We sent a verification code to your email address.'
      );
    } catch (e) {
      Alert.alert('Sign up failed', formatClerkError(e));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    if (!code.trim()) {
      Alert.alert('Verification', 'Enter the code from your email.');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/approval');
      } else {
        Alert.alert('Verification', 'Additional steps are required.');
      }
    } catch (e) {
      Alert.alert('Verification failed', formatClerkError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={pendingVerification ? 'Verify your email' : 'Create your account'}
      subtitle={
        pendingVerification
          ? 'Enter the 6-digit code we sent to your email.'
          : 'Join Get One Plot to browse land, buy plots, and list properties.'
      }
      footer={
        <Text style={styles.footer}>
          Already have an account?{' '}
          <Link href="/(auth)/sign-in" style={styles.link}>
            Sign in
          </Link>
        </Text>
      }
    >
      {!pendingVerification && <OAuthButtons mode="sign-up" />}

      {!pendingVerification ? (
        <>
          <Input label="First name" value={firstName} onChangeText={setFirstName} autoComplete="given-name" />
          <Input label="Last name" value={lastName} onChangeText={setLastName} autoComplete="family-name" />
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            secureTextEntry
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Sign Up" onPress={onSignUp} loading={loading} />
        </>
      ) : (
        <>
          <Input
            label="Verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholder="123456"
          />
          <Button title="Verify Email" onPress={onVerify} loading={loading} />
        </>
      )}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  footer: { textAlign: 'center', marginTop: spacing.md, color: colors.textMuted },
  link: { color: colors.primary, fontWeight: '700' },
});
