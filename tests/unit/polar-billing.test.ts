import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PolarBillingAdapter } from '../../apps/web/src/lib/billing/polar-billing-adapter.ts';
import {
  buildPolarCheckoutUrl,
  buildPolarPortalUrl,
  getPolarConfig,
  isPolarConfigured
} from '../../apps/web/src/lib/polar/config.ts';

const originalEnv = { ...process.env };

describe('polar billing integration helpers', () => {
  beforeEach(() => {
    process.env.POLAR_SERVER = 'sandbox';
    process.env.POLAR_ACCESS_TOKEN = 'polar_oat_test';
    process.env.POLAR_WEBHOOK_SECRET = 'polar_whsec_test';
    process.env.POLAR_PRODUCT_ID_PRO = 'prod_pro';
    process.env.POLAR_PRODUCT_ID_TEAM = 'prod_team';
    process.env.POLAR_PRODUCT_ID_ENTERPRISE = 'prod_enterprise';
    process.env.DIFFMINT_APP_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('reads env-backed Polar configuration and builds checkout urls', () => {
    const config = getPolarConfig();
    const checkoutUrl = buildPolarCheckoutUrl({
      workspaceId: 'ws_diffmint_core',
      customerExternalId: 'org_123',
      customerName: 'Diffmint Core',
      planKey: 'team'
    });
    const portalUrl = buildPolarPortalUrl('cus_diffmint_core');

    expect(config.server).toBe('sandbox');
    expect(config.productIds.team).toBe('prod_team');
    expect(isPolarConfigured(config)).toBe(true);
    expect(checkoutUrl).toContain('/api/polar/checkout');
    expect(checkoutUrl).toContain('products=prod_team');
    expect(checkoutUrl).toContain('customerExternalId=org_123');
    expect(portalUrl).toBe('http://localhost:3000/api/polar/portal?customerId=cus_diffmint_core');
  });

  it('returns a workspace summary with Polar checkout targets', async () => {
    const adapter = new PolarBillingAdapter();
    const summary = await adapter.getWorkspaceSummary({
      workspaceId: 'ws_diffmint_core',
      workspaceName: 'Diffmint Core',
      customerExternalId: 'org_123'
    });

    expect(summary.provider).toBe('polar');
    expect(summary.planKey).toBe('team');
    expect(summary.checkoutTargets).toHaveLength(3);
    expect(summary.checkoutTargets.find((target) => target.planKey === 'team')?.recommended).toBe(
      true
    );
    expect(summary.checkoutTargets.every((target) => target.checkoutUrl)).toBe(true);
    expect(summary.portalUrl).toContain('/api/polar/portal');
  });
});
