import type {
  PolicyBundle,
  ProviderConfigSummary,
  ReleaseManifest,
  ReviewSession,
  UsageEvent,
  WorkspaceBootstrap
} from '@devflow/contracts';
import type { BillingPlanKey, BillingSubscriptionStatus } from '@/lib/billing/adapter';
import { createDefaultPolicyBundle } from '@devflow/policy-engine';

const workspaceId = 'ws_devflow_core';

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
  slug: 'devflow-core',
  name: 'Devflow Core'
};

export const workspaceRole: WorkspaceBootstrap['role'] = 'owner';

export const workspaceQuotas: WorkspaceBootstrap['quotas'] = {
  includedCredits: 200000,
  remainingCredits: 156000,
  seats: 26,
  seatLimit: 30,
  spendCapUsd: 500
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
    allowedModels: ['qwen-code', 'qwen-max'],
    fallbackProvider: 'openai-compatible',
    rateLimitPerMinute: 60,
    encrypted: true,
    updatedAt: '2026-04-12T08:30:00.000Z'
  },
  {
    id: 'provider-byok-lab',
    provider: 'openai-compatible',
    mode: 'byok',
    defaultModel: 'gpt-5.4-mini',
    allowedModels: ['gpt-5.4-mini', 'gpt-5.4'],
    fallbackProvider: 'qwen',
    rateLimitPerMinute: 30,
    encrypted: true,
    updatedAt: '2026-04-10T16:15:00.000Z'
  }
];

const defaultPolicy = createDefaultPolicyBundle(workspaceId);

export const policyBundles: PolicyBundle[] = [
  defaultPolicy,
  {
    ...defaultPolicy,
    policyVersionId: 'frontend-docs-v2',
    version: '2.0.0',
    checksum: 'frontend-docs-v2',
    name: 'Frontend and Docs Rules',
    summary: 'Extra guidance for docs integrity, changelog gating, and provider UX.',
    publishedAt: '2026-04-11T09:00:00.000Z'
  }
];

export const reviewSessions: ReviewSession[] = [
  {
    id: 'review-001',
    traceId: 'trace-devflow-001',
    requestId: 'request-001',
    workspaceId,
    source: 'branch_compare',
    commandSource: 'cli',
    provider: 'qwen',
    model: 'qwen-code',
    policyVersionId: defaultPolicy.policyVersionId,
    status: 'completed',
    summary: 'Docs and control-plane review completed with two medium findings.',
    severityCounts: { low: 0, medium: 2, high: 0, critical: 0 },
    findings: [],
    durationMs: 14300,
    startedAt: '2026-04-12T09:00:00.000Z',
    completedAt: '2026-04-12T09:00:14.300Z',
    artifacts: []
  },
  {
    id: 'review-002',
    traceId: 'trace-devflow-002',
    requestId: 'request-002',
    workspaceId,
    source: 'selected_files',
    commandSource: 'vscode',
    provider: 'qwen',
    model: 'qwen-code',
    policyVersionId: 'frontend-docs-v2',
    status: 'completed',
    summary: 'Selected files review flagged a missing verification note on provider settings.',
    severityCounts: { low: 1, medium: 1, high: 0, critical: 0 },
    findings: [],
    durationMs: 9800,
    startedAt: '2026-04-12T08:12:00.000Z',
    completedAt: '2026-04-12T08:12:09.800Z',
    artifacts: []
  },
  {
    id: 'review-003',
    traceId: 'trace-devflow-003',
    requestId: 'request-003',
    workspaceId,
    source: 'local_diff',
    commandSource: 'cli',
    provider: 'qwen',
    model: 'qwen-code',
    policyVersionId: defaultPolicy.policyVersionId,
    status: 'completed',
    summary: 'Local diff review caught an auth path update without explicit test coverage.',
    severityCounts: { low: 0, medium: 0, high: 1, critical: 0 },
    findings: [],
    durationMs: 12100,
    startedAt: '2026-04-11T14:32:00.000Z',
    completedAt: '2026-04-11T14:32:12.100Z',
    artifacts: []
  }
];

export const releaseManifests: ReleaseManifest[] = [
  {
    channel: 'stable',
    version: '0.1.0',
    releasedAt: '2026-04-12T00:00:00.000Z',
    cli: {
      version: '0.1.0',
      downloadUrl: 'https://example.com/devflow-cli',
      checksum: 'sha256-cli'
    },
    vscode: {
      version: '0.1.0',
      marketplaceUrl: 'https://example.com/devflow-vscode',
      checksum: 'sha256-vscode'
    },
    notesUrl: 'http://localhost:3000/docs/changelog/2026-04-foundation'
  }
];

export const usageEvents: UsageEvent[] = [
  {
    id: 'usage-001',
    workspaceId,
    actorId: 'user_devflow_owner',
    source: 'cli',
    event: 'review.completed',
    creditsDelta: -1200,
    metadata: {
      traceId: 'trace-devflow-001',
      commandSource: 'cli'
    },
    createdAt: '2026-04-12T09:00:15.000Z'
  }
];

export const billingWorkspaceSeed: BillingWorkspaceSeed = {
  workspaceId,
  workspaceName: workspaceSeed.name,
  customerId: 'cus_devflow_core',
  planKey: 'team',
  subscriptionStatus: 'active',
  seatsUsed: 26,
  seatLimit: 30,
  creditsIncluded: 200000,
  creditsRemaining: 156000,
  spendCapUsd: 500
};

export const auditEvents: AuditEventRecord[] = [
  {
    id: 'audit-001',
    event: 'policy.version_published',
    actor: 'Quynh Tran',
    target: 'Frontend and Docs Rules v2.0.0',
    when: '2026-04-11 09:00 UTC',
    detail: 'Published new guidance for docs links and changelog gating.'
  },
  {
    id: 'audit-002',
    event: 'provider.config_updated',
    actor: 'Bao Nguyen',
    target: 'Managed Qwen provider',
    when: '2026-04-10 16:15 UTC',
    detail: 'Added OpenAI-compatible fallback and lowered rate limit for BYOK traffic.'
  },
  {
    id: 'audit-003',
    event: 'review.synced',
    actor: 'Devflow CLI',
    target: 'trace-devflow-001',
    when: '2026-04-12 09:00 UTC',
    detail: 'Uploaded summary, severity counts, and markdown artifact.'
  }
];

export const overviewStats: OverviewStat[] = [
  {
    label: 'Synced reviews',
    value: '148',
    helper: '+18 this week'
  },
  {
    label: 'Active seats',
    value: '26 / 30',
    helper: '4 seats remaining'
  },
  {
    label: 'Published policies',
    value: '2',
    helper: '1 version live'
  },
  {
    label: 'Quota remaining',
    value: '78%',
    helper: 'Managed provider credits'
  }
];
