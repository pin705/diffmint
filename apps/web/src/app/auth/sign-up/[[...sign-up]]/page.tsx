import { Metadata } from 'next';
import { AuthConfigNotice } from '@/features/auth/components/auth-config-notice';
import SignUpViewPage from '@/features/auth/components/sign-up-view';
import { isClerkEnabled } from '@/lib/clerk/flags';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for authentication.'
};

export default function Page() {
  if (!isClerkEnabled()) {
    return <AuthConfigNotice mode='sign-up' />;
  }

  return <SignUpViewPage />;
}
