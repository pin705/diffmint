import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { sanitizeReviewSessionForCloudSync } from '@diffmint/review-core';
import {
  jsonWithClientApiHeaders,
  withClientApiHeaders
} from '@/features/control-plane/server/api-response';
import { requireAuthorizedClientRequest } from '@/features/control-plane/server/client-auth';
import { reviewSessionSchema } from '@/features/control-plane/server/schemas';
import { listReviewSessions, recordReviewSession } from '@/features/control-plane/server/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await requireAuthorizedClientRequest(request);

  if (session instanceof NextResponse) {
    return withClientApiHeaders(session);
  }

  return jsonWithClientApiHeaders({
    items: await listReviewSessions(session.workspaceId)
  });
}

export async function POST(request: Request) {
  try {
    const clientSession = await requireAuthorizedClientRequest(request);

    if (clientSession instanceof NextResponse) {
      return clientSession;
    }

    const body = await request.json();
    const session = reviewSessionSchema.parse({
      ...body,
      workspaceId: clientSession.workspaceId
    });

    return jsonWithClientApiHeaders({
      accepted: true,
      item: await recordReviewSession(sanitizeReviewSessionForCloudSync(session))
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonWithClientApiHeaders(
        {
          error: 'Invalid review session payload.',
          issues: error.issues
        },
        { status: 400 }
      );
    }

    return jsonWithClientApiHeaders(
      {
        error: 'Unable to record review session.'
      },
      { status: 500 }
    );
  }
}
