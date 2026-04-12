import { describe, expect, it } from 'vitest';
import {
  isClerkDisabled,
  isClerkClientEnabled,
  isClerkEnabled
} from '../../apps/web/src/lib/clerk/flags.ts';

describe('clerk flags', () => {
  it('keeps Clerk disabled when keys are missing', () => {
    expect(isClerkClientEnabled({})).toBe(false);
    expect(isClerkEnabled({})).toBe(false);
  });

  it('requires both publishable and secret keys for full server auth', () => {
    expect(
      isClerkClientEnabled({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123'
      })
    ).toBe(true);

    expect(
      isClerkEnabled({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123'
      })
    ).toBe(false);

    expect(
      isClerkEnabled({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123'
      })
    ).toBe(true);
  });

  it('supports explicitly disabling Clerk for local production smoke tests', () => {
    expect(
      isClerkDisabled({
        DIFFMINT_DISABLE_CLERK: 'true'
      })
    ).toBe(true);

    expect(
      isClerkDisabled({
        NEXT_PUBLIC_DIFFMINT_DISABLE_CLERK: '1'
      })
    ).toBe(true);

    expect(
      isClerkClientEnabled({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        NEXT_PUBLIC_DIFFMINT_DISABLE_CLERK: 'true'
      })
    ).toBe(false);

    expect(
      isClerkEnabled({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        DIFFMINT_DISABLE_CLERK: 'true'
      })
    ).toBe(false);
  });
});
