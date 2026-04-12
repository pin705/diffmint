import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  jsonWithClientApiHeaders,
  withClientApiHeaders
} from '@/features/control-plane/server/api-response';
import { requireAuthorizedClientRequest } from '@/features/control-plane/server/client-auth';
import { clientInstallationInputSchema } from '@/features/control-plane/server/schemas';
import { registerClientInstallation } from '@/features/control-plane/server/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const clientSession = await requireAuthorizedClientRequest(request);

    if (clientSession instanceof NextResponse) {
      return withClientApiHeaders(clientSession);
    }

    const body = await request.json();
    const installation = clientInstallationInputSchema.parse({
      ...body,
      workspaceId: clientSession.workspaceId
    });

    return jsonWithClientApiHeaders({
      accepted: true,
      item: await registerClientInstallation(installation)
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonWithClientApiHeaders(
        {
          error: 'Invalid client installation payload.',
          issues: error.issues
        },
        { status: 400 }
      );
    }

    return jsonWithClientApiHeaders(
      {
        error: 'Unable to register client installation.'
      },
      { status: 500 }
    );
  }
}
