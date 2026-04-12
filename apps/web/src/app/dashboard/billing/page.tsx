import PageContainer from '@/components/layout/page-container';
import { auth } from '@clerk/nextjs/server';
import { billingInfoContent } from '@/config/infoconfig';
import { BillingPageContent } from '@/features/control-plane/components/billing-page';
import { getBillingWorkspaceSnapshot } from '@/features/control-plane/server/service';
import { PolarBillingAdapter } from '@/lib/billing/polar-billing-adapter';

export default async function BillingPage() {
  const { orgId } = await auth();
  const adapter = new PolarBillingAdapter();
  const billingSnapshot = getBillingWorkspaceSnapshot({
    workspaceId: orgId ?? undefined
  });
  const summary = orgId
    ? await adapter.getWorkspaceSummary({
        workspaceId: orgId,
        customerExternalId: orgId,
        workspaceName: billingSnapshot.workspaceName,
        planKey: billingSnapshot.planKey,
        subscriptionStatus: billingSnapshot.subscriptionStatus,
        seatsUsed: billingSnapshot.seatsUsed,
        seatLimit: billingSnapshot.seatLimit,
        creditsIncluded: billingSnapshot.creditsIncluded,
        creditsRemaining: billingSnapshot.creditsRemaining,
        spendCapUsd: billingSnapshot.spendCapUsd,
        polarCustomerId: billingSnapshot.customerId
      })
    : null;

  return (
    <PageContainer
      access={!!orgId}
      accessFallback={
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='space-y-2 text-center'>
            <h2 className='text-2xl font-semibold'>No Organization Selected</h2>
            <p className='text-muted-foreground'>
              Please select or create an organization to view billing information.
            </p>
          </div>
        </div>
      }
      infoContent={billingInfoContent}
      pageTitle='Billing & Quota'
      pageDescription='Manage Polar plans, workspace seats, included credits, and customer portal access.'
    >
      {summary ? <BillingPageContent summary={summary} /> : null}
    </PageContainer>
  );
}
