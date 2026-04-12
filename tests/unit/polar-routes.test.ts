import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@polar-sh/nextjs', () => ({
  Checkout: () => async () => new Response(null, { status: 200 }),
  CustomerPortal: () => async () => new Response(null, { status: 200 }),
  Webhooks: () => async () => new Response(null, { status: 200 })
}));

async function loadRoutes() {
  const checkoutModule = await import('../../apps/web/src/app/api/polar/checkout/route.ts');
  const portalModule = await import('../../apps/web/src/app/api/polar/portal/route.ts');
  const webhookModule = await import('../../apps/web/src/app/api/polar/webhooks/route.ts');

  return {
    checkoutRoute: checkoutModule.GET,
    portalRoute: portalModule.GET,
    webhookRoute: webhookModule.POST
  };
}

const originalEnv = { ...process.env };

describe('polar route handlers', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.POLAR_ACCESS_TOKEN;
    delete process.env.POLAR_WEBHOOK_SECRET;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns a 503 from checkout when Polar access token is missing', async () => {
    const { checkoutRoute } = await loadRoutes();
    const response = await checkoutRoute(new NextRequest('http://localhost/api/polar/checkout'));
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(503);
    expect(payload.error).toContain('not configured');
  });

  it('returns a 400 from the portal route when customerId is missing', async () => {
    process.env.POLAR_ACCESS_TOKEN = 'polar_oat_test';
    const { portalRoute } = await loadRoutes();
    const response = await portalRoute(new NextRequest('http://localhost/api/polar/portal'));
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(payload.error).toContain('customerId');
  });

  it('returns a 503 from the webhook route when the webhook secret is missing', async () => {
    const { webhookRoute } = await loadRoutes();
    const response = await webhookRoute(
      new NextRequest('http://localhost/api/polar/webhooks', {
        method: 'POST'
      })
    );
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(503);
    expect(payload.error).toContain('webhook secret');
  });
});
