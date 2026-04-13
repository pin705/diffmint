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

const planLabels: Record<BillingWorkspaceSummary['planKey'], string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
  enterprise: 'Enterprise'
};

export class PolarBillingAdapter implements BillingAdapter {
  async getWorkspaceSummary(context: BillingWorkspaceContext): Promise<BillingWorkspaceSummary> {
    const config = getPolarConfig();
    const configured = isPolarConfigured(config);
    const planKey = context.planKey ?? 'free';
    const portalUrl =
      planKey === 'free' ? undefined : buildPolarPortalUrl(context.polarCustomerId, config.appUrl);
    const checkoutTargets =
      planKey === 'free'
        ? []
        : checkoutCatalog.map((plan) => ({
            ...plan,
            productId: config.productIds[plan.planKey],
            checkoutUrl: buildPolarCheckoutUrl({
              appUrl: config.appUrl,
              workspaceId: context.workspaceId,
              customerExternalId: context.customerExternalId ?? context.workspaceId,
              customerName: context.workspaceName,
              planKey: plan.planKey
            })
          }));

    return {
      provider: 'polar',
      environment: config.server,
      configured,
      planKey,
      planLabel: planLabels[planKey],
      subscriptionStatus:
        context.subscriptionStatus ??
        (planKey === 'free' ? 'active' : configured ? 'active' : 'inactive'),
      seatsUsed: context.seatsUsed ?? 0,
      seatLimit: context.seatLimit ?? 0,
      creditsIncluded: context.creditsIncluded ?? 0,
      creditsRemaining: context.creditsRemaining ?? 0,
      spendCapUsd: context.spendCapUsd ?? 0,
      polarCustomerId: context.polarCustomerId,
      portalUrl,
      checkoutTargets,
      notes:
        planKey === 'free'
          ? [
              'Workspace is running on the free plan. No self-serve upgrade catalog is exposed in the app.',
              configured
                ? 'Polar can stay connected for future billing operations, but paid checkout flows are currently hidden.'
                : 'Polar is optional while the workspace remains on the free plan.'
            ]
          : configured
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
