export function isPersistenceRequired(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.DIFFMINT_REQUIRE_PERSISTENCE === 'true';
}

export function getPersistenceRequirementMessage(): string {
  return 'Persistent control-plane storage is required but DATABASE_URL is not active.';
}

export function getPersistenceUnavailableMessage(reason?: string): string {
  if (!reason) {
    return 'Persistent control-plane storage is required but unavailable.';
  }

  return `Persistent control-plane storage is required but unavailable: ${reason}`;
}
