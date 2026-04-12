import { expect, test } from '@playwright/test';

test('landing page leads into the quickstart docs flow', async ({ page }) => {
  await page.goto('/');
  const quickstartLink = page.getByRole('link', { name: /Start the Quickstart/i });

  await expect(
    page.getByRole('heading', {
      name: /Policy-driven code review where the real work stays in the terminal and editor/i
    })
  ).toBeVisible();
  await expect(quickstartLink).toHaveAttribute('href', '/docs/getting-started/5-minute-quickstart');

  await page.goto('/docs/getting-started/5-minute-quickstart');
  await expect(page).toHaveURL(/\/docs\/getting-started\/5-minute-quickstart$/);
  await expect(page.getByRole('heading', { name: '5-Minute Quickstart' }).first()).toBeVisible();
});

test('install page exposes the docker development workflow', async ({ page }) => {
  await page.goto('/install');

  await expect(page.getByRole('heading', { name: /Set up Devflow end to end/i })).toBeVisible();
  await expect(page.getByText('Run `pnpm docker:dev`')).toBeVisible();
  await expect(page.getByRole('link', { name: /Open Docker Dev Guide/i })).toBeVisible();
});

test('billing with polar doc is published for admins', async ({ page }) => {
  await page.goto('/docs/admin/billing-with-polar');

  await expect(page.getByRole('heading', { name: 'Billing with Polar' }).first()).toBeVisible();
  await expect(page.getByText(/POLAR_ACCESS_TOKEN/)).toBeVisible();
  await expect(page.getByText(/\/api\/polar\/checkout/)).toBeVisible();
});

test('bootstrap api returns workspace bootstrap data for local clients', async ({
  request,
  baseURL
}) => {
  if (!baseURL) {
    throw new Error('Expected Playwright baseURL to be configured.');
  }

  const response = await request.get(new URL('/api/client/bootstrap', baseURL).toString());
  const payload = (await response.json()) as {
    workspace: { name: string; slug: string };
    provider: { id: string };
    releaseChannels: string[];
  };

  expect(response.ok()).toBeTruthy();
  expect(payload.workspace.name).toBe('Devflow Core');
  expect(payload.workspace.slug).toBe('devflow-core');
  expect(payload.provider.id).toBeTruthy();
  expect(payload.releaseChannels).toContain('stable');
});
