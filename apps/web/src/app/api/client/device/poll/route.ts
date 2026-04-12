import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { jsonWithClientApiHeaders } from '@/features/control-plane/server/api-response';
import { deviceAuthActionSchema } from '@/features/control-plane/server/schemas';
import { pollDeviceAuth } from '@/features/control-plane/server/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = deviceAuthActionSchema.parse(await request.json());
    const session = await pollDeviceAuth(body.deviceCode);

    if (!session) {
      return jsonWithClientApiHeaders(
        {
          error: 'Unknown device code.'
        },
        { status: 404 }
      );
    }

    return jsonWithClientApiHeaders(session);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonWithClientApiHeaders(
        {
          error: 'Invalid device auth poll payload.',
          issues: error.issues
        },
        { status: 400 }
      );
    }

    return jsonWithClientApiHeaders(
      {
        error: 'Unable to poll device auth status.'
      },
      { status: 500 }
    );
  }
}
