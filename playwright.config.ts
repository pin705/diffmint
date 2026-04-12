import { defineConfig } from '@playwright/test';

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  reporter: 'list',
  workers: 1,
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  webServer: {
    command: `pnpm --dir apps/web dev --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_PUBLIC_SENTRY_DISABLED: 'true'
    }
  }
});
