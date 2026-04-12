import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getSentryWebpackAliases,
  getSentryWebpackIgnoreWarnings
} from '../../apps/web/src/lib/sentry/webpack.ts';

describe('sentry webpack helpers', () => {
  it('aliases Sentry to a noop runtime when monitoring is disabled', () => {
    const aliases = getSentryWebpackAliases(path.resolve('apps/web'), {
      NEXT_PUBLIC_SENTRY_DISABLED: 'false'
    } as NodeJS.ProcessEnv);

    expect(aliases['@sentry/nextjs']).toContain(path.join('apps', 'web', 'src', 'lib', 'sentry'));
    expect(aliases['@sentry/nextjs']).toContain('noop.ts');
  });

  it('keeps the real Sentry package when runtime monitoring is enabled', () => {
    const aliases = getSentryWebpackAliases(path.resolve('apps/web'), {
      NEXT_PUBLIC_SENTRY_DSN: 'https://example.ingest.sentry.io/1',
      NEXT_PUBLIC_SENTRY_DISABLED: 'false'
    } as NodeJS.ProcessEnv);

    expect(aliases).toEqual({});
  });

  it('returns narrow ignore rules for known upstream Sentry warnings', () => {
    const rules = getSentryWebpackIgnoreWarnings();

    expect(rules).toHaveLength(2);
    expect(rules[0]?.module).toBeInstanceOf(RegExp);
    expect(rules[0]?.message).toBeInstanceOf(RegExp);
    expect(rules[1]?.module).toBeInstanceOf(RegExp);
    expect(rules[1]?.message).toBeInstanceOf(RegExp);
  });
});
