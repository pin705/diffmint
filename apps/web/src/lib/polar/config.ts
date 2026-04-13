import { z } from 'zod';
import type { BillingPlanKey } from '@/lib/billing/adapter';

const polarServerSchema = z.enum(['sandbox', 'production']);

export interface PolarConfig {
  accessToken?: string;
  webhookSecret?: string;
  appUrl: string;
  server: 'sandbox' | 'production';
  productIds: Record<Exclude<BillingPlanKey, 'free'>, string | undefined>;
}

export interface BuildPolarCheckoutUrlOptions {
  appUrl?: string;
  workspaceId: string;
  customerExternalId?: string;
  customerEmail?: string;
  customerName?: string;
  planKey: Exclude<BillingPlanKey, 'free'>;
}

export function getPolarConfig(): PolarConfig {
  const server =
    polarServerSchema.safeParse(process.env.POLAR_SERVER).data ??
    polarServerSchema.parse('sandbox');
  const appUrl =
    process.env.DIFFMINT_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'https://diffmint.deplio.app';

  return {
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
    appUrl,
    server,
    productIds: {
      pro: process.env.POLAR_PRODUCT_ID_PRO,
      team: process.env.POLAR_PRODUCT_ID_TEAM,
      enterprise: process.env.POLAR_PRODUCT_ID_ENTERPRISE
    }
  };
}

export function isPolarConfigured(config: PolarConfig): boolean {
  return Boolean(config.accessToken);
}

export function buildPolarCheckoutUrl({
  appUrl,
  workspaceId,
  customerExternalId,
  customerEmail,
  customerName,
  planKey
}: BuildPolarCheckoutUrlOptions): string | undefined {
  const config = getPolarConfig();
  const productId = config.productIds[planKey];

  if (!productId) {
    return undefined;
  }

  const checkoutUrl = new URL('/api/polar/checkout', appUrl ?? config.appUrl);
  checkoutUrl.searchParams.set('products', productId);
  checkoutUrl.searchParams.set('customerExternalId', customerExternalId ?? workspaceId);

  if (customerEmail) {
    checkoutUrl.searchParams.set('customerEmail', customerEmail);
  }

  if (customerName) {
    checkoutUrl.searchParams.set('customerName', customerName);
  }

  checkoutUrl.searchParams.set(
    'metadata',
    JSON.stringify({
      workspaceId,
      planKey
    })
  );

  return checkoutUrl.toString();
}

export function buildPolarPortalUrl(customerId?: string, appUrl?: string): string | undefined {
  if (!customerId) {
    return undefined;
  }

  const config = getPolarConfig();
  const portalUrl = new URL('/api/polar/portal', appUrl ?? config.appUrl);
  portalUrl.searchParams.set('customerId', customerId);
  return portalUrl.toString();
}
