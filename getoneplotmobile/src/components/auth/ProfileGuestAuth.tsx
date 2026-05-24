import { useState } from 'react';
import { AuthShell } from './AuthShell';
import { AuthModeSwitcher, type AuthMode } from './AuthModeSwitcher';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

export function ProfileGuestAuth() {
  const [mode, setMode] = useState<AuthMode>('sign-in');

  const title =
    mode === 'sign-in' ? 'Welcome back' : 'Create your account';
  const subtitle =
    mode === 'sign-in'
      ? 'Sign in to buy plots, save favorites, and manage your account.'
      : 'Register to browse land, buy plots, and list properties.';

  return (
    <AuthShell
      embedded
      compact
      title={title}
      subtitle={subtitle}
      headerExtra={<AuthModeSwitcher mode={mode} onChange={setMode} />}
    >
      {mode === 'sign-in' ? (
        <SignInForm onSwitchToSignUp={() => setMode('sign-up')} showSwitchLink />
      ) : (
        <SignUpForm onSwitchToSignIn={() => setMode('sign-in')} showSwitchLink />
      )}
    </AuthShell>
  );
}
