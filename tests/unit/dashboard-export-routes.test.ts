import { beforeEach, describe, expect, it, vi } from 'vitest';

const getServerAuthContextMock = vi.fn();
const listReviewSessionsMock = vi.fn();
const listAuditEventsMock = vi.fn();

vi.mock('@/lib/clerk/server-auth', () => ({
  getServerAuthContext: getServerAuthContextMock
}));

vi.mock('@/features/control-plane/server/service', () => ({
  listReviewSessions: listReviewSessionsMock,
  listAuditEvents: listAuditEventsMock
}));

describe('dashboard export routes', () => {
  beforeEach(() => {
    vi.resetModules();
    getServerAuthContextMock.mockResolvedValue({
      userId: 'user_export_test',
      orgId: 'org_export_test',
      redirectToSignIn: () => {
        throw new Error('redirectToSignIn should not be called in export route tests.');
      }
    });
    listReviewSessionsMock.mockResolvedValue([
      {
        id: 'review_1',
        traceId: 'trace_export_1',
        requestId: 'request_export_1',
        source: 'branch_compare',
        commandSource: 'cli',
        provider: 'qwen',
        model: 'qwen-code',
        policyVersionId: 'policy_v1',
        status: 'completed',
        findings: [],
        summary: 'Synced summary',
        severityCounts: {
          low: 0,
          medium: 1,
          high: 0,
          critical: 0
        },
        durationMs: 250,
        startedAt: '2026-04-13T00:00:00.000Z',
        completedAt: '2026-04-13T00:00:01.000Z',
        artifacts: []
      }
    ]);
    listAuditEventsMock.mockResolvedValue([
      {
        id: 'audit_1',
        event: 'review.synced',
        actor: 'Diffmint CLI',
        target: 'trace_export_1',
        when: '2026-04-13 00:00 UTC',
        detail: 'Uploaded summary'
      }
    ]);
  });

  it('exports review history as csv for the active workspace', async () => {
    const module = await import('../../apps/web/src/app/dashboard/history/export/route.ts');
    const response = await module.GET(
      new Request('http://localhost/dashboard/history/export?format=csv')
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toContain(
      'diffmint-history-org_export_test.csv'
    );
    expect(response.headers.get('x-diffmint-request-id')).toMatch(/^req_/);
    expect(body).toContain('traceId');
    expect(body).toContain('trace_export_1');
    expect(listReviewSessionsMock).toHaveBeenCalledWith('org_export_test');
  });

  it('exports audit events as json for the active workspace', async () => {
    const module = await import('../../apps/web/src/app/dashboard/audit/export/route.ts');
    const response = await module.GET(
      new Request('http://localhost/dashboard/audit/export?format=json')
    );
    const payload = JSON.parse(await response.text()) as Array<{ event: string; target: string }>;

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('content-disposition')).toContain(
      'diffmint-audit-org_export_test.json'
    );
    expect(payload[0]?.event).toBe('review.synced');
    expect(payload[0]?.target).toBe('trace_export_1');
    expect(listAuditEventsMock).toHaveBeenCalledWith('org_export_test');
  });

  it('returns a 401 for export routes when the request is unauthenticated', async () => {
    getServerAuthContextMock.mockResolvedValueOnce({
      userId: null,
      orgId: null,
      redirectToSignIn: () => {
        throw new Error('redirectToSignIn should not be called in export route tests.');
      }
    });

    const module = await import('../../apps/web/src/app/dashboard/history/export/route.ts');
    const response = await module.GET(new Request('http://localhost/dashboard/history/export'));
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store, max-age=0');
    expect(payload.error).toContain('Authentication is required');
  });
});
