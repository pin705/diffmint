type ClerkEnv = Record<string, string | undefined> & {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  DIFFMINT_DISABLE_CLERK?: string;
  NEXT_PUBLIC_DIFFMINT_DISABLE_CLERK?: string;
};

function hasValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFlagEnabled(value: string | undefined): boolean {
  if (!hasValue(value)) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value!.trim().toLowerCase());
}

export function isClerkDisabled(env: ClerkEnv = process.env): boolean {
  return (
    isFlagEnabled(env.DIFFMINT_DISABLE_CLERK) ||
    isFlagEnabled(env.NEXT_PUBLIC_DIFFMINT_DISABLE_CLERK)
  );
}

export function isClerkClientEnabled(env: ClerkEnv = process.env): boolean {
  if (isClerkDisabled(env)) {
    return false;
  }

  return hasValue(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function isClerkEnabled(env: ClerkEnv = process.env): boolean {
  if (isClerkDisabled(env)) {
    return false;
  }

  return isClerkClientEnabled(env) && hasValue(env.CLERK_SECRET_KEY);
}
