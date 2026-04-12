import { NextRequest, NextResponse } from 'next/server';
import { Webhooks } from '@polar-sh/nextjs';
import { applyPolarWebhookPayload } from '@/features/control-plane/server/service';
import { getPolarConfig } from '@/lib/polar/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REQUIRED_WEBHOOK_HEADERS = ['webhook-id', 'webhook-timestamp', 'webhook-signature'] as const;
const DEFAULT_WEBHOOK_MAX_BYTES = 256 * 1024;

function createRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}

function getWebhookMaxBytes(): number {
  const configuredValue = Number(process.env.POLAR_WEBHOOK_MAX_BYTES ?? DEFAULT_WEBHOOK_MAX_BYTES);

  if (Number.isFinite(configuredValue) && configuredValue > 0) {
    return configuredValue;
  }

  return DEFAULT_WEBHOOK_MAX_BYTES;
}

function jsonWithWebhookHeaders(payload: unknown, requestId: string, status: number): NextResponse {
  const response = NextResponse.json(payload, { status });
  response.headers.set('cache-control', 'no-store');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-diffmint-request-id', requestId);
  return response;
}

function withWebhookHeaders(response: Response, requestId: string): Response {
  const nextResponse = new NextResponse(response.body, response);
  nextResponse.headers.set('cache-control', 'no-store');
  nextResponse.headers.set('x-content-type-options', 'nosniff');
  nextResponse.headers.set('x-diffmint-request-id', requestId);
  return nextResponse;
}

function getMissingHeaders(request: NextRequest): string[] {
  return REQUIRED_WEBHOOK_HEADERS.filter((headerName) => !request.headers.get(headerName)?.trim());
}

export async function POST(request: NextRequest): Promise<Response> {
  const requestId = createRequestId();
  const config = getPolarConfig();

  if (!config.webhookSecret) {
    return jsonWithWebhookHeaders(
      {
        error: 'Polar webhook secret is not configured.'
      },
      requestId,
      503
    );
  }

  const missingHeaders = getMissingHeaders(request);

  if (missingHeaders.length > 0) {
    return jsonWithWebhookHeaders(
      {
        error: `Missing Polar webhook headers: ${missingHeaders.join(', ')}.`
      },
      requestId,
      400
    );
  }

  const contentLengthHeader = request.headers.get('content-length');

  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);

    if (Number.isFinite(contentLength) && contentLength > getWebhookMaxBytes()) {
      return jsonWithWebhookHeaders(
        {
          error: `Polar webhook payload exceeds the ${getWebhookMaxBytes()} byte limit.`
        },
        requestId,
        413
      );
    }
  }

  try {
    const handler = Webhooks({
      webhookSecret: config.webhookSecret,
      onPayload: async (payload) => {
        await applyPolarWebhookPayload(payload);
      }
    });

    return withWebhookHeaders(await handler(request), requestId);
  } catch (error) {
    return jsonWithWebhookHeaders(
      {
        error: 'Unable to process Polar webhook.',
        detail: error instanceof Error ? error.message : 'Unknown webhook failure.'
      },
      requestId,
      500
    );
  }
}
