import { Metadata } from 'next';
import { AuthConfigNotice } from '@/features/auth/components/auth-config-notice';
import SignInViewPage from '@/features/auth/components/sign-in-view';
import { isClerkEnabled } from '@/lib/clerk/flags';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  if (!isClerkEnabled()) {
    return <AuthConfigNotice mode='sign-in' />;
  }

  return <SignInViewPage />;
}
