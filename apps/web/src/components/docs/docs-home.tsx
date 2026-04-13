import Link from 'next/link';
import { type DocsNavGroup, type VisibleDocSection } from '@diffmint/docs-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  docsSectionVisuals,
  getDocMap,
  getDocsHref,
  getSectionMeta,
  type DocsVariant
} from './docs-shared';

interface DocsHomeProps {
  navigation: DocsNavGroup[];
  variant?: DocsVariant;
}

const recommendedTracks = [
  {
    title: 'Developer quick path',
    description:
      'Install, authenticate, run the first review, and then branch into command-level depth only when needed.',
    hrefs: [
      '/docs/getting-started/5-minute-quickstart',
      '/docs/getting-started/install-cli',
      '/docs/cli/reference'
    ]
  },
  {
    title: 'Workspace rollout path',
    description:
      'Set workspace defaults, provider policy, and governance in the order operators actually need them.',
    hrefs: [
      '/docs/admin/workspace-setup',
      '/docs/admin/provider-strategy',
      '/docs/concepts/workspaces-policies-and-governance'
    ]
  },
  {
    title: 'Security review path',
    description:
      'Understand local-first behavior, redaction boundaries, and the exact surfaces admins own.',
    hrefs: [
      '/docs/security/privacy-and-redaction',
      '/docs/concepts/local-first-review',
      '/docs/concepts/architecture'
    ]
  }
];

const operatingPrinciples = [
  {
    title: 'Sequenced for real adoption',
    description:
      'The docs are organized by the decisions teams must make in order, not by which team happened to build the feature.',
    icon: Icons.sparkles
  },
  {
    title: 'CLI and editor first',
    description:
      'Documentation starts from the local workflow, then connects outward to governance, history, and billing.',
    icon: Icons.code
  },
  {
    title: 'Operator-grade clarity',
    description:
      'Security, rollout, and billing language is written for admins who need policy clarity, not just screenshots.',
    icon: Icons.lock
  }
];

function SurfaceMetrics({ navigation }: { navigation: DocsNavGroup[] }) {
  const totalDocs = navigation.reduce((sum, group) => sum + group.items.length, 0);
  const adminDocs = navigation.find((group) => group.section === 'Admin Guide')?.items.length ?? 0;
  const operatorSections = navigation.filter((group) =>
    ['Admin Guide', 'Security & Privacy', 'Release Channels'].includes(group.section)
  ).length;

  const metrics = [
    { value: totalDocs, label: 'Guides' },
    { value: navigation.length, label: 'Sections' },
    { value: adminDocs + operatorSections, label: 'Operator surfaces' }
  ];

  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className='rounded-[1.4rem] border border-border/70 bg-background/70 px-4 py-4 shadow-sm'
        >
          <p className='text-2xl font-semibold tracking-tight'>{metric.value}</p>
          <p className='text-muted-foreground mt-1 text-sm'>{metric.label}</p>
        </div>
      ))}
    </div>
  );
}

export function DocsHome({ navigation, variant = 'public' }: DocsHomeProps) {
  const docMap = getDocMap(navigation);
  const quickstart = docMap.get('/docs/getting-started/5-minute-quickstart');
  const adminGuide = docMap.get('/docs/admin/workspace-setup');
  const securityGuide = docMap.get('/docs/security/privacy-and-redaction');

  return (
    <div className='space-y-7 sm:space-y-8'>
      <section className='grid gap-5 xl:grid-cols-[1.06fr_0.94fr]'>
        <div className='relative overflow-hidden rounded-[2rem] border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_32%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_90%,transparent),color-mix(in_oklab,var(--muted)_24%,transparent))] p-7 shadow-sm sm:p-8'>
          <div className='absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent' />
          <div className='relative space-y-6'>
            <Badge variant='outline' className='rounded-full bg-background/80 px-3 py-1'>
              Canonical product docs
            </Badge>

            <div className='space-y-4'>
              <h2 className='max-w-3xl font-serif text-4xl leading-tight font-semibold tracking-[-0.03em] text-balance sm:text-5xl'>
                Documentation that feels like an operator manual, not a feature dump.
              </h2>
              <p className='text-muted-foreground max-w-2xl text-base leading-8 sm:text-lg'>
                Start with the shortest path to a first successful review. Stay for the rollout,
                governance, and release guidance teams need once Diffmint becomes shared
                infrastructure.
              </p>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Button asChild>
                <Link href={getDocsHref('/docs/getting-started/5-minute-quickstart', variant)}>
                  Start the quickstart
                  <Icons.arrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
              <Button variant='outline' asChild>
                <Link href={getDocsHref('/docs/cli/reference', variant)}>Open CLI reference</Link>
              </Button>
              <Button variant='ghost' asChild>
                <Link href={getDocsHref('/docs/admin/workspace-setup', variant)}>Plan rollout</Link>
              </Button>
            </div>

            <SurfaceMetrics navigation={navigation} />
          </div>
        </div>

        <div className='grid gap-4'>
          {[
            {
              label: 'Start here',
              doc: quickstart,
              icon: Icons.sparkles,
              tone: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
            },
            {
              label: 'For admins',
              doc: adminGuide,
              icon: Icons.workspace,
              tone: 'bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300'
            },
            {
              label: 'Security posture',
              doc: securityGuide,
              icon: Icons.lock,
              tone: 'bg-rose-500/12 text-rose-700 dark:text-rose-300'
            }
          ].map((entry) => {
            if (!entry.doc) {
              return null;
            }

            const Icon = entry.icon;

            return (
              <Link
                key={entry.label}
                href={getDocsHref(entry.doc.href, variant)}
                className='group block rounded-[1.75rem] border border-border/70 bg-background/80 p-5 shadow-sm transition-transform hover:-translate-y-0.5'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-3'>
                    <span
                      className={cn(
                        'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/50 shadow-sm',
                        entry.tone
                      )}
                    >
                      <Icon className='h-4 w-4' />
                    </span>
                    <div className='space-y-1.5'>
                      <p className='text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase'>
                        {entry.label}
                      </p>
                      <h3 className='text-lg font-semibold tracking-tight'>{entry.doc.title}</h3>
                      <p className='text-muted-foreground text-sm leading-6'>
                        {entry.doc.description}
                      </p>
                    </div>
                  </div>
                  <Icons.arrowRight className='text-muted-foreground mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5' />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className='space-y-4'>
        <div className='space-y-2'>
          <p className='text-primary text-sm font-medium uppercase tracking-[0.22em]'>
            Recommended paths
          </p>
          <h2 className='text-2xl font-semibold tracking-tight text-balance sm:text-3xl'>
            Follow the route that matches the job you are doing.
          </h2>
        </div>
        <div className='grid gap-4 xl:grid-cols-3'>
          {recommendedTracks.map((track, index) => (
            <Card
              key={track.title}
              className='rounded-[1.75rem] border-border/70 bg-background/80 shadow-sm'
            >
              <CardHeader className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <span className='bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold'>
                    0{index + 1}
                  </span>
                  <CardTitle className='text-lg'>{track.title}</CardTitle>
                </div>
                <CardDescription className='text-sm leading-6'>{track.description}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                {track.hrefs.map((href) => {
                  const doc = docMap.get(href);

                  if (!doc) {
                    return null;
                  }

                  return (
                    <Link
                      key={href}
                      href={getDocsHref(href, variant)}
                      className='hover:bg-muted/60 flex items-start justify-between gap-3 rounded-2xl border border-border/70 px-4 py-3 transition-colors'
                    >
                      <div>
                        <p className='font-medium'>{doc.title}</p>
                        <p className='text-muted-foreground mt-1 text-sm'>{doc.description}</p>
                      </div>
                      <Icons.arrowRight className='text-muted-foreground mt-1 h-4 w-4 shrink-0' />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className='space-y-4'>
        <div className='space-y-2'>
          <p className='text-primary text-sm font-medium uppercase tracking-[0.22em]'>
            Section directory
          </p>
          <h2 className='text-2xl font-semibold tracking-tight text-balance sm:text-3xl'>
            Every section has a job, an audience, and a deliberate first entry point.
          </h2>
        </div>
        <div className='grid gap-4 xl:grid-cols-2'>
          {navigation.map((group) => {
            const section = group.section as VisibleDocSection;
            const visual = docsSectionVisuals[section];
            const meta = getSectionMeta(section);
            const Icon = Icons[visual.icon];

            return (
              <Card
                key={group.section}
                className='rounded-[1.85rem] border-border/70 bg-background/82 shadow-sm'
              >
                <CardHeader className='space-y-4'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='space-y-3'>
                      <span
                        className={cn(
                          'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 shadow-sm',
                          visual.accentClass,
                          visual.borderClass
                        )}
                      >
                        <Icon className='h-5 w-5' />
                      </span>
                      <div className='space-y-1.5'>
                        <CardTitle className='text-xl'>{group.section}</CardTitle>
                        <CardDescription className='max-w-xl text-sm leading-6'>
                          {meta.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className='space-y-2 text-right'>
                      <Badge variant='outline' className='rounded-full bg-background/80 px-3 py-1'>
                        {meta.audience}
                      </Badge>
                      <p className='text-muted-foreground text-xs'>{group.items.length} guides</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {group.items.slice(0, 4).map((item) => (
                    <Link
                      key={item.href}
                      href={getDocsHref(item.href, variant)}
                      className='hover:bg-muted/60 flex items-start justify-between gap-3 rounded-2xl border border-border/70 px-4 py-3 transition-colors'
                    >
                      <div>
                        <p className='font-medium'>{item.title}</p>
                        <p className='text-muted-foreground mt-1 text-sm'>{item.description}</p>
                      </div>
                      <Icons.arrowRight className='text-muted-foreground mt-1 h-4 w-4 shrink-0' />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        {operatingPrinciples.map((principle) => {
          const Icon = principle.icon;

          return (
            <Card
              key={principle.title}
              className='rounded-[1.75rem] border-border/70 bg-background/78 shadow-sm'
            >
              <CardHeader className='space-y-4'>
                <span className='bg-primary/10 text-primary inline-flex h-11 w-11 items-center justify-center rounded-2xl'>
                  <Icon className='h-5 w-5' />
                </span>
                <div className='space-y-2'>
                  <CardTitle className='text-lg'>{principle.title}</CardTitle>
                  <CardDescription className='text-sm leading-6'>
                    {principle.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

export function DocsOverviewAside({ variant = 'public' }: { variant?: DocsVariant }) {
  return (
    <div className='space-y-4'>
      <Card className='rounded-[1.75rem] border-border/70 bg-background/80 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base'>Fast paths</CardTitle>
          <CardDescription>
            Start where the time-to-value is shortest, then branch out.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          <Button variant='outline' asChild className='w-full justify-start'>
            <Link href={getDocsHref('/docs/getting-started/5-minute-quickstart', variant)}>
              5-minute quickstart
            </Link>
          </Button>
          <Button variant='outline' asChild className='w-full justify-start'>
            <Link href={getDocsHref('/docs/cli/reference', variant)}>CLI reference</Link>
          </Button>
          <Button variant='ghost' asChild className='w-full justify-start'>
            <Link href={getDocsHref('/docs/admin/workspace-setup', variant)}>Workspace setup</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className='rounded-[1.75rem] border-border/70 bg-background/80 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base'>Docs operating model</CardTitle>
          <CardDescription>
            The browser owns rollout, policy, docs, and audit. The CLI and extension stay closest to
            code review.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          {[
            'Quickstart before deep reference',
            'Operator guidance before internal architecture details',
            'Security language written for decision-makers'
          ].map((item) => (
            <div key={item} className='flex items-start gap-3'>
              <span className='bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full' />
              <p className='text-muted-foreground leading-6'>{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
