import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import type { BillingWorkspaceSummary } from '@/lib/billing/adapter';

interface BillingPageContentProps {
  summary: BillingWorkspaceSummary;
}

export function BillingPageContent({ summary }: BillingPageContentProps) {
  return (
    <div className='space-y-6'>
      <Alert>
        <Icons.info className='h-4 w-4' />
        <AlertDescription>
          Polar is the billing provider for workspace plans, checkouts, invoices, and customer
          portal sessions. Clerk continues to handle identity and organizations.
        </AlertDescription>
      </Alert>

      {!summary.configured ? (
        <Alert variant='destructive'>
          <Icons.warning className='h-4 w-4' />
          <AlertDescription>
            Polar is not fully configured yet. Add the required `POLAR_*` environment variables to
            enable live checkout and portal links.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <Card>
          <CardHeader>
            <CardDescription>Active plan</CardDescription>
            <CardTitle className='flex items-center gap-2 text-3xl'>
              {summary.planLabel}
              <Badge variant='outline'>{summary.subscriptionStatus}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Seats</CardDescription>
            <CardTitle className='text-3xl'>
              {summary.seatsUsed} / {summary.seatLimit}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Included credits</CardDescription>
            <CardTitle className='text-3xl'>{summary.creditsIncluded.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Spend cap</CardDescription>
            <CardTitle className='text-3xl'>${summary.spendCapUsd}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.1fr_0.9fr]'>
        <Card>
          <CardHeader>
            <CardTitle>Polar checkout flows</CardTitle>
            <CardDescription>
              Use env-backed product mappings so the billing page stays aligned with Polar products.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {summary.checkoutTargets.map((target) => (
              <div key={target.planKey} className='rounded-2xl border px-4 py-4'>
                <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <p className='font-medium'>{target.label}</p>
                      {target.recommended ? <Badge>Recommended</Badge> : null}
                    </div>
                    <p className='text-muted-foreground text-sm'>{target.description}</p>
                    <p className='text-muted-foreground text-xs'>
                      Polar product ID: {target.productId ?? 'Unconfigured'}
                    </p>
                  </div>
                  {target.checkoutUrl ? (
                    <Button asChild>
                      <Link href={target.checkoutUrl}>Open checkout</Link>
                    </Button>
                  ) : (
                    <Button disabled>Configure product ID</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer portal</CardTitle>
            <CardDescription>
              Open the Polar customer portal for invoices, payment methods, and subscription
              management.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-2xl border px-4 py-3 text-sm'>
              <div className='flex items-center justify-between gap-3'>
                <span className='text-muted-foreground'>Environment</span>
                <Badge variant='outline'>{summary.environment}</Badge>
              </div>
              <div className='mt-2 flex items-center justify-between gap-3'>
                <span className='text-muted-foreground'>Polar customer</span>
                <span>{summary.polarCustomerId ?? 'Unlinked'}</span>
              </div>
              <div className='mt-2 flex items-center justify-between gap-3'>
                <span className='text-muted-foreground'>Remaining credits</span>
                <span>{summary.creditsRemaining.toLocaleString()}</span>
              </div>
            </div>

            {summary.portalUrl ? (
              <Button asChild className='w-full'>
                <Link href={summary.portalUrl}>Open Polar customer portal</Link>
              </Button>
            ) : (
              <Button disabled className='w-full'>
                Customer portal unavailable
              </Button>
            )}

            <div className='space-y-2'>
              {summary.notes.map((note) => (
                <div
                  key={note}
                  className='text-muted-foreground rounded-2xl border px-4 py-3 text-sm'
                >
                  {note}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
