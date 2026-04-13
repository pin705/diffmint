import type {
  PolicyBundle,
  ProviderConfigSummary,
  ReleaseManifest,
  ReviewSession,
  UsageEvent,
  WorkspaceBootstrap
} from '@diffmint/contracts';
import type { BillingPlanKey, BillingSubscriptionStatus } from '@/lib/billing/adapter';
import { createDefaultPolicyBundle } from '@diffmint/policy-engine';

const workspaceId = 'ws_diffmint_core';

export interface AuditEventRecord {
  id: string;
  event: string;
  actor: string;
  target: string;
  when: string;
  detail: string;
}

export interface OverviewStat {
  label: string;
  value: string;
  helper: string;
}

export interface BillingWorkspaceSeed {
  workspaceId: string;
  workspaceName: string;
  customerId?: string;
  planKey: BillingPlanKey;
  subscriptionStatus: BillingSubscriptionStatus;
  seatsUsed: number;
  seatLimit: number;
  creditsIncluded: number;
  creditsRemaining: number;
  spendCapUsd: number;
}

export const workspaceSeed: WorkspaceBootstrap['workspace'] = {
  id: workspaceId,
  slug: 'diffmint-core',
  name: 'Diffmint Core'
};

export const workspaceRole: WorkspaceBootstrap['role'] = 'owner';

export const workspaceQuotas: WorkspaceBootstrap['quotas'] = {
  includedCredits: 0,
  remainingCredits: 0,
  seats: 0,
  seatLimit: 0,
  spendCapUsd: 0
};

export const workspaceSyncDefaults: WorkspaceBootstrap['syncDefaults'] = {
  cloudSyncEnabled: true,
  localOnlyDefault: false,
  redactionEnabled: true
};

export const providerSummaries: ProviderConfigSummary[] = [
  {
    id: 'provider-managed-qwen',
    provider: 'qwen',
    mode: 'managed',
    defaultModel: 'qwen-code',
    allowedModels: ['qwen-code'],
    rateLimitPerMinute: 60,
    encrypted: true,
    updatedAt: '2026-04-13T00:00:00.000Z'
  }
];

const defaultPolicy = createDefaultPolicyBundle(workspaceId);

export const policyBundles: PolicyBundle[] = [defaultPolicy];

export const reviewSessions: ReviewSession[] = [];

export const releaseManifests: ReleaseManifest[] = [];

export const usageEvents: UsageEvent[] = [];

export const billingWorkspaceSeed: BillingWorkspaceSeed = {
  workspaceId,
  workspaceName: workspaceSeed.name,
  planKey: 'free',
  subscriptionStatus: 'active',
  seatsUsed: 0,
  seatLimit: 0,
  creditsIncluded: 0,
  creditsRemaining: 0,
  spendCapUsd: 0
};

export const auditEvents: AuditEventRecord[] = [];

export const overviewStats: OverviewStat[] = [
  {
    label: 'Synced reviews',
    value: '0',
    helper: 'No synced reviews yet'
  },
  {
    label: 'Active seats',
    value: '0 / 0',
    helper: 'Free workspace'
  },
  {
    label: 'Published policies',
    value: '1',
    helper: defaultPolicy.version
  },
  {
    label: 'Quota remaining',
    value: '0%',
    helper: 'No managed quota assigned'
  }
];
