import { BrandLink } from '@/components/brand-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { getServerAuthContext } from '@/lib/clerk/server-auth';
import { siteConfig } from '@/lib/site';
import Link from 'next/link';
import Script from 'next/script';

const productPillars = [
  {
    title: 'Local-first review',
    description:
      'Run reviews from `dm` before the pull request exists and keep source code on the machine by default.'
  },
  {
    title: 'Policy and governance',
    description:
      'Attach workspace policy versions, provider settings, and audit metadata to every synced review.'
  },
  {
    title: 'Control plane clarity',
    description:
      'Use the web app for workspace setup, billing, history, docs, and audit without dragging review out of the editor.'
  }
];

const controlPlaneBenefits = [
  'Versioned team rules',
  'Provider and BYOK controls',
  'Synced history and exports',
  'Polar billing and quotas'
];

const workflowSteps = [
  {
    title: 'Run the review locally',
    description:
      'Use `dm review`, `dm review --staged`, or `dm review --base origin/main` directly from the repository.'
  },
  {
    title: 'Apply workspace policy',
    description:
      'Diffmint injects the active workspace rules, provider settings, and policy version into the review context.'
  },
  {
    title: 'Sync only what matters',
    description:
      'Send redacted findings, metadata, and artifacts to the control plane for history, billing, and audit.'
  }
];

const productSurfaces = [
  {
    title: 'CLI for the real workflow',
    description:
      'The primary experience stays close to git with terse commands, JSON output, retries, and offline sync.',
    icon: Icons.code
  },
  {
    title: 'VS Code for one-click review',
    description:
      'The extension shells out to `dm`, shows grouped findings, and keeps navigation anchored to files and diffs.',
    icon: Icons.panelLeft
  },
  {
    title: 'Web for governance and operations',
    description:
      'Admins manage providers, quotas, policies, billing, audit, and release channels without turning the browser into the review surface.',
    icon: Icons.workspace
  }
];

const governanceChecks = [
  'Workspace-scoped provider defaults',
  'Versioned review policies',
  'Billing and quota visibility',
  'Review history and CSV exports'
];

const terminalFindings = [
  {
    file: 'src/auth/session.ts',
    severity: 'High',
    detail: 'Device session TTL never refreshes after a successful history sync.'
  },
  {
    file: 'src/lib/redaction.ts',
    severity: 'Medium',
    detail: 'Redaction is applied too late in the sync pipeline for raw provider output.'
  },
  {
    file: 'packages/docs-content',
    severity: 'Policy',
    detail: 'User-facing CLI text changed without a matching changelog entry.'
  }
];

export default async function HomePage() {
  const { userId } = await getServerAuthContext();
  const dashboardHref = userId ? '/dashboard/overview' : '/auth/sign-in';
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: siteConfig.name,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Windows, Linux',
      url: siteConfig.url,
      description: siteConfig.description,
      featureList: [
        'CLI-first code review',
        'VS Code review companion',
        'Workspace policy enforcement',
        'Audit logs and synced history',
        'Provider and billing controls'
      ]
    }
  ];

  return (
    <main className='relative min-h-screen overflow-hidden'>
      <Script id='home-structured-data' type='application/ld+json'>
        {JSON.stringify(structuredData)}
      </Script>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--primary)/0.2,transparent_34%),radial-gradient(circle_at_bottom_right,var(--accent)/0.16,transparent_32%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--muted)_24%,transparent))]' />
      <div className='absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--border)_45%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_45%,transparent)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30' />

      <div className='relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-10'>
        <header className='flex items-center justify-between gap-4 py-3'>
          <BrandLink
            priority
            size={44}
            className='gap-3.5'
            imageClassName='rounded-2xl'
            labelClassName='text-lg font-semibold'
          />
          <div className='flex items-center gap-2'>
            <Button variant='ghost' asChild>
              <Link href='/docs'>Docs</Link>
            </Button>
            <Button variant='ghost' asChild>
              <Link href='/install'>Install</Link>
            </Button>
            <Button asChild>
              <Link href={dashboardHref}>{userId ? 'Open Dashboard' : 'Sign In'}</Link>
            </Button>
          </div>
        </header>

        <section className='grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20'>
          <div className='space-y-8'>
            <Badge variant='outline' className='bg-background/80 px-4 py-1.5 backdrop-blur'>
              CLI + VS Code are the primary experience
            </Badge>

            <div className='space-y-5'>
              <h1 className='max-w-5xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl'>
                Catch risky diffs before the PR, then keep the audit trail attached.
              </h1>
              <p className='text-muted-foreground max-w-3xl text-lg leading-8 sm:text-xl'>
                Diffmint keeps review close to git with `dm` and VS Code, then uses the web control
                plane for workspace rules, providers, billing, history, docs, and audit. Local by
                default, governed when teams need it.
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              <Button size='lg' asChild>
                <Link href='/install'>
                  Install Diffmint
                  <Icons.arrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
              <Button size='lg' variant='outline' asChild>
                <Link href='/docs/getting-started/5-minute-quickstart'>Start the Quickstart</Link>
              </Button>
            </div>

            <div className='flex flex-wrap gap-2 pt-1'>
              {controlPlaneBenefits.map((item) => (
                <Badge key={item} variant='secondary' className='rounded-full px-3 py-1 text-xs'>
                  {item}
                </Badge>
              ))}
            </div>

            <div className='grid gap-3 pt-2 sm:grid-cols-3'>
              {productPillars.map((pillar) => (
                <Card
                  key={pillar.title}
                  className='bg-background/80 border-border/60 backdrop-blur'
                >
                  <CardHeader>
                    <CardTitle className='text-base'>{pillar.title}</CardTitle>
                    <CardDescription>{pillar.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <Card className='overflow-hidden border-sidebar-border/60 bg-sidebar text-sidebar-foreground shadow-2xl'>
            <CardHeader className='border-sidebar-border/60 border-b pb-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='h-2.5 w-2.5 rounded-full bg-sidebar-foreground/90' />
                  <span className='h-2.5 w-2.5 rounded-full bg-sidebar-foreground/45' />
                  <span className='bg-primary h-2.5 w-2.5 rounded-full' />
                </div>
                <Badge variant='secondary' className='font-mono text-[11px]'>
                  dm review --base origin/main
                </Badge>
              </div>

              <div className='space-y-1 pt-2 font-mono text-sm'>
                <p>
                  <span className='text-primary'>$</span> dm auth login
                </p>
                <p>
                  <span className='text-primary'>$</span> dm review --base origin/main
                </p>
                <p className='text-sidebar-foreground/70'>
                  summary · 3 findings · 1 policy note · 1 missing test
                </p>
              </div>
            </CardHeader>

            <CardContent className='space-y-4 p-5 font-mono text-sm'>
              {terminalFindings.map((finding) => (
                <div
                  key={finding.file}
                  className='bg-sidebar-accent/60 border-sidebar-border/60 space-y-2 rounded-2xl border p-4'
                >
                  <div className='flex items-center justify-between gap-3'>
                    <span className='truncate text-sm'>{finding.file}</span>
                    <Badge variant='outline' className='text-[11px]'>
                      {finding.severity}
                    </Badge>
                  </div>
                  <p className='text-sidebar-foreground/70 text-xs leading-6'>{finding.detail}</p>
                </div>
              ))}
              <div className='flex items-center justify-between rounded-2xl border border-dashed border-sidebar-border/60 px-4 py-3 text-xs text-sidebar-foreground/70'>
                <span>policy: secure-web-v12</span>
                <span>sync: workspace/history</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className='grid gap-4 border-y py-8 sm:grid-cols-2 xl:grid-cols-4'>
          {[
            'Review before a PR exists',
            'Keep cloud sync optional',
            'Attach policy versions to every report',
            'Use the browser for governance, not raw review'
          ].map((item) => (
            <div key={item} className='flex items-center gap-3'>
              <span className='bg-primary h-2.5 w-2.5 rounded-full' />
              <p className='text-muted-foreground text-sm'>{item}</p>
            </div>
          ))}
        </section>

        <section id='surfaces' className='space-y-6 py-16'>
          <div className='max-w-3xl space-y-3'>
            <Badge variant='outline'>Product surfaces</Badge>
            <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
              Built around the workflow teams already trust.
            </h2>
            <p className='text-muted-foreground text-lg leading-8'>
              Diffmint splits the product intentionally: the CLI and extension stay focused on code
              review, while the browser owns governance, support, and operations.
            </p>
          </div>

          <div className='grid gap-4 lg:grid-cols-3'>
            {productSurfaces.map((surface) => {
              const Icon = surface.icon;

              return (
                <Card
                  key={surface.title}
                  className='bg-background/80 border-border/60 backdrop-blur'
                >
                  <CardHeader className='space-y-4'>
                    <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl border'>
                      <Icon className='h-5 w-5' />
                    </div>
                    <div className='space-y-2'>
                      <CardTitle className='text-xl'>{surface.title}</CardTitle>
                      <CardDescription className='text-sm leading-7'>
                        {surface.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        <section className='grid gap-6 py-4 lg:grid-cols-[0.9fr_1.1fr]'>
          <Card className='bg-background/80 border-border/60'>
            <CardHeader>
              <Badge variant='outline' className='w-fit'>
                Governance built in
              </Badge>
              <CardTitle className='text-2xl'>
                The web app is a control plane, not a chat box.
              </CardTitle>
              <CardDescription className='text-base leading-7'>
                Teams use Diffmint to standardize reviews across providers, preserve auditability,
                and make onboarding reproducible without centralizing the whole repository.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-3 sm:grid-cols-2'>
              {governanceChecks.map((item) => (
                <div
                  key={item}
                  className='bg-muted/40 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm'
                >
                  <Icons.check className='text-primary h-4 w-4 shrink-0' />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className='grid gap-4 sm:grid-cols-3'>
            {workflowSteps.map((step, index) => (
              <Card key={step.title} className='bg-background/75 border-border/60'>
                <CardHeader className='space-y-4'>
                  <Badge variant='secondary' className='w-fit'>
                    Step {index + 1}
                  </Badge>
                  <div className='space-y-2'>
                    <CardTitle className='text-lg'>{step.title}</CardTitle>
                    <CardDescription className='leading-7'>{step.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className='py-16'>
          <Card className='bg-background/80 border-primary/20 overflow-hidden backdrop-blur'>
            <CardContent className='flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10'>
              <div className='max-w-2xl space-y-3'>
                <Badge variant='outline'>Ready to try it</Badge>
                <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                  Start with the local workflow, then add the control plane when the team needs it.
                </h2>
                <p className='text-muted-foreground text-base leading-7'>
                  Install the CLI, connect a workspace, run a review from your branch, and keep the
                  browser for policy, billing, docs, and audit.
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-3'>
                <Button size='lg' asChild>
                  <Link href='/install'>Install `dm`</Link>
                </Button>
                <Button size='lg' variant='outline' asChild>
                  <Link href={dashboardHref}>{userId ? 'Open Dashboard' : 'Sign In'}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
