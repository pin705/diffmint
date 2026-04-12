import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const webhooksMock = vi.fn();

vi.mock('@polar-sh/nextjs', () => ({
  Checkout: () => async () => new Response(null, { status: 200 }),
  CustomerPortal: () => async () => new Response(null, { status: 200 }),
  Webhooks: (...args: unknown[]) => {
    webhooksMock(...args);
    return async () =>
      new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      });
  }
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
    delete process.env.POLAR_WEBHOOK_MAX_BYTES;
    webhooksMock.mockReset();
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
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-diffmint-request-id')).toMatch(/^req_/);
    expect(payload.error).toContain('webhook secret');
  });

  it('returns a 400 from the webhook route when signature headers are missing', async () => {
    process.env.POLAR_WEBHOOK_SECRET = 'whsec_test';
    const { webhookRoute } = await loadRoutes();
    const response = await webhookRoute(
      new NextRequest('http://localhost/api/polar/webhooks', {
        method: 'POST',
        body: JSON.stringify({ type: 'subscription.updated' })
      })
    );
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(payload.error).toContain('webhook-id');
    expect(payload.error).toContain('webhook-signature');
    expect(webhooksMock).not.toHaveBeenCalled();
  });

  it('returns a 413 from the webhook route when the declared payload is too large', async () => {
    process.env.POLAR_WEBHOOK_SECRET = 'whsec_test';
    process.env.POLAR_WEBHOOK_MAX_BYTES = '8';
    const { webhookRoute } = await loadRoutes();
    const response = await webhookRoute(
      new NextRequest('http://localhost/api/polar/webhooks', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': '12',
          'webhook-id': 'evt_123',
          'webhook-timestamp': '1710000000',
          'webhook-signature': 'v1,test'
        },
        body: JSON.stringify({ type: 'subscription.updated' })
      })
    );
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(413);
    expect(payload.error).toContain('8 byte limit');
    expect(webhooksMock).not.toHaveBeenCalled();
  });

  it('passes validated webhook requests into the Polar adapter and decorates the response', async () => {
    process.env.POLAR_WEBHOOK_SECRET = 'whsec_test';
    const { webhookRoute } = await loadRoutes();
    const response = await webhookRoute(
      new NextRequest('http://localhost/api/polar/webhooks', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': '2',
          'webhook-id': 'evt_123',
          'webhook-timestamp': '1710000000',
          'webhook-signature': 'v1,test'
        },
        body: '{}'
      })
    );
    const payload = (await response.json()) as { received: boolean };

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-diffmint-request-id')).toMatch(/^req_/);
    expect(payload.received).toBe(true);
    expect(webhooksMock).toHaveBeenCalledTimes(1);
  });
});
