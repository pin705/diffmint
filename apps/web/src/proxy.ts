import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkEnabled } from '@/lib/clerk/flags';

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);

const clerkProxy = clerkMiddleware(async (auth, request) => {
  if (isDashboardRoute(request)) {
    await auth.protect();
  }
});

export default function proxy(...args: Parameters<typeof clerkProxy>) {
  if (!isClerkEnabled()) {
    return NextResponse.next();
  }

  return clerkProxy(...args);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};
