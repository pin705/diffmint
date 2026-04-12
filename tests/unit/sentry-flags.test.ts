import { describe, expect, it } from 'vitest';
import {
  isSentryBuildEnabled,
  isSentryRuntimeEnabled
} from '../../apps/web/src/lib/sentry/flags.ts';

describe('sentry flags', () => {
  it('keeps runtime monitoring off when the DSN is missing', () => {
    expect(
      isSentryRuntimeEnabled({
        NEXT_PUBLIC_SENTRY_DISABLED: 'false'
      })
    ).toBe(false);
  });

  it('enables runtime monitoring when the DSN is present and not disabled', () => {
    expect(
      isSentryRuntimeEnabled({
        NEXT_PUBLIC_SENTRY_DSN: 'https://example.ingest.sentry.io/1',
        NEXT_PUBLIC_SENTRY_DISABLED: 'false'
      })
    ).toBe(true);
  });

  it('requires full build credentials before enabling the build plugin', () => {
    expect(
      isSentryBuildEnabled({
        NEXT_PUBLIC_SENTRY_DSN: 'https://example.ingest.sentry.io/1',
        NEXT_PUBLIC_SENTRY_ORG: 'diffmint',
        NEXT_PUBLIC_SENTRY_PROJECT: 'web'
      })
    ).toBe(false);

    expect(
      isSentryBuildEnabled({
        NEXT_PUBLIC_SENTRY_DSN: 'https://example.ingest.sentry.io/1',
        NEXT_PUBLIC_SENTRY_ORG: 'diffmint',
        NEXT_PUBLIC_SENTRY_PROJECT: 'web',
        SENTRY_AUTH_TOKEN: 'sntrys_test'
      })
    ).toBe(true);
  });

  it('respects the explicit disable flag for runtime and build paths', () => {
    const env = {
      NEXT_PUBLIC_SENTRY_DISABLED: 'true',
      NEXT_PUBLIC_SENTRY_DSN: 'https://example.ingest.sentry.io/1',
      NEXT_PUBLIC_SENTRY_ORG: 'diffmint',
      NEXT_PUBLIC_SENTRY_PROJECT: 'web',
      SENTRY_AUTH_TOKEN: 'sntrys_test'
    };

    expect(isSentryRuntimeEnabled(env)).toBe(false);
    expect(isSentryBuildEnabled(env)).toBe(false);
  });
});
