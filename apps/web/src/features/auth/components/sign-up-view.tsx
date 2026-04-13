import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import { Metadata } from 'next';
import { AuthShell } from './auth-shell';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Create a Diffmint account.'
};

export default function SignUpViewPage() {
  return (
    <AuthShell
      title='Create account'
      description='Create an account to join or start a workspace.'
      alternatePrompt='Already have an account?'
      alternateLabel='Sign in'
      alternateHref='/auth/sign-in'
    >
      <ClerkSignUpForm />
    </AuthShell>
  );
}
