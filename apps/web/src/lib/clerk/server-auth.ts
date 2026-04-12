import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from './flags';

export interface ServerAuthContext {
  userId: string | null;
  orgId: string | null;
  redirectToSignIn: (options?: { returnBackUrl?: string }) => never;
}

function redirectToFallbackSignIn(options?: { returnBackUrl?: string }): never {
  const target = new URL('/auth/sign-in', 'http://localhost');

  if (options?.returnBackUrl) {
    target.searchParams.set('redirect_url', options.returnBackUrl);
  }

  return redirect(`${target.pathname}${target.search}`);
}

export async function getServerAuthContext(): Promise<ServerAuthContext> {
  if (!isClerkEnabled()) {
    return {
      userId: null,
      orgId: null,
      redirectToSignIn: redirectToFallbackSignIn
    };
  }

  const session = await auth();

  return {
    userId: session.userId ?? null,
    orgId: session.orgId ?? null,
    redirectToSignIn: session.redirectToSignIn
  };
}
