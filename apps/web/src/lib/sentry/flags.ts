type SentryEnv = Record<string, string | undefined> & {
  NEXT_PUBLIC_SENTRY_DISABLED?: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_SENTRY_ORG?: string;
  NEXT_PUBLIC_SENTRY_PROJECT?: string;
  SENTRY_AUTH_TOKEN?: string;
};

function hasValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isExplicitlyDisabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true';
}

export function isSentryRuntimeEnabled(env: SentryEnv = process.env): boolean {
  if (isExplicitlyDisabled(env.NEXT_PUBLIC_SENTRY_DISABLED)) {
    return false;
  }

  return hasValue(env.NEXT_PUBLIC_SENTRY_DSN);
}

export function isSentryBuildEnabled(env: SentryEnv = process.env): boolean {
  if (!isSentryRuntimeEnabled(env)) {
    return false;
  }

  return (
    hasValue(env.NEXT_PUBLIC_SENTRY_ORG) &&
    hasValue(env.NEXT_PUBLIC_SENTRY_PROJECT) &&
    hasValue(env.SENTRY_AUTH_TOKEN)
  );
}
