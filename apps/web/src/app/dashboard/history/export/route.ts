import { NextResponse } from 'next/server';
import { requireWorkspaceApiAccess } from '@/features/control-plane/server/dashboard-api';
import {
  buildCsv,
  createDashboardExportResponse,
  type DashboardExportFormat
} from '@/features/control-plane/server/export-response';
import { listReviewSessions } from '@/features/control-plane/server/service';

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

  const reviewSessions = await listReviewSessions(access.orgId);
  const format = getRequestedFormat(request);

  if (format === 'json') {
    return createDashboardExportResponse(JSON.stringify(reviewSessions, null, 2), {
      filename: `diffmint-history-${access.orgId}`,
      format
    });
  }

  return createDashboardExportResponse(
    buildCsv(
      [
        'traceId',
        'source',
        'commandSource',
        'provider',
        'model',
        'policyVersionId',
        'status',
        'low',
        'medium',
        'high',
        'critical',
        'durationMs',
        'startedAt',
        'completedAt',
        'summary'
      ],
      reviewSessions.map((session) => ({
        traceId: session.traceId,
        source: session.source,
        commandSource: session.commandSource,
        provider: session.provider ?? '',
        model: session.model ?? '',
        policyVersionId: session.policyVersionId ?? '',
        status: session.status,
        low: session.severityCounts.low,
        medium: session.severityCounts.medium,
        high: session.severityCounts.high,
        critical: session.severityCounts.critical,
        durationMs: session.durationMs,
        startedAt: session.startedAt,
        completedAt: session.completedAt ?? '',
        summary: session.summary
      }))
    ),
    {
      filename: `diffmint-history-${access.orgId}`,
      format
    }
  );
}
