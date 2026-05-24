import { useState } from 'react';
import { AuthShell } from '../../src/components/auth/AuthShell';
import { SignUpForm, getSignUpShellCopy } from '../../src/components/auth/SignUpForm';

export default function SignUpScreen() {
  const [pendingVerification, setPendingVerification] = useState(false);
  const [email, setEmail] = useState('');
  const copy = getSignUpShellCopy(pendingVerification, email);

  return (
    <AuthShell title={copy.title} subtitle={copy.subtitle}>
      <SignUpForm
        onVerificationChange={(pending, userEmail) => {
          setPendingVerification(pending);
          setEmail(userEmail);
        }}
      />
    </AuthShell>
  );
}
