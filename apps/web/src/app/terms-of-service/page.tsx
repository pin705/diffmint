import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  robots: {
    index: false
  }
};

export default function TermsOfServicePage() {
  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl space-y-8'>
        <div className='text-center'>
          <h1 className='text-foreground text-3xl font-bold'>Terms of Service</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Introduction</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            These Terms govern access to Devflow, including the web control plane, CLI, VS Code
            extension, and synced review services. By using Devflow, you agree to use the service in
            accordance with your organization policies and applicable law.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Acceptable use</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            You are responsible for ensuring that code, policies, provider credentials, and review
            outputs processed through Devflow comply with your internal security and privacy rules.
            Do not use the service to process content you are not authorized to analyze.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Billing and paid access</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Paid plans, invoices, and subscription changes are managed through Polar. Workspace
            access to paid features may depend on an active subscription, seat availability, and
            workspace-level spend controls.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>No Warranty</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            This application is provided &ldquo;as is&rdquo; without any warranties of any kind,
            either express or implied. We expressly disclaim all warranties, including but not
            limited to implied warranties of merchantability, fitness for a particular purpose, and
            non-infringement. We do not warrant that the application will be uninterrupted, timely,
            secure, or error-free.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Data and synced artifacts</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Devflow may store synced review metadata and selected artifacts such as summaries,
            findings, provider/model information, and audit events. Full repository upload is not
            required by default, but you remain responsible for what your workspace chooses to sync.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Changes to These Terms</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            We reserve the right to modify or replace these Terms of Service at any time at our sole
            discretion. It is your responsibility to review these terms periodically for changes.
            Your continued use of the application following the posting of any changes constitutes
            acceptance of those changes.
          </p>
        </section>

        <section className='border-border border-t pt-4'>
          <p className='text-muted-foreground text-center text-sm'>
            For workspace-specific legal, billing, or security requirements, maintain internal
            guidance alongside the Devflow docs center.
          </p>
        </section>
      </div>
    </div>
  );
}
