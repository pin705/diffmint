import { NextResponse } from 'next/server';
import { requireWorkspaceApiAccess } from '@/features/control-plane/server/dashboard-api';
import {
  buildCsv,
  createDashboardExportResponse,
  type DashboardExportFormat
} from '@/features/control-plane/server/export-response';
import { listAuditEvents } from '@/features/control-plane/server/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getRequestedFormat(request: Request): DashboardExportFormat {
  const format = new URL(request.url).searchParams.get('format');
  return format === 'json' ? 'json' : 'csv';
}

export async function GET(request: Request): Promise<Response> {
  const access = await requireWorkspaceApiAccess();

  if (access instanceof NextResponse) {
    return access;
  }

  const auditEvents = await listAuditEvents(access.orgId);
  const format = getRequestedFormat(request);

  if (format === 'json') {
    return createDashboardExportResponse(JSON.stringify(auditEvents, null, 2), {
      filename: `diffmint-audit-${access.orgId}`,
      format
    });
  }

  return createDashboardExportResponse(
    buildCsv(
      ['event', 'actor', 'target', 'when', 'detail'],
      auditEvents.map((event) => ({
        event: event.event,
        actor: event.actor,
        target: event.target,
        when: event.when,
        detail: event.detail
      }))
    ),
    {
      filename: `diffmint-audit-${access.orgId}`,
      format
    }
  );
}
