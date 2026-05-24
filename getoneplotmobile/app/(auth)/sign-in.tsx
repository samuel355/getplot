import { useState } from 'react';
import { AuthShell } from '../../src/components/auth/AuthShell';
import { SignInForm, getSignInShellCopy } from '../../src/components/auth/SignInForm';

type Step = 'sign-in' | 'forgot' | 'reset';

export default function SignInScreen() {
  const [step, setStep] = useState<Step>('sign-in');
  const copy = getSignInShellCopy(step);

  return (
    <AuthShell title={copy.title} subtitle={copy.subtitle}>
      <SignInForm onStepChange={setStep} />
    </AuthShell>
  );
}
