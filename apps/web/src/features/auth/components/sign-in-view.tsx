import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { Metadata } from 'next';
import { AuthShell } from './auth-shell';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Sign in to your Diffmint workspace.'
};

export default function SignInViewPage() {
  return (
    <AuthShell
      title='Sign in'
      description='Use your workspace account to continue.'
      alternatePrompt='No account yet?'
      alternateLabel='Create one'
      alternateHref='/auth/sign-up'
    >
      <ClerkSignInForm />
    </AuthShell>
  );
}
