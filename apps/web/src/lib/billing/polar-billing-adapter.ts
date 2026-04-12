import type {
  BillingAdapter,
  BillingCheckoutTarget,
  BillingWorkspaceContext,
  BillingWorkspaceSummary
} from './adapter';
import {
  buildPolarCheckoutUrl,
  buildPolarPortalUrl,
  getPolarConfig,
  isPolarConfigured
} from '@/lib/polar/config';

type CheckoutCatalogEntry = Omit<BillingCheckoutTarget, 'checkoutUrl' | 'productId'> & {
  planKey: 'pro' | 'team' | 'enterprise';
};

const checkoutCatalog: CheckoutCatalogEntry[] = [
  {
    planKey: 'pro',
    label: 'Pro',
    description: 'Individual seat with synced history and full CLI + VS Code workflows.'
  },
  {
    planKey: 'team',
    label: 'Team',
    description: 'Workspace seats, policy governance, audit logs, quotas, and BYOK controls.',
    recommended: true
  },
  {
    planKey: 'enterprise',
    label: 'Enterprise',
    description: 'Advanced governance, SSO roadmap, spend controls, and private deployment options.'
  }
];

export class PolarBillingAdapter implements BillingAdapter {
  async getWorkspaceSummary(context: BillingWorkspaceContext): Promise<BillingWorkspaceSummary> {
    const config = getPolarConfig();
    const configured = isPolarConfigured(config);
    const portalUrl = buildPolarPortalUrl(
      context.polarCustomerId ?? 'cus_devflow_core',
      config.appUrl
    );
    const planKey = context.planKey ?? 'team';

    return {
      provider: 'polar',
      environment: config.server,
      configured,
      planKey,
      planLabel: checkoutCatalog.find((plan) => plan.planKey === planKey)?.label ?? 'Team',
      subscriptionStatus: context.subscriptionStatus ?? (configured ? 'active' : 'inactive'),
      seatsUsed: context.seatsUsed ?? 26,
      seatLimit: context.seatLimit ?? 30,
      creditsIncluded: context.creditsIncluded ?? 200000,
      creditsRemaining: context.creditsRemaining ?? 156000,
      spendCapUsd: context.spendCapUsd ?? 500,
      polarCustomerId: context.polarCustomerId ?? 'cus_devflow_core',
      portalUrl,
      checkoutTargets: checkoutCatalog.map((plan) => ({
        ...plan,
        productId: config.productIds[plan.planKey],
        checkoutUrl: buildPolarCheckoutUrl({
          appUrl: config.appUrl,
          workspaceId: context.workspaceId,
          customerExternalId: context.customerExternalId ?? context.workspaceId,
          customerName: context.workspaceName,
          planKey: plan.planKey
        })
      })),
      notes: configured
        ? [
            'Polar is configured for this workspace. Use checkout links for upgrades and the customer portal for invoices and subscription management.',
            'Keep Polar product IDs aligned with seat-based plans and synced workspace quotas.'
          ]
        : [
            'Set POLAR_ACCESS_TOKEN to enable live checkout and customer portal links.',
            'Set POLAR_PRODUCT_ID_PRO, POLAR_PRODUCT_ID_TEAM, and POLAR_PRODUCT_ID_ENTERPRISE to map plan buttons to Polar products.',
            'Configure POLAR_WEBHOOK_SECRET before enabling production webhook processing.'
          ]
    };
  }
}
