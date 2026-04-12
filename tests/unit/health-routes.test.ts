import { beforeEach, describe, expect, it, vi } from 'vitest';

const getLiveHealthReportMock = vi.fn();
const getReadinessHealthReportMock = vi.fn();

vi.mock('@/lib/runtime/health', () => ({
  getLiveHealthReport: getLiveHealthReportMock,
  getReadinessHealthReport: getReadinessHealthReportMock
}));

describe('health routes', () => {
  beforeEach(() => {
    vi.resetModules();
    getLiveHealthReportMock.mockReturnValue({
      service: 'diffmint-web',
      status: 'ok',
      checkedAt: '2026-04-13T00:00:00.000Z',
      uptimeSeconds: 10,
      checks: [{ name: 'process', status: 'ok', detail: 'Process is responding.' }]
    });
    getReadinessHealthReportMock.mockResolvedValue({
      service: 'diffmint-web',
      status: 'warn',
      checkedAt: '2026-04-13T00:00:00.000Z',
      uptimeSeconds: 10,
      checks: [{ name: 'database', status: 'warn', detail: 'Memory fallback active.' }]
    });
  });

  it('returns a no-store live health response', async () => {
    const module = await import('../../apps/web/src/app/api/health/live/route.ts');
    const response = await module.GET();
    const payload = (await response.json()) as { status: string };

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(payload.status).toBe('ok');
  });

  it('returns a 200 readiness response for ok and warn states', async () => {
    const module = await import('../../apps/web/src/app/api/health/ready/route.ts');
    const response = await module.GET();
    const payload = (await response.json()) as { status: string };

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(payload.status).toBe('warn');
  });

  it('returns a 503 readiness response when a failing check is reported', async () => {
    getReadinessHealthReportMock.mockResolvedValueOnce({
      service: 'diffmint-web',
      status: 'fail',
      checkedAt: '2026-04-13T00:00:00.000Z',
      uptimeSeconds: 10,
      checks: [{ name: 'docs', status: 'fail', detail: 'Docs unavailable.' }]
    });

    const module = await import('../../apps/web/src/app/api/health/ready/route.ts');
    const response = await module.GET();
    const payload = (await response.json()) as { status: string };

    expect(response.status).toBe(503);
    expect(payload.status).toBe('fail');
  });
});
