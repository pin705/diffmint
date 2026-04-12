import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildReviewRequest,
  createReviewSession,
  renderMarkdownSession,
  runDoctor
} from '../../packages/review-core/src/index.ts';

const tempDirs: string[] = [];

function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function runGit(cwd: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8'
  }).trim();
}

function createRepoWithChangedFile(filePath = 'src/auth/route.ts'): {
  repoDir: string;
  filePath: string;
} {
  const repoDir = makeTempDir('devflow-review-core-');
  const absoluteFilePath = path.join(repoDir, filePath);

  runGit(repoDir, ['init']);
  runGit(repoDir, ['config', 'user.email', 'devflow@example.com']);
  runGit(repoDir, ['config', 'user.name', 'Devflow Tests']);

  mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
  writeFileSync(absoluteFilePath, 'export const GET = () => new Response("ok");\n', 'utf8');
  runGit(repoDir, ['add', '.']);
  runGit(repoDir, ['commit', '-m', 'init']);

  writeFileSync(
    absoluteFilePath,
    'export const GET = () => new Response("ok");\nexport const dynamic = "force-dynamic";\n',
    'utf8'
  );

  return { repoDir, filePath };
}

describe('review core', () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      rmSync(tempDirs.pop()!, { recursive: true, force: true });
    }
  });

  it('builds a review request from a changed git file selection', () => {
    const { repoDir, filePath } = createRepoWithChangedFile();
    const request = buildReviewRequest({
      cwd: repoDir,
      source: 'selected_files',
      files: [filePath],
      mode: 'security',
      outputFormat: 'markdown'
    });

    expect(request.files).toEqual([filePath]);
    expect(request.mode).toBe('security');
    expect(request.diff).toContain(`b/${filePath}`);
    expect(request.metadata.gitBranch).toBeDefined();
  });

  it('creates governance-aware findings and markdown output', () => {
    const { repoDir, filePath } = createRepoWithChangedFile();
    const request = buildReviewRequest({
      cwd: repoDir,
      source: 'selected_files',
      files: [filePath],
      provider: 'qwen-enterprise'
    });
    const session = createReviewSession(request);
    const markdown = renderMarkdownSession(session);

    expect(session.provider).toBe('qwen-enterprise');
    expect(session.severityCounts.high).toBe(1);
    expect(session.severityCounts.medium).toBeGreaterThanOrEqual(1);
    expect(markdown).toContain('# Devflow Review');
    expect(markdown).toContain('Sensitive control-plane surface changed');
  });

  it('reports the configured API base URL in doctor output', () => {
    const originalBaseUrl = process.env.DEVFLOW_API_BASE_URL;
    process.env.DEVFLOW_API_BASE_URL = 'http://localhost:3000';

    try {
      const checks = runDoctor(process.cwd());
      const gitCheck = checks.find((check) => check.id === 'git');
      const apiCheck = checks.find((check) => check.id === 'api');

      expect(gitCheck?.status).toBe('ok');
      expect(apiCheck?.status).toBe('ok');
      expect(apiCheck?.detail).toBe('http://localhost:3000');
    } finally {
      if (originalBaseUrl === undefined) {
        delete process.env.DEVFLOW_API_BASE_URL;
      } else {
        process.env.DEVFLOW_API_BASE_URL = originalBaseUrl;
      }
    }
  });
});
