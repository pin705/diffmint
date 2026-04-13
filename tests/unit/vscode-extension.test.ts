import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildWebUrl,
  escapeHtml,
  getDiffmintPaths,
  normalizeWebBaseUrl,
  readDiffmintConfig,
  readDiffmintHistory,
  renderResultHtml,
  tryParseJson
} from '../../apps/vscode/src/diffmint.ts';

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'diffmint-vscode-test-'));
  tempDirs.push(dir);
  return dir;
}

describe('vscode extension helpers', () => {
  afterEach(async () => {
    while (tempDirs.length > 0) {
      await import('node:fs/promises').then(({ rm }) =>
        rm(tempDirs.pop()!, { recursive: true, force: true })
      );
    }
  });

  it('normalizes web base URLs and builds dashboard links', () => {
    expect(normalizeWebBaseUrl('https://diffmint.io/')).toBe('https://diffmint.io');
    expect(buildWebUrl('https://diffmint.io/', '/dashboard/policies')).toBe(
      'https://diffmint.io/dashboard/policies'
    );
  });

  it('reads local config and recent history entries from the Diffmint home directory', () => {
    const homeDir = makeTempDir();
    const diffmintHome = path.join(homeDir, '.diffmint');
    mkdirSync(diffmintHome, { recursive: true });

    const paths = getDiffmintPaths({
      HOME: homeDir
    } as NodeJS.ProcessEnv);

    writeFileSync(
      paths.configPath,
      JSON.stringify(
        {
          workspace: {
            id: 'ws_diffmint_core',
            name: 'Diffmint Core',
            slug: 'diffmint-core'
          },
          provider: 'qwen',
          policyVersionId: 'policy-v1'
        },
        null,
        2
      ),
      'utf8'
    );

    writeFileSync(
      paths.historyPath,
      [
        JSON.stringify({ traceId: 'trace-old', summary: 'Older review' }),
        JSON.stringify({ traceId: 'trace-new', summary: 'Newest review' })
      ].join('\n'),
      'utf8'
    );

    const config = readDiffmintConfig(paths.configPath);
    const history = readDiffmintHistory(paths.historyPath, 5);

    expect(config?.workspace?.slug).toBe('diffmint-core');
    expect(config?.provider).toBe('qwen');
    expect(history[0]?.traceId).toBe('trace-new');
    expect(history[1]?.traceId).toBe('trace-old');
  });

  it('escapes html before rendering result panels', () => {
    expect(escapeHtml('<diffmint>&')).toBe('&lt;diffmint&gt;&amp;');

    const html = renderResultHtml('Title <unsafe>', 'Body & details');
    expect(html).toContain('&lt;unsafe&gt;');
    expect(html).toContain('Body &amp; details');
  });

  it('parses valid json payloads and ignores invalid ones', () => {
    expect(tryParseJson<{ ok: boolean }>('{"ok":true}')).toEqual({ ok: true });
    expect(tryParseJson('{not-json}')).toBeNull();
  });
});
