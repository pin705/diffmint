import { expect, test } from '@playwright/test';

test('landing page leads into the quickstart docs flow', async ({ page }) => {
  const landingResponse = await page.goto('/');
  const quickstartLink = page.getByRole('link', { name: /Start the Quickstart/i });

  expect(landingResponse).not.toBeNull();
  expect(landingResponse?.headers()['x-frame-options']).toBe('DENY');
  expect(landingResponse?.headers()['x-content-type-options']).toBe('nosniff');
  expect(landingResponse?.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(landingResponse?.headers()['cross-origin-opener-policy']).toBe('same-origin-allow-popups');

  await expect(
    page.getByRole('heading', {
      name: /Catch risky diffs before the PR, then keep the audit trail attached/i
    })
  ).toBeVisible();
  await expect(page.getByText('dm review --base origin/main').first()).toBeVisible();
  await expect(quickstartLink).toHaveAttribute('href', '/docs/getting-started/5-minute-quickstart');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /local-first, policy-driven code review platform/i
  );

  await page.goto('/docs/getting-started/5-minute-quickstart');
  await expect(page).toHaveURL(/\/docs\/getting-started\/5-minute-quickstart$/);
  await expect(page.getByRole('heading', { name: '5-Minute Quickstart' }).first()).toBeVisible();
});

test('install page exposes the docker development workflow', async ({ page }) => {
  await page.goto('/install');

  await expect(page.getByRole('heading', { name: /Set up Diffmint end to end/i })).toBeVisible();
  await expect(page.getByText('Run `pnpm docker:dev`')).toBeVisible();
  await expect(page.getByRole('link', { name: /Open Docker Dev Guide/i })).toBeVisible();
});

test('billing with polar doc is published for admins', async ({ page }) => {
  await page.goto('/docs/admin/billing-with-polar');

  await expect(page.getByRole('heading', { name: 'Billing with Polar' }).first()).toBeVisible();
  await expect(page.getByText('POLAR_ACCESS_TOKEN', { exact: true })).toBeVisible();
  await expect(page.getByText('/api/polar/checkout', { exact: true })).toBeVisible();
});

test('client api exposes device start, protects bootstrap, and keeps releases public', async ({
  request,
  baseURL
}) => {
  if (!baseURL) {
    throw new Error('Expected Playwright baseURL to be configured.');
  }

  const deviceStartResponse = await request.post(
    new URL('/api/client/device/start', baseURL).toString(),
    {
      data: {}
    }
  );
  const deviceStartPayload = (await deviceStartResponse.json()) as {
    deviceCode: string;
    userCode: string;
    status: string;
    verificationUriComplete: string;
  };
  const bootstrapResponse = await request.get(new URL('/api/client/bootstrap', baseURL).toString());
  const bootstrapPayload = (await bootstrapResponse.json()) as { error: string };
  const releasesResponse = await request.get(new URL('/api/client/releases', baseURL).toString());
  const releasesPayload = (await releasesResponse.json()) as {
    items: Array<{ channel: string }>;
  };

  expect(deviceStartResponse.ok()).toBeTruthy();
  expect(deviceStartResponse.headers()['cache-control']).toBe('private, no-store, max-age=0');
  expect(deviceStartResponse.headers()['x-diffmint-request-id']).toMatch(/^req_/);
  expect(deviceStartPayload.deviceCode).toBeTruthy();
  expect(deviceStartPayload.userCode).toBeTruthy();
  expect(deviceStartPayload.status).toBe('pending');
  expect(deviceStartPayload.verificationUriComplete).toContain('/auth/device?device_code=');

  expect(bootstrapResponse.status()).toBe(401);
  expect(bootstrapResponse.headers()['cache-control']).toBe('private, no-store, max-age=0');
  expect(bootstrapPayload.error).toContain('dm auth login');

  expect(releasesResponse.ok()).toBeTruthy();
  expect(releasesResponse.headers()['cache-control']).toBe(
    'public, max-age=300, stale-while-revalidate=300'
  );
  expect(releasesResponse.headers()['x-frame-options']).toBe('DENY');
  expect(releasesPayload.items.some((item) => item.channel === 'stable')).toBeTruthy();
});

test('health endpoints expose live and readiness probes', async ({ request, baseURL }) => {
  if (!baseURL) {
    throw new Error('Expected Playwright baseURL to be configured.');
  }

  const [liveResponse, readyResponse] = await Promise.all([
    request.get(new URL('/api/health/live', baseURL).toString()),
    request.get(new URL('/api/health/ready', baseURL).toString())
  ]);

  const livePayload = (await liveResponse.json()) as {
    service: string;
    status: string;
  };
  const readyPayload = (await readyResponse.json()) as {
    service: string;
    status: string;
    checks: Array<{ name: string }>;
  };

  expect(liveResponse.ok()).toBeTruthy();
  expect(livePayload.service).toBe('diffmint-web');
  expect(livePayload.status).toBe('ok');

  expect(readyResponse.ok()).toBeTruthy();
  expect(readyPayload.service).toBe('diffmint-web');
  expect(['ok', 'warn']).toContain(readyPayload.status);
  expect(readyPayload.checks.some((check) => check.name === 'database')).toBeTruthy();
});

test('public seo routes expose robots, sitemap, manifest, and social images', async ({
  request,
  baseURL
}) => {
  if (!baseURL) {
    throw new Error('Expected Playwright baseURL to be configured.');
  }

  const [robotsResponse, sitemapResponse, manifestResponse, ogImageResponse, twitterImageResponse] =
    await Promise.all([
      request.get(new URL('/robots.txt', baseURL).toString()),
      request.get(new URL('/sitemap.xml', baseURL).toString()),
      request.get(new URL('/manifest.webmanifest', baseURL).toString()),
      request.get(new URL('/opengraph-image', baseURL).toString()),
      request.get(new URL('/twitter-image', baseURL).toString())
    ]);
  const robotsText = await robotsResponse.text();
  const sitemapText = await sitemapResponse.text();
  const manifestText = await manifestResponse.text();

  expect(robotsResponse.ok()).toBeTruthy();
  expect(robotsText).toContain('Sitemap:');
  expect(robotsText).toContain('Disallow: /dashboard/');

  expect(sitemapResponse.ok()).toBeTruthy();
  expect(sitemapText).toContain('/docs/getting-started/5-minute-quickstart');

  expect(manifestResponse.ok()).toBeTruthy();
  expect(manifestResponse.headers()['content-type']).toContain('application/manifest+json');
  expect(manifestText).toContain('"name":"Diffmint"');

  expect(ogImageResponse.ok()).toBeTruthy();
  expect(ogImageResponse.headers()['content-type']).toContain('image/png');

  expect(twitterImageResponse.ok()).toBeTruthy();
  expect(twitterImageResponse.headers()['content-type']).toContain('image/png');
});
