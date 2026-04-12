import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { jsonWithClientApiHeaders } from '@/features/control-plane/server/api-response';
import { deviceAuthStartSchema } from '@/features/control-plane/server/schemas';
import { startDeviceAuth } from '@/features/control-plane/server/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getRequestAppUrl(request: Request): string {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return requestUrl.origin;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = rawBody ? JSON.parse(rawBody) : {};
    const payload = deviceAuthStartSchema.parse(body);

    return jsonWithClientApiHeaders(
      await startDeviceAuth(payload.workspaceId, getRequestAppUrl(request))
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonWithClientApiHeaders(
        {
          error: 'Invalid device auth start payload.',
          issues: error.issues
        },
        { status: 400 }
      );
    }

    return jsonWithClientApiHeaders(
      {
        error: 'Unable to start device auth.'
      },
      { status: 500 }
    );
  }
}
