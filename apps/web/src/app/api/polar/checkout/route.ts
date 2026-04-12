import { NextRequest, NextResponse } from 'next/server';
import { Checkout } from '@polar-sh/nextjs';
import { getPolarConfig } from '@/lib/polar/config';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<Response> {
  const config = getPolarConfig();

  if (!config.accessToken) {
    return NextResponse.json(
      {
        error: 'Polar checkout is not configured.'
      },
      { status: 503 }
    );
  }

  const handler = Checkout({
    accessToken: config.accessToken,
    successUrl: `${config.appUrl}/dashboard/billing?checkout=success`,
    returnUrl: `${config.appUrl}/dashboard/billing`,
    server: config.server
  });

  return handler(request);
}
