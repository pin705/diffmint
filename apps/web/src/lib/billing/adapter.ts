export type BillingPlanKey = 'free' | 'pro' | 'team' | 'enterprise';
export type BillingSubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'inactive';

export interface BillingCheckoutTarget {
  planKey: BillingPlanKey;
  label: string;
  description: string;
  productId?: string;
  checkoutUrl?: string;
  recommended?: boolean;
}

export interface BillingWorkspaceSummary {
  provider: 'polar';
  environment: 'sandbox' | 'production';
  configured: boolean;
  planKey: BillingPlanKey;
  planLabel: string;
  subscriptionStatus: BillingSubscriptionStatus;
  seatsUsed: number;
  seatLimit: number;
  creditsIncluded: number;
  creditsRemaining: number;
  spendCapUsd: number;
  polarCustomerId?: string;
  portalUrl?: string;
  checkoutTargets: BillingCheckoutTarget[];
  notes: string[];
}

export interface BillingWorkspaceContext {
  workspaceId: string;
  workspaceName?: string;
  customerExternalId?: string;
  planKey?: BillingPlanKey;
  subscriptionStatus?: BillingSubscriptionStatus;
  seatsUsed?: number;
  seatLimit?: number;
  creditsIncluded?: number;
  creditsRemaining?: number;
  spendCapUsd?: number;
  polarCustomerId?: string;
}

export interface BillingAdapter {
  getWorkspaceSummary(context: BillingWorkspaceContext): Promise<BillingWorkspaceSummary>;
}
