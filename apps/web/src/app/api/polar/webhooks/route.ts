import { NextRequest, NextResponse } from 'next/server';
import { Webhooks } from '@polar-sh/nextjs';
import { getPolarConfig } from '@/lib/polar/config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<Response> {
  const config = getPolarConfig();

  if (!config.webhookSecret) {
    return NextResponse.json(
      {
        error: 'Polar webhook secret is not configured.'
      },
      { status: 503 }
    );
  }

  const handler = Webhooks({
    webhookSecret: config.webhookSecret,
    onPayload: async () => {
      return;
    }
  });

  return handler(request);
}
