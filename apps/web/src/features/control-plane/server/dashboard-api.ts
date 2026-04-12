import { NextResponse } from 'next/server';
import { getServerAuthContext } from '@/lib/clerk/server-auth';

export interface WorkspaceApiAccess {
  userId: string;
  orgId: string;
}

function createRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}

function jsonError(message: string, status: number): NextResponse {
  const response = NextResponse.json(
    {
      error: message
    },
    { status }
  );

  response.headers.set('cache-control', 'private, no-store, max-age=0');
  response.headers.set('pragma', 'no-cache');
  response.headers.set('expires', '0');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-diffmint-request-id', createRequestId());

  return response;
}

export async function requireWorkspaceApiAccess(): Promise<WorkspaceApiAccess | NextResponse> {
  const { userId, orgId } = await getServerAuthContext();

  if (!userId) {
    return jsonError('Authentication is required.', 401);
  }

  if (!orgId) {
    return jsonError('An active workspace is required.', 403);
  }

  return {
    userId,
    orgId
  };
}
