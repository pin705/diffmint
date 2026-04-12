import { z } from 'zod';

export const findingSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export const reviewSourceSchema = z.enum([
  'local_diff',
  'selected_files',
  'branch_compare',
  'pull_request',
  'pasted_diff',
  'commit_range'
]);
export const commandSourceSchema = z.enum(['cli', 'vscode', 'web']);
export const reviewStatusSchema = z.enum(['queued', 'running', 'completed', 'failed']);
export const artifactKindSchema = z.enum([
  'markdown',
  'json',
  'terminal',
  'raw-provider-output',
  'diagnostic'
]);
export const usageEventSchema = z.enum([
  'review.started',
  'review.completed',
  'review.failed',
  'auth.login',
  'sync.uploaded'
]);

export const reviewSessionSchema = z.object({
  id: z.string().optional().default(''),
  traceId: z.string().min(1),
  workspaceId: z.string().optional(),
  requestId: z.string().min(1),
  source: reviewSourceSchema,
  commandSource: commandSourceSchema,
  provider: z.string().optional(),
  model: z.string().optional(),
  policyVersionId: z.string().optional(),
  status: reviewStatusSchema,
  findings: z
    .array(
      z.object({
        id: z.string(),
        severity: findingSeveritySchema,
        title: z.string(),
        summary: z.string(),
        filePath: z.string().optional(),
        line: z.number().optional(),
        ruleId: z.string().optional(),
        suggestedAction: z.string().optional()
      })
    )
    .default([]),
  summary: z.string().min(1),
  severityCounts: z.object({
    low: z.number().int().nonnegative(),
    medium: z.number().int().nonnegative(),
    high: z.number().int().nonnegative(),
    critical: z.number().int().nonnegative()
  }),
  durationMs: z.number().int().nonnegative(),
  startedAt: z.string().min(1),
  completedAt: z.string().optional(),
  artifacts: z
    .array(
      z.object({
        id: z.string(),
        kind: artifactKindSchema,
        label: z.string(),
        mimeType: z.string(),
        content: z.string().optional(),
        storageKey: z.string().optional()
      })
    )
    .default([])
});

export const usageEventInputSchema = z.object({
  workspaceId: z.string().optional(),
  actorId: z.string().optional(),
  source: commandSourceSchema,
  event: usageEventSchema,
  creditsDelta: z.number().optional(),
  metadata: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional()
});

export const deviceAuthStartSchema = z.object({
  workspaceId: z.string().optional()
});

export const deviceAuthActionSchema = z.object({
  deviceCode: z.string().min(1)
});
