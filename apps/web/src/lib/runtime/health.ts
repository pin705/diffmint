import { sql } from 'drizzle-orm';
import { getAllDocs } from '@diffmint/docs-content';
import { getDb } from '@/db/client';
import { isClerkEnabled } from '@/lib/clerk/flags';
import { getPersistenceRequirementMessage, isPersistenceRequired } from '@/lib/runtime/persistence';

export type RuntimeHealthStatus = 'ok' | 'warn' | 'fail';

export interface RuntimeHealthCheck {
  name: string;
  status: RuntimeHealthStatus;
  detail: string;
}

export interface RuntimeHealthReport {
  service: 'diffmint-web';
  status: RuntimeHealthStatus;
  checkedAt: string;
  uptimeSeconds: number;
  checks: RuntimeHealthCheck[];
}

interface RuntimeHealthOptions {
  env?: NodeJS.ProcessEnv;
  docsCountLoader?: () => number;
  databaseChecker?: (env: NodeJS.ProcessEnv) => Promise<RuntimeHealthCheck>;
}

function summarizeChecks(checks: RuntimeHealthCheck[]): RuntimeHealthStatus {
  if (checks.some((check) => check.status === 'fail')) {
    return 'fail';
  }

  if (checks.some((check) => check.status === 'warn')) {
    return 'warn';
  }

  return 'ok';
}

function buildReport(checks: RuntimeHealthCheck[]): RuntimeHealthReport {
  return {
    service: 'diffmint-web',
    status: summarizeChecks(checks),
    checkedAt: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    checks
  };
}

function createDocsCheck(docsCountLoader: () => number): RuntimeHealthCheck {
  try {
    const count = docsCountLoader();

    if (count <= 0) {
      return {
        name: 'docs',
        status: 'fail',
        detail: 'No docs pages were loaded from the docs content package.'
      };
    }

    return {
      name: 'docs',
      status: 'ok',
      detail: `Loaded ${count} published docs page(s).`
    };
  } catch (error) {
    return {
      name: 'docs',
      status: 'fail',
      detail: error instanceof Error ? error.message : 'Unable to load docs content.'
    };
  }
}

async function createDatabaseCheck(env: NodeJS.ProcessEnv): Promise<RuntimeHealthCheck> {
  if (!env.DATABASE_URL || env.DIFFMINT_FORCE_MEMORY_STATE === 'true') {
    return {
      name: 'database',
      status: isPersistenceRequired(env) ? 'fail' : 'warn',
      detail: isPersistenceRequired(env)
        ? getPersistenceRequirementMessage()
        : 'DATABASE_URL is not active. Control-plane data will stay ephemeral until persistence is configured.'
    };
  }

  const db = getDb();

  if (!db) {
    return {
      name: 'database',
      status: 'fail',
      detail: 'DATABASE_URL is set but the database client could not be created.'
    };
  }

  try {
    await db.execute(sql`select 1`);

    return {
      name: 'database',
      status: 'ok',
      detail: 'Database connection is ready.'
    };
  } catch (error) {
    return {
      name: 'database',
      status: 'fail',
      detail: error instanceof Error ? error.message : 'Database readiness check failed.'
    };
  }
}

function createAuthCheck(env: NodeJS.ProcessEnv): RuntimeHealthCheck {
  if (isClerkEnabled(env)) {
    return {
      name: 'auth',
      status: 'ok',
      detail: 'Clerk auth is configured for protected dashboard flows.'
    };
  }

  return {
    name: 'auth',
    status: 'warn',
    detail:
      'Clerk auth is disabled or incomplete. Public routes still work, but protected flows require full Clerk config.'
  };
}

function createBillingCheck(env: NodeJS.ProcessEnv): RuntimeHealthCheck {
  if (env.POLAR_ACCESS_TOKEN && env.POLAR_WEBHOOK_SECRET) {
    return {
      name: 'billing',
      status: 'ok',
      detail: 'Polar billing credentials and webhook secret are configured.'
    };
  }

  return {
    name: 'billing',
    status: 'ok',
    detail: 'Free-plan billing mode is active. Polar is optional until paid billing is enabled.'
  };
}

export function getLiveHealthReport(): RuntimeHealthReport {
  return buildReport([
    {
      name: 'process',
      status: 'ok',
      detail: `Process ${process.pid} is responding.`
    }
  ]);
}

export async function getReadinessHealthReport(
  options: RuntimeHealthOptions = {}
): Promise<RuntimeHealthReport> {
  const env = options.env ?? process.env;
  const checks = await Promise.all([
    Promise.resolve<RuntimeHealthCheck>({
      name: 'app',
      status: 'ok',
      detail: 'Next.js runtime is ready to serve requests.'
    }),
    Promise.resolve(createDocsCheck(options.docsCountLoader ?? (() => getAllDocs().length))),
    Promise.resolve(createAuthCheck(env)),
    Promise.resolve(createBillingCheck(env)),
    (options.databaseChecker ?? createDatabaseCheck)(env)
  ]);

  return buildReport(checks);
}
