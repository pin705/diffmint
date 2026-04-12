import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: {
    index: false
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl space-y-8'>
        <h1 className='text-foreground text-3xl font-bold'>Privacy Policy</h1>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Introduction</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Diffmint is designed for local-first code review. This policy explains what data stays
            on your machine, what data can sync to the control plane, and which third-party services
            support authentication and billing.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Local-first review data</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Diffmint does not require full repository upload by default. The CLI and VS Code
            extension analyze local diffs and files on your machine first. Workspaces can choose to
            sync selected artifacts such as summaries, severities, trace IDs, provider metadata, and
            markdown reports to the control plane.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Authentication by Clerk</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Our application uses{' '}
            <a
              href='https://clerk.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary font-medium hover:underline'
            >
              Clerk
            </a>{' '}
            to handle user authentication securely. All authentication processes, including sign-up,
            sign-in, and password management, are managed by Clerk. For detailed information about
            how Clerk processes and protects your data, please review their{' '}
            <a
              href='https://clerk.com/legal/privacy'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary font-medium hover:underline'
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Billing by Polar</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Diffmint uses Polar for checkout, subscriptions, invoices, and customer portal sessions.
            Workspace billing metadata such as plan selection, seat usage, and subscription state
            may be synchronized with Polar to manage paid access. Do not store raw payment
            information in Diffmint itself.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Retention and redaction</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Workspaces can control whether cloud sync is enabled and whether redaction is required
            before sync. We recommend redacting secrets, tokens, and customer data before storing
            synced review artifacts. Retention policies should be configured per workspace.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Contact Us</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            If your team needs custom retention, data processing details, or billing/privacy
            controls, document them in your workspace security runbook and internal support
            channels.
          </p>
        </section>

        <div className='border-border border-t pt-4'>
          <p className='text-muted-foreground text-sm'>Last updated: April 2026</p>
        </div>
      </div>
    </div>
  );
}
