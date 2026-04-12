import { randomUUID } from 'node:crypto';
import type {
  DeviceAuthSession,
  PolicyBundle,
  ProviderConfigSummary,
  ReleaseManifest,
  ReviewSession,
  UsageEvent,
  WorkspaceBootstrap
} from '@devflow/contracts';
import type {
  BillingPlanKey,
  BillingSubscriptionStatus,
  BillingWorkspaceContext
} from '@/lib/billing/adapter';
import {
  auditEvents as seededAuditEvents,
  billingWorkspaceSeed,
  policyBundles as seededPolicies,
  providerSummaries as seededProviders,
  releaseManifests as seededReleaseManifests,
  reviewSessions as seededReviewSessions,
  usageEvents as seededUsageEvents,
  workspaceQuotas,
  workspaceRole,
  workspaceSeed,
  workspaceSyncDefaults
} from '../data';

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

export interface BillingWorkspaceSnapshot {
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

interface StoredDeviceAuthSession extends DeviceAuthSession {
  autoApproveOnPoll: boolean;
}

interface ControlPlaneState {
  workspace: WorkspaceBootstrap['workspace'];
  role: WorkspaceBootstrap['role'];
  quotas: WorkspaceBootstrap['quotas'];
  syncDefaults: WorkspaceBootstrap['syncDefaults'];
  providers: ProviderConfigSummary[];
  policies: PolicyBundle[];
  reviews: ReviewSession[];
  releases: ReleaseManifest[];
  usageEvents: UsageEvent[];
  auditEvents: AuditEventRecord[];
  deviceSessions: StoredDeviceAuthSession[];
  billing: BillingWorkspaceSnapshot;
}

declare global {
  // eslint-disable-next-line no-var
  var __devflowControlPlaneState: ControlPlaneState | undefined;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getAppUrl(): string {
  return (
    process.env.DEVFLOW_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'
  );
}

function shouldAutoApproveDeviceFlow(): boolean {
  const configuredValue = process.env.DEVFLOW_DEVICE_FLOW_AUTO_APPROVE;

  if (configuredValue) {
    return configuredValue === 'true';
  }

  return process.env.NODE_ENV !== 'production';
}

function formatAuditTimestamp(date: Date): string {
  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

function createSeedState(): ControlPlaneState {
  return {
    workspace: clone(workspaceSeed),
    role: workspaceRole,
    quotas: clone(workspaceQuotas),
    syncDefaults: clone(workspaceSyncDefaults),
    providers: clone(seededProviders),
    policies: clone(seededPolicies),
    reviews: clone(seededReviewSessions),
    releases: clone(seededReleaseManifests),
    usageEvents: clone(seededUsageEvents),
    auditEvents: clone(seededAuditEvents),
    deviceSessions: [],
    billing: clone(billingWorkspaceSeed)
  };
}

function getState(): ControlPlaneState {
  globalThis.__devflowControlPlaneState ??= createSeedState();
  return globalThis.__devflowControlPlaneState;
}

function toPublicDeviceSession(session: StoredDeviceAuthSession): DeviceAuthSession {
  const { autoApproveOnPoll, ...publicSession } = session;
  void autoApproveOnPoll;
  return publicSession;
}

function getActivePolicy(state: ControlPlaneState): PolicyBundle {
  return state.policies[0];
}

function calculateQuotaRemainingPercent(state: ControlPlaneState): number {
  if (state.billing.creditsIncluded <= 0) {
    return 0;
  }

  return Math.round((state.billing.creditsRemaining / state.billing.creditsIncluded) * 100);
}

function calculateOverviewStats(state: ControlPlaneState): OverviewStat[] {
  return [
    {
      label: 'Synced reviews',
      value: String(state.reviews.length),
      helper: `${state.reviews.filter((review) => review.commandSource === 'cli').length} from CLI`
    },
    {
      label: 'Active seats',
      value: `${state.billing.seatsUsed} / ${state.billing.seatLimit}`,
      helper: `${Math.max(state.billing.seatLimit - state.billing.seatsUsed, 0)} seats remaining`
    },
    {
      label: 'Published policies',
      value: String(state.policies.length),
      helper: `${getActivePolicy(state).version} is active`
    },
    {
      label: 'Quota remaining',
      value: `${calculateQuotaRemainingPercent(state)}%`,
      helper: 'Managed provider credits'
    }
  ];
}

function buildDeviceVerificationUri(deviceCode: string): {
  verificationUri: string;
  verificationUriComplete: string;
} {
  const baseUrl = getAppUrl();
  const verificationUri = new URL('/auth/sign-in', baseUrl);
  const verificationUriComplete = new URL('/auth/sign-in', baseUrl);
  verificationUriComplete.searchParams.set('device_code', deviceCode);

  return {
    verificationUri: verificationUri.toString(),
    verificationUriComplete: verificationUriComplete.toString()
  };
}

function createAuditEvent(event: Omit<AuditEventRecord, 'id' | 'when'>): AuditEventRecord {
  return {
    ...event,
    id: `audit-${randomUUID()}`,
    when: formatAuditTimestamp(new Date())
  };
}

function normalizeReviewSession(input: ReviewSession, workspaceId: string): ReviewSession {
  return {
    ...input,
    id: input.id || `review-${randomUUID()}`,
    workspaceId: input.workspaceId ?? workspaceId,
    startedAt: input.startedAt ?? new Date().toISOString(),
    findings: input.findings ?? [],
    artifacts: input.artifacts ?? []
  };
}

export function getWorkspaceBootstrap(): WorkspaceBootstrap {
  const state = getState();
  const activePolicy = getActivePolicy(state);
  const activeProvider = state.providers[0];

  return {
    workspace: clone(state.workspace),
    role: state.role,
    policy: clone(activePolicy),
    provider: clone(activeProvider),
    quotas: clone(state.quotas),
    syncDefaults: clone(state.syncDefaults),
    releaseChannels: state.releases.map((release) => release.channel)
  };
}

export function listProviders(): ProviderConfigSummary[] {
  return clone(getState().providers);
}

export function listPolicies(): PolicyBundle[] {
  return clone(getState().policies);
}

export function listReviewSessions(): ReviewSession[] {
  return clone(getState().reviews);
}

export function listAuditEvents(): AuditEventRecord[] {
  return clone(getState().auditEvents);
}

export function listReleaseManifests(): ReleaseManifest[] {
  return clone(getState().releases);
}

export function listUsageEvents(): UsageEvent[] {
  return clone(getState().usageEvents);
}

export function getOverviewStats(): OverviewStat[] {
  return calculateOverviewStats(getState());
}

export function getBillingWorkspaceSnapshot(
  context?: Partial<Pick<BillingWorkspaceContext, 'workspaceId' | 'workspaceName'>>
): BillingWorkspaceSnapshot {
  const snapshot = clone(getState().billing);

  if (context?.workspaceId) {
    snapshot.workspaceId = context.workspaceId;
  }

  if (context?.workspaceName) {
    snapshot.workspaceName = context.workspaceName;
  }

  return snapshot;
}

export function recordReviewSession(session: ReviewSession): ReviewSession {
  const state = getState();
  const normalized = normalizeReviewSession(session, state.workspace.id);

  state.reviews = [
    normalized,
    ...state.reviews.filter((item) => item.traceId !== normalized.traceId)
  ];

  state.usageEvents = [
    {
      id: `usage-${randomUUID()}`,
      workspaceId: normalized.workspaceId ?? state.workspace.id,
      source: normalized.commandSource,
      event: normalized.status === 'failed' ? 'review.failed' : 'review.completed',
      creditsDelta: -Math.max(250, normalized.findings.length * 100),
      metadata: {
        traceId: normalized.traceId,
        provider: normalized.provider ?? 'unknown',
        model: normalized.model ?? 'unknown'
      },
      createdAt: new Date().toISOString()
    },
    ...state.usageEvents
  ];

  state.auditEvents = [
    createAuditEvent({
      event: 'review.synced',
      actor: `Devflow ${normalized.commandSource.toUpperCase()}`,
      target: normalized.traceId,
      detail: `Uploaded ${normalized.summary}`
    }),
    ...state.auditEvents
  ];

  return clone(normalized);
}

export function recordUsageEvent(
  event: Omit<UsageEvent, 'id' | 'createdAt' | 'workspaceId'> & { workspaceId?: string }
): UsageEvent {
  const state = getState();
  const normalized: UsageEvent = {
    ...event,
    id: `usage-${randomUUID()}`,
    workspaceId: event.workspaceId ?? state.workspace.id,
    createdAt: new Date().toISOString()
  };

  state.usageEvents = [normalized, ...state.usageEvents];
  return clone(normalized);
}

export function startDeviceAuth(workspaceId?: string): DeviceAuthSession {
  const state = getState();
  const deviceCode = `device_${randomUUID()}`;
  const userCode = `FLOW-${Math.floor(1000 + Math.random() * 9000)}`;
  const verification = buildDeviceVerificationUri(deviceCode);
  const session: StoredDeviceAuthSession = {
    deviceCode,
    userCode,
    verificationUri: verification.verificationUri,
    verificationUriComplete: verification.verificationUriComplete,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    intervalSeconds: 2,
    status: 'pending',
    workspaceId: workspaceId ?? state.workspace.id,
    autoApproveOnPoll: shouldAutoApproveDeviceFlow()
  };

  state.deviceSessions = [session, ...state.deviceSessions];
  return toPublicDeviceSession(session);
}

export function pollDeviceAuth(deviceCode: string): DeviceAuthSession | null {
  const state = getState();
  const session = state.deviceSessions.find((item) => item.deviceCode === deviceCode);

  if (!session) {
    return null;
  }

  if (session.status === 'revoked' || session.status === 'approved') {
    return toPublicDeviceSession(session);
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    session.status = 'expired';
    return toPublicDeviceSession(session);
  }

  if (session.autoApproveOnPoll) {
    session.status = 'approved';

    state.usageEvents = [
      {
        id: `usage-${randomUUID()}`,
        workspaceId: session.workspaceId ?? state.workspace.id,
        source: 'cli',
        event: 'auth.login',
        createdAt: new Date().toISOString()
      },
      ...state.usageEvents
    ];

    state.auditEvents = [
      createAuditEvent({
        event: 'device.auth_approved',
        actor: 'Devflow Control Plane',
        target: session.deviceCode,
        detail: `Approved device auth for workspace ${session.workspaceId ?? state.workspace.id}.`
      }),
      ...state.auditEvents
    ];
  }

  return toPublicDeviceSession(session);
}

export function revokeDeviceAuth(deviceCode: string): DeviceAuthSession | null {
  const state = getState();
  const session = state.deviceSessions.find((item) => item.deviceCode === deviceCode);

  if (!session) {
    return null;
  }

  session.status = 'revoked';
  state.auditEvents = [
    createAuditEvent({
      event: 'device.auth_revoked',
      actor: 'Devflow Control Plane',
      target: session.deviceCode,
      detail: `Revoked device auth for workspace ${session.workspaceId ?? state.workspace.id}.`
    }),
    ...state.auditEvents
  ];

  return toPublicDeviceSession(session);
}

export function resetControlPlaneState(): void {
  globalThis.__devflowControlPlaneState = createSeedState();
}
