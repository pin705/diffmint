import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CustomerPortal } from '@polar-sh/nextjs';
import { getPolarConfig } from '@/lib/polar/config';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<Response> {
  const config = getPolarConfig();
  const customerId = request.nextUrl.searchParams.get('customerId');

  if (!config.accessToken) {
    return NextResponse.json(
      {
        error: 'Polar customer portal is not configured.'
      },
      { status: 503 }
    );
  }

  if (!customerId) {
    return NextResponse.json(
      {
        error: 'Missing customerId query parameter.'
      },
      { status: 400 }
    );
  }

  const handler = CustomerPortal({
    accessToken: config.accessToken,
    getCustomerId: async () => customerId,
    returnUrl: `${config.appUrl}/dashboard/billing`,
    server: config.server
  });

  return handler(request);
}
