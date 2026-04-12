import { NextResponse } from 'next/server';
import {
  jsonWithClientApiHeaders,
  withClientApiHeaders
} from '@/features/control-plane/server/api-response';
import { requireAuthorizedClientRequest } from '@/features/control-plane/server/client-auth';
import { listPolicies } from '@/features/control-plane/server/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await requireAuthorizedClientRequest(request);

  if (session instanceof NextResponse) {
    return withClientApiHeaders(session);
  }

  return jsonWithClientApiHeaders({
    items: await listPolicies(session.workspaceId)
  });
}
