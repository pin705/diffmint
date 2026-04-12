import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getOverviewStats,
  getWorkspaceBootstrap,
  listAuditEvents,
  listReviewSessions,
  listUsageEvents,
  pollDeviceAuth,
  recordReviewSession,
  resetControlPlaneState,
  revokeDeviceAuth,
  startDeviceAuth
} from '../../apps/web/src/features/control-plane/server/service.ts';

const originalAutoApprove = process.env.DEVFLOW_DEVICE_FLOW_AUTO_APPROVE;

describe('control plane service', () => {
  beforeEach(() => {
    process.env.DEVFLOW_DEVICE_FLOW_AUTO_APPROVE = 'true';
    resetControlPlaneState();
  });

  afterEach(() => {
    if (originalAutoApprove === undefined) {
      delete process.env.DEVFLOW_DEVICE_FLOW_AUTO_APPROVE;
      return;
    }

    process.env.DEVFLOW_DEVICE_FLOW_AUTO_APPROVE = originalAutoApprove;
  });

  it('returns bootstrap data and derived overview stats from the shared state', () => {
    const bootstrap = getWorkspaceBootstrap();
    const stats = getOverviewStats();

    expect(bootstrap.workspace.slug).toBe('devflow-core');
    expect(bootstrap.policy.policyVersionId).toBeTruthy();
    expect(stats.find((stat) => stat.label === 'Active seats')?.value).toBe('26 / 30');
    expect(stats.find((stat) => stat.label === 'Published policies')?.helper).toContain('active');
  });

  it('records synced reviews and appends usage plus audit events', () => {
    const initialHistorySize = listReviewSessions().length;
    const initialUsageSize = listUsageEvents().length;
    const initialAuditSize = listAuditEvents().length;

    const session = recordReviewSession({
      id: '',
      traceId: 'trace-devflow-new',
      workspaceId: 'ws_devflow_core',
      requestId: 'request-new',
      source: 'branch_compare',
      commandSource: 'cli',
      provider: 'qwen',
      model: 'qwen-code',
      policyVersionId: 'policy-v1',
      status: 'completed',
      findings: [],
      summary: 'Uploaded a new review session.',
      severityCounts: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      durationMs: 250,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      artifacts: []
    });

    expect(session.id).toBeTruthy();
    expect(listReviewSessions()).toHaveLength(initialHistorySize + 1);
    expect(listReviewSessions()[0]?.traceId).toBe('trace-devflow-new');
    expect(listUsageEvents()).toHaveLength(initialUsageSize + 1);
    expect(listAuditEvents()).toHaveLength(initialAuditSize + 1);
    expect(listAuditEvents()[0]?.event).toBe('review.synced');
  });

  it('runs the device auth lifecycle from pending to approved to revoked', () => {
    const started = startDeviceAuth('ws_devflow_core');
    const approved = pollDeviceAuth(started.deviceCode);
    const revoked = revokeDeviceAuth(started.deviceCode);

    expect(started.status).toBe('pending');
    expect(approved?.status).toBe('approved');
    expect(revoked?.status).toBe('revoked');
  });
});
