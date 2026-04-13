import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import type {
  Finding,
  FindingSeverity,
  PolicyBundle,
  ReviewMode,
  ReviewOutputFormat,
  ReviewRequest,
  ReviewSession,
  ReviewSourceType
} from '@diffmint/contracts';
import { buildPolicyPrompt } from '@diffmint/policy-engine';
import { buildHeadlessReviewPrompt, buildReviewContextSummary } from './context';
import { renderMarkdownSession, renderTerminalSession } from './render';

export { renderMarkdownSession, renderTerminalSession } from './render';

export interface BuildReviewRequestOptions {
  cwd: string;
  source: ReviewSourceType;
  outputFormat?: ReviewOutputFormat;
  mode?: ReviewMode;
  baseRef?: string;
  files?: string[];
  staged?: boolean;
  localOnly?: boolean;
  cloudSyncEnabled?: boolean;
  policy?: PolicyBundle;
  provider?: string;
  model?: string;
}

export interface DoctorCheck {
  id: string;
  label: string;
  status: 'ok' | 'warn' | 'fail';
  detail: string;
}

export interface CreateReviewSessionRuntimeOptions {
  cwd?: string;
  policy?: PolicyBundle;
  provider?: string;
  model?: string;
}

export interface ReviewSessionSanitizationOptions {
  redactText?: boolean;
  omitRawProviderOutput?: boolean;
}

interface QwenHeadlessResult {
  findings: Finding[];
  summary: string;
  durationMs: number;
  rawOutput: string;
}

function run(command: string, args: string[], cwd: string): string {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim();
}

function tryRun(command: string, args: string[], cwd: string): string | null {
  try {
    return run(command, args, cwd);
  } catch {
    return null;
  }
}

function buildGitDiffArgs({
  baseRef,
  files,
  staged
}: Pick<BuildReviewRequestOptions, 'baseRef' | 'files' | 'staged'>): string[] {
  const args = ['diff'];

  if (staged) {
    args.push('--staged');
  }

  if (baseRef) {
    args.push(`${baseRef}...HEAD`);
  }

  args.push('--');

  if (files && files.length > 0) {
    args.push(...files);
  }

  return args;
}

export function createTraceId(): string {
  return randomUUID();
}

export function collectGitDiff(options: BuildReviewRequestOptions): string {
  const diff = tryRun('git', buildGitDiffArgs(options), options.cwd);
  return diff ?? '';
}

export function getCurrentBranch(cwd: string): string | undefined {
  return tryRun('git', ['rev-parse', '--abbrev-ref', 'HEAD'], cwd) ?? undefined;
}

export function detectChangedFiles(diff: string): string[] {
  const fileMatches = diff.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm);
  const files = new Set<string>();

  for (const match of fileMatches) {
    files.add(match[2]);
  }

  return [...files];
}

function countSeverity(findings: Finding[], severity: FindingSeverity): number {
  return findings.filter((item) => item.severity === severity).length;
}

function redactSensitiveText(value: string | undefined): string | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }

  return value
    .replace(
      /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]+?-----END [A-Z ]*PRIVATE KEY-----/g,
      '[REDACTED PRIVATE KEY]'
    )
    .replace(/\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/gi, 'Bearer [REDACTED]')
    .replace(/\b(?:sk|pk|rk)_[A-Za-z0-9_-]{16,}\b/g, '[REDACTED API KEY]')
    .replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, '[REDACTED API KEY]')
    .replace(/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, '[REDACTED GITHUB TOKEN]')
    .replace(/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, '[REDACTED GITHUB TOKEN]')
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTED AWS ACCESS KEY]')
    .replace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, '[REDACTED GOOGLE API KEY]')
    .replace(/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, '[REDACTED SLACK TOKEN]')
    .replace(
      /((?:token|secret|password|passphrase|api[_-]?key|access[_-]?key|client[_-]?secret)\s*[:=]\s*)(['"]?)([^'"\s]+)\2/gi,
      (_match: string, prefix: string, quote: string) => `${prefix}${quote}[REDACTED]${quote}`
    );
}

function sanitizeArtifactForCloudSync(
  artifact: ReviewSession['artifacts'][number],
  options: Required<ReviewSessionSanitizationOptions>
): ReviewSession['artifacts'][number] {
  if (options.omitRawProviderOutput && artifact.kind === 'raw-provider-output') {
    return {
      ...artifact,
      mimeType: 'text/plain',
      content: '[REDACTED raw provider output omitted from cloud sync]',
      storageKey: undefined
    };
  }

  return {
    ...artifact,
    content: options.redactText ? redactSensitiveText(artifact.content) : artifact.content,
    storageKey: options.redactText ? redactSensitiveText(artifact.storageKey) : artifact.storageKey
  };
}

function createFinding(
  severity: FindingSeverity,
  title: string,
  summary: string,
  filePath?: string,
  suggestedAction?: string
): Finding {
  return {
    id: randomUUID(),
    severity,
    title,
    summary,
    filePath,
    suggestedAction
  };
}

export function buildReviewRequest(options: BuildReviewRequestOptions): ReviewRequest {
  const diff = collectGitDiff(options);
  const files =
    options.files && options.files.length > 0 ? options.files : detectChangedFiles(diff);
  const promptProfile = 'diffmint-codex-compact-v1';
  const baseRequest = {
    id: randomUUID(),
    traceId: createTraceId(),
    source: options.source,
    commandSource: 'cli',
    mode: options.mode ?? 'full',
    outputFormat: options.outputFormat ?? 'terminal',
    baseRef: options.baseRef,
    files,
    diff,
    promptProfile,
    policyVersionId: options.policy?.policyVersionId,
    localOnly: options.localOnly ?? false,
    cloudSyncEnabled: options.cloudSyncEnabled ?? true,
    metadata: {
      cwd: options.cwd,
      gitBranch: getCurrentBranch(options.cwd),
      provider: options.provider,
      model: options.model
    },
    createdAt: new Date().toISOString()
  } satisfies ReviewRequest;

  return {
    ...baseRequest,
    metadata: {
      ...baseRequest.metadata,
      context: buildReviewContextSummary(baseRequest)
    }
  };
}

export function previewHeadlessCommand(request: ReviewRequest, policy?: PolicyBundle): string[] {
  const baseArgs = ['review', '--mode', request.mode];

  if (request.baseRef) {
    baseArgs.push('--base', request.baseRef);
  }

  if (request.files.length > 0) {
    baseArgs.push('--files', ...request.files);
  }

  if (policy) {
    baseArgs.push('--policy', buildPolicyPrompt(policy));
  }

  return baseArgs;
}

function findQwenBinary(cwd: string): string | null {
  const candidates = ['qwen', 'qwen-code', 'qwen-code-cli'];

  for (const candidate of candidates) {
    if (tryRun(candidate, ['--version'], cwd)) {
      return candidate;
    }
  }

  return null;
}

function hasHeadlessAuthConfig(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY ||
    process.env.QWEN_API_KEY ||
    process.env.DASHSCOPE_API_KEY ||
    process.env.ANTHROPIC_API_KEY
  );
}

function shouldUseQwenRuntime(cwd: string): boolean {
  const forcedMode = process.env.DIFFMINT_REVIEW_RUNTIME;

  if (forcedMode === 'scaffold') {
    return false;
  }

  if (forcedMode === 'qwen') {
    return Boolean(findQwenBinary(cwd));
  }

  return Boolean(findQwenBinary(cwd) && hasHeadlessAuthConfig());
}

function extractAssistantTextFromQwenPayload(payload: unknown): string | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  for (let index = payload.length - 1; index >= 0; index -= 1) {
    const item = payload[index];

    if (
      item &&
      typeof item === 'object' &&
      'type' in item &&
      (item as { type?: string }).type === 'result' &&
      typeof (item as { result?: unknown }).result === 'string'
    ) {
      return (item as { result: string }).result;
    }

    if (
      item &&
      typeof item === 'object' &&
      'type' in item &&
      (item as { type?: string }).type === 'assistant'
    ) {
      const message = (item as { message?: { content?: Array<{ type?: string; text?: string }> } })
        .message;
      const textParts =
        message?.content
          ?.filter(
            (contentPart) => contentPart.type === 'text' && typeof contentPart.text === 'string'
          )
          .map((contentPart) => contentPart.text as string) ?? [];

      if (textParts.length > 0) {
        return textParts.join('\n');
      }
    }
  }

  return null;
}

function extractJsonObject(raw: string): string | null {
  const trimmed = raw.trim();

  if (!trimmed) {
    return null;
  }

  const directStart = trimmed.indexOf('{');
  const directEnd = trimmed.lastIndexOf('}');

  if (directStart !== -1 && directEnd !== -1 && directEnd > directStart) {
    return trimmed.slice(directStart, directEnd + 1);
  }

  return null;
}

function normalizeFindingFromQwen(value: unknown): Finding | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const severity = candidate.severity;
  const title = candidate.title;
  const summary = candidate.summary;

  if (
    severity !== 'low' &&
    severity !== 'medium' &&
    severity !== 'high' &&
    severity !== 'critical'
  ) {
    return null;
  }

  if (typeof title !== 'string' || typeof summary !== 'string') {
    return null;
  }

  return {
    id: randomUUID(),
    severity,
    title,
    summary,
    filePath: typeof candidate.filePath === 'string' ? candidate.filePath : undefined,
    suggestedAction:
      typeof candidate.suggestedAction === 'string' ? candidate.suggestedAction : undefined
  };
}

function parseQwenHeadlessOutput(rawOutput: string): QwenHeadlessResult | null {
  try {
    const payload = JSON.parse(rawOutput) as unknown;
    const assistantText = extractAssistantTextFromQwenPayload(payload);

    if (!assistantText) {
      return null;
    }

    const embeddedJson = extractJsonObject(assistantText);

    if (!embeddedJson) {
      return {
        findings: [],
        summary: assistantText.trim(),
        durationMs: 1000,
        rawOutput
      };
    }

    const reviewPayload = JSON.parse(embeddedJson) as {
      summary?: unknown;
      findings?: unknown[];
    };
    const findings =
      reviewPayload.findings
        ?.map((finding) => normalizeFindingFromQwen(finding))
        .filter((finding): finding is Finding => Boolean(finding)) ?? [];
    const summary =
      typeof reviewPayload.summary === 'string' && reviewPayload.summary.trim().length > 0
        ? reviewPayload.summary.trim()
        : findings.length === 0
          ? 'Qwen completed the headless review with no structured findings.'
          : `Qwen completed the headless review with ${findings.length} structured findings.`;

    return {
      findings,
      summary,
      durationMs: 1000,
      rawOutput
    };
  } catch {
    return null;
  }
}

function runQwenHeadlessReview(
  request: ReviewRequest,
  options: CreateReviewSessionRuntimeOptions
): QwenHeadlessResult | null {
  const cwd = options.cwd ?? request.metadata.cwd;
  const qwenBinary = findQwenBinary(cwd);

  if (!qwenBinary) {
    return null;
  }

  const startedAt = Date.now();

  try {
    const output = execFileSync(
      qwenBinary,
      [
        '--prompt',
        buildHeadlessReviewPrompt(request, options.policy),
        '--output-format',
        'json',
        '--model',
        options.model ?? request.metadata.model ?? 'qwen-code'
      ],
      {
        cwd,
        encoding: 'utf8',
        input: request.diff,
        stdio: ['pipe', 'pipe', 'pipe']
      }
    );

    const parsed = parseQwenHeadlessOutput(output);

    if (!parsed) {
      return null;
    }

    return {
      ...parsed,
      durationMs: Math.max(Date.now() - startedAt, 1)
    };
  } catch {
    return null;
  }
}

export function createFindingsFromRequest(request: ReviewRequest): Finding[] {
  const findings: Finding[] = [];

  if (!request.diff.trim()) {
    findings.push(
      createFinding(
        'low',
        'No local changes detected',
        'The requested review scope did not produce a git diff. Confirm the target files, base ref, or staged state before rerunning.'
      )
    );
    return findings;
  }

  const files = request.files;

  for (const file of files) {
    if (
      file.includes('/api/') ||
      file.endsWith('route.ts') ||
      file.includes('billing') ||
      file.includes('auth')
    ) {
      findings.push(
        createFinding(
          'high',
          'Sensitive control-plane surface changed',
          `Changes in ${file} affect auth, billing, or API behavior. Run a security-oriented pass and capture verification steps before merge.`,
          file,
          'Rerun with `dm review --base origin/main --mode security` and document the verification plan.'
        )
      );
    }

    if (file.includes('policy') || file.includes('docs')) {
      findings.push(
        createFinding(
          'medium',
          'Governance content changed',
          `Updates in ${file} should stay aligned with the active workspace policy version and release notes.`,
          file,
          'Confirm the policy version, changelog entry, and related docs links are updated together.'
        )
      );
    }
  }

  const hasTests = files.some((file) => file.includes('test') || file.includes('__tests__'));
  if (!hasTests) {
    findings.push(
      createFinding(
        'medium',
        'No test changes found',
        'The diff does not appear to include automated test coverage. Confirm whether the change is low-risk or document manual verification.'
      )
    );
  }

  return findings;
}

export function createReviewSession(request: ReviewRequest): ReviewSession {
  const findings = createFindingsFromRequest(request);
  const startedAt = new Date().toISOString();
  const completedAt = new Date().toISOString();
  const context = request.metadata.context ?? buildReviewContextSummary(request);

  return {
    id: randomUUID(),
    traceId: request.traceId,
    requestId: request.id,
    source: request.source,
    commandSource: request.commandSource,
    provider: request.metadata.provider ?? 'qwen',
    model: request.metadata.model ?? 'qwen-code',
    policyVersionId: request.policyVersionId,
    status: 'completed',
    findings,
    context,
    summary:
      findings.length === 0
        ? 'No obvious issues detected in the selected review scope.'
        : `Generated ${findings.length} review findings for ${context.fileSummary.toLowerCase()}.`,
    severityCounts: {
      low: countSeverity(findings, 'low'),
      medium: countSeverity(findings, 'medium'),
      high: countSeverity(findings, 'high'),
      critical: countSeverity(findings, 'critical')
    },
    durationMs: 250,
    startedAt,
    completedAt,
    artifacts: [
      {
        id: randomUUID(),
        kind: 'terminal',
        label: 'Terminal Summary',
        mimeType: 'text/plain',
        content: renderTerminalSession(request, findings)
      }
    ]
  };
}

export async function createReviewSessionWithRuntime(
  request: ReviewRequest,
  options: CreateReviewSessionRuntimeOptions = {}
): Promise<ReviewSession> {
  const cwd = options.cwd ?? request.metadata.cwd;

  if (!shouldUseQwenRuntime(cwd)) {
    return createReviewSession(request);
  }

  const runtimeResult = runQwenHeadlessReview(request, options);

  if (!runtimeResult) {
    return createReviewSession(request);
  }

  const findings = runtimeResult.findings;
  const startedAt = new Date().toISOString();
  const completedAt = new Date().toISOString();
  const context = request.metadata.context ?? buildReviewContextSummary(request);

  return {
    id: randomUUID(),
    traceId: request.traceId,
    requestId: request.id,
    source: request.source,
    commandSource: request.commandSource,
    provider: options.provider ?? request.metadata.provider ?? 'qwen',
    model: options.model ?? request.metadata.model ?? 'qwen-code',
    policyVersionId: request.policyVersionId,
    status: 'completed',
    findings,
    context,
    summary: runtimeResult.summary,
    severityCounts: {
      low: countSeverity(findings, 'low'),
      medium: countSeverity(findings, 'medium'),
      high: countSeverity(findings, 'high'),
      critical: countSeverity(findings, 'critical')
    },
    durationMs: runtimeResult.durationMs,
    startedAt,
    completedAt,
    artifacts: [
      {
        id: randomUUID(),
        kind: 'terminal',
        label: 'Terminal Summary',
        mimeType: 'text/plain',
        content: renderTerminalSession(request, findings)
      },
      {
        id: randomUUID(),
        kind: 'raw-provider-output',
        label: 'Qwen Headless Output',
        mimeType: 'application/json',
        content: runtimeResult.rawOutput
      }
    ]
  };
}

export function sanitizeReviewSessionForCloudSync(
  session: ReviewSession,
  options: ReviewSessionSanitizationOptions = {}
): ReviewSession {
  const normalizedOptions: Required<ReviewSessionSanitizationOptions> = {
    redactText: options.redactText ?? true,
    omitRawProviderOutput: options.omitRawProviderOutput ?? true
  };

  return {
    ...session,
    summary: normalizedOptions.redactText
      ? (redactSensitiveText(session.summary) ?? session.summary)
      : session.summary,
    findings: session.findings.map((finding) => ({
      ...finding,
      title: normalizedOptions.redactText
        ? (redactSensitiveText(finding.title) ?? finding.title)
        : finding.title,
      summary: normalizedOptions.redactText
        ? (redactSensitiveText(finding.summary) ?? finding.summary)
        : finding.summary,
      suggestedAction: normalizedOptions.redactText
        ? redactSensitiveText(finding.suggestedAction)
        : finding.suggestedAction
    })),
    artifacts: session.artifacts.map((artifact) =>
      sanitizeArtifactForCloudSync(artifact, normalizedOptions)
    )
  };
}

export function runDoctor(cwd: string): DoctorCheck[] {
  const gitVersion = tryRun('git', ['--version'], cwd);
  const qwenVersion =
    tryRun('qwen', ['--version'], cwd) ??
    tryRun('qwen-code', ['--version'], cwd) ??
    tryRun('qwen-code-cli', ['--version'], cwd);

  return [
    {
      id: 'git',
      label: 'Git',
      status: gitVersion ? 'ok' : 'fail',
      detail: gitVersion ?? 'Git is not available in PATH.'
    },
    {
      id: 'qwen',
      label: 'Qwen Code',
      status: qwenVersion ? 'ok' : 'warn',
      detail: qwenVersion ?? 'Qwen Code was not detected. Review runs will stay in scaffold mode.'
    },
    {
      id: 'api',
      label: 'API base URL',
      status: process.env.DIFFMINT_API_BASE_URL ? 'ok' : 'warn',
      detail:
        process.env.DIFFMINT_API_BASE_URL ??
        'Set DIFFMINT_API_BASE_URL to connect CLI sync and device auth to the control plane.'
    }
  ];
}
