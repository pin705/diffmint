import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { DocHeading, DocsNavGroup, VisibleDocSection } from '@diffmint/docs-content';
import type { ReactNode } from 'react';
import {
  docsSectionVisuals,
  formatReadingTime,
  getDocsHref,
  getDocsSectionHref,
  type DocsVariant
} from './docs-shared';

interface DocsShellProps {
  currentHref: string;
  navigation: DocsNavGroup[];
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  frameContent?: boolean;
  headingItems?: DocHeading[];
  readingTimeMinutes?: number;
  section?: string;
  surfaces?: string[];
  showPageIntro?: boolean;
  variant?: DocsVariant;
}

function SectionNav({
  currentHref,
  navigation,
  variant
}: {
  currentHref: string;
  navigation: DocsNavGroup[];
  variant: DocsVariant;
}) {
  return (
    <nav className='space-y-4'>
      {navigation.map((group) => {
        const section = group.section as VisibleDocSection;
        const visual = docsSectionVisuals[section];
        const Icon = Icons[visual.icon];
        const sectionHref = getDocsSectionHref(group, variant);

        return (
          <div key={group.section} className='space-y-2.5'>
            <Link
              href={sectionHref}
              className='group hover:border-border/80 flex items-center justify-between rounded-2xl border border-transparent px-3 py-2 transition-colors'
            >
              <div className='flex items-center gap-3'>
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-2xl border border-white/50 shadow-sm',
                    visual.accentClass,
                    visual.borderClass
                  )}
                >
                  <Icon className='h-4 w-4' />
                </span>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold'>{group.section}</p>
                  <p className='text-muted-foreground text-xs'>{group.items.length} guides</p>
                </div>
              </div>
              <Icons.chevronRight className='text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-0.5' />
            </Link>

            <div className='space-y-1.5 pl-2'>
              {group.items.map((item) => {
                const itemHref = getDocsHref(item.href, variant);
                const isActive = currentHref === itemHref;

                return (
                  <Link
                    key={item.href}
                    href={itemHref}
                    className={cn(
                      'group block rounded-2xl border px-3 py-2.5 transition-all',
                      isActive
                        ? 'border-primary/20 bg-primary/8 shadow-sm'
                        : 'border-transparent hover:border-border/70 hover:bg-background/80'
                    )}
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p
                          className={cn(
                            'line-clamp-1 text-sm font-medium',
                            isActive ? 'text-foreground' : 'text-foreground/90'
                          )}
                        >
                          {item.title}
                        </p>
                        <p className='text-muted-foreground mt-1 line-clamp-2 text-xs leading-5'>
                          {item.description}
                        </p>
                      </div>
                      {isActive ? (
                        <span className='bg-primary mt-1 h-2 w-2 shrink-0 rounded-full' />
                      ) : (
                        <Icons.arrowRight className='text-muted-foreground mt-1 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function MobileSectionNav({
  currentHref,
  navigation,
  variant
}: {
  currentHref: string;
  navigation: DocsNavGroup[];
  variant: DocsVariant;
}) {
  return (
    <div className='mb-5 xl:hidden'>
      <div className='overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/80 shadow-sm backdrop-blur-xl'>
        <div className='border-b border-border/70 px-5 py-4'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold'>Browse documentation</p>
              <p className='text-muted-foreground mt-1 text-sm'>
                Move by section without losing article context.
              </p>
            </div>
            <Kbd>⌘</Kbd>
          </div>
        </div>
        <Accordion type='multiple' className='w-full px-3 py-2'>
          {navigation.map((group) => (
            <AccordionItem key={group.section} value={group.section} className='border-none'>
              <AccordionTrigger className='rounded-2xl px-3 py-3 text-sm font-semibold hover:no-underline'>
                <span className='flex items-center gap-3'>
                  <span className='text-muted-foreground'>{group.section}</span>
                  <Badge variant='outline' className='rounded-full text-[10px]'>
                    {group.items.length}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className='space-y-2 px-3 pb-3'>
                {group.items.map((item) => {
                  const itemHref = getDocsHref(item.href, variant);
                  const isActive = currentHref === itemHref;

                  return (
                    <Link
                      key={item.href}
                      href={itemHref}
                      className={cn(
                        'block rounded-2xl border px-3 py-3 text-sm transition-colors',
                        isActive
                          ? 'border-primary/20 bg-primary/8'
                          : 'border-border/60 bg-background/70'
                      )}
                    >
                      <p className='font-medium'>{item.title}</p>
                      <p className='text-muted-foreground mt-1 text-xs leading-5'>
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function OnThisPage({ headingItems }: { headingItems: DocHeading[] }) {
  if (headingItems.length === 0) {
    return null;
  }

  return (
    <div className='overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/80 shadow-sm backdrop-blur-xl'>
      <div className='border-b border-border/70 px-5 py-4'>
        <p className='text-sm font-semibold'>On this page</p>
        <p className='text-muted-foreground mt-1 text-sm'>Jump directly to the section you need.</p>
      </div>
      <div className='space-y-1 px-3 py-3'>
        {headingItems.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              'hover:bg-muted/70 flex rounded-2xl px-3 py-2 text-sm transition-colors',
              heading.level === 2 ? 'font-medium' : 'text-muted-foreground',
              heading.level === 3 && 'pl-6',
              heading.level === 4 && 'pl-9'
            )}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </div>
  );
}

export function DocsShell({
  currentHref,
  navigation,
  title,
  description,
  children,
  aside,
  footer,
  frameContent = true,
  headingItems = [],
  readingTimeMinutes,
  section,
  surfaces = [],
  showPageIntro = true,
  variant = 'public'
}: DocsShellProps) {
  const sectionVisual =
    section && section in docsSectionVisuals
      ? docsSectionVisuals[section as VisibleDocSection]
      : null;
  const SectionIcon = sectionVisual ? Icons[sectionVisual.icon] : Icons.page;

  return (
    <div className='relative'>
      <div className='pointer-events-none absolute inset-x-10 top-4 h-px bg-gradient-to-r from-transparent via-border to-transparent' />
      <div className='pointer-events-none absolute inset-y-0 left-[18%] hidden w-px bg-gradient-to-b from-transparent via-border/60 to-transparent xl:block' />
      <div className='grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)_290px]'>
        <aside className='hidden xl:block'>
          <div className='sticky top-6 overflow-hidden rounded-[2rem] border border-border/70 bg-background/78 shadow-sm backdrop-blur-xl'>
            <div className='border-b border-border/70 px-5 py-5'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <p className='text-sm font-semibold'>
                    {variant === 'dashboard' ? 'Docs Center' : 'Documentation'}
                  </p>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    Canonical guidance for operators and developers.
                  </p>
                </div>
                <Kbd>docs</Kbd>
              </div>
            </div>
            <ScrollArea className='max-h-[calc(100vh-8rem)] px-3 py-4'>
              <SectionNav currentHref={currentHref} navigation={navigation} variant={variant} />
            </ScrollArea>
          </div>
        </aside>

        <section className='min-w-0'>
          <MobileSectionNav currentHref={currentHref} navigation={navigation} variant={variant} />

          {showPageIntro ? (
            <header className='relative mb-6 overflow-hidden rounded-[2rem] border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_34%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_88%,transparent),color-mix(in_oklab,var(--muted)_24%,transparent))] p-7 shadow-sm sm:p-8'>
              <div className='absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent' />
              <div className='relative space-y-5'>
                <div className='flex flex-wrap items-center gap-2.5'>
                  {section ? (
                    <Badge variant='outline' className='rounded-full bg-background/80 px-3 py-1'>
                      <span className='flex items-center gap-2'>
                        <SectionIcon className='h-3.5 w-3.5' />
                        {section}
                      </span>
                    </Badge>
                  ) : null}
                  {typeof readingTimeMinutes === 'number' ? (
                    <Badge variant='outline' className='rounded-full bg-background/80 px-3 py-1'>
                      {formatReadingTime(readingTimeMinutes)}
                    </Badge>
                  ) : null}
                  {surfaces.map((surface) => (
                    <Badge
                      key={surface}
                      variant='outline'
                      className='rounded-full bg-background/80 px-3 py-1 uppercase'
                    >
                      {surface}
                    </Badge>
                  ))}
                </div>

                <div className='space-y-3'>
                  <h1 className='max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl'>
                    {title}
                  </h1>
                  <p className='text-muted-foreground max-w-3xl text-base leading-8 sm:text-lg'>
                    {description}
                  </p>
                </div>

                <div className='flex flex-wrap items-center gap-3'>
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <span className='bg-primary h-2 w-2 rounded-full' />
                    Structured for self-serve rollout
                  </div>
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <Icons.sparkles className='h-4 w-4' />
                    Product docs, not marketing copy
                  </div>
                </div>
              </div>
            </header>
          ) : null}

          {frameContent ? (
            <div className='overflow-hidden rounded-[2rem] border border-border/70 bg-background/82 shadow-sm backdrop-blur-xl'>
              <div className='border-b border-border/70 px-6 py-4 sm:px-8'>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <Icons.page className='h-4 w-4' />
                  Canonical guide
                </div>
              </div>
              <div className='px-6 py-8 sm:px-8 sm:py-10'>{children}</div>
            </div>
          ) : (
            children
          )}

          {footer ? <div className='mt-6'>{footer}</div> : null}
        </section>

        <aside className='hidden xl:block'>
          <div className='sticky top-6 space-y-4'>
            <OnThisPage headingItems={headingItems} />
            {aside}
          </div>
        </aside>
      </div>
    </div>
  );
}
