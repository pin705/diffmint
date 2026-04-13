import Link from 'next/link';
import type { DocPage, DocsNavGroup } from '@diffmint/docs-content';
import { BrandLink } from '@/components/brand-logo';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getDocsHref, getDocsSectionHref, type DocsVariant } from './docs-shared';

export function DocsPublicHeader({ navigation }: { navigation: DocsNavGroup[] }) {
  return (
    <header className='sticky top-0 z-30 mb-8 overflow-hidden rounded-[1.85rem] border border-border/70 bg-background/80 shadow-sm backdrop-blur-xl'>
      <div className='border-b border-border/70 px-5 py-4 sm:px-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <BrandLink
            priority
            size={42}
            className='gap-3.5'
            imageClassName='rounded-2xl'
            labelClassName='text-lg font-semibold'
          />
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='ghost' asChild>
              <Link href='/'>Home</Link>
            </Button>
            <Button variant='ghost' asChild>
              <Link href='/install'>Install</Link>
            </Button>
            <Button asChild>
              <Link href='/auth/sign-in'>Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className='px-4 py-3 sm:px-6'>
        <div className='flex flex-wrap gap-2'>
          {navigation.map((group) => (
            <Link
              key={group.section}
              href={getDocsSectionHref(group, 'public')}
              className='hover:bg-muted/70 rounded-full border border-border/70 px-3 py-2 text-sm transition-colors'
            >
              <span className='font-medium'>{group.section}</span>
              <span className='text-muted-foreground ml-2 text-xs'>{group.items.length}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

export function DocsRelatedRail({
  relatedDocs,
  variant,
  title = 'Continue reading',
  description = 'Stay in the same flow without opening a broad index again.'
}: {
  relatedDocs: DocPage[];
  variant: DocsVariant;
  title?: string;
  description?: string;
}) {
  if (relatedDocs.length === 0) {
    return null;
  }

  return (
    <Card className='rounded-[1.75rem] border-border/70 bg-background/80 shadow-sm'>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        {relatedDocs.map((doc) => (
          <Link
            key={doc.href}
            href={getDocsHref(doc.href, variant)}
            className='hover:bg-muted/60 block rounded-2xl border border-border/70 px-4 py-3 transition-colors'
          >
            <p className='font-medium'>{doc.title}</p>
            <p className='text-muted-foreground mt-1 text-sm leading-6'>{doc.description}</p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function DocsPager({
  previous,
  next,
  variant
}: {
  previous: DocPage | null;
  next: DocPage | null;
  variant: DocsVariant;
}) {
  if (!previous && !next) {
    return null;
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {[
        previous
          ? {
              key: previous.href,
              label: 'Previous',
              title: previous.title,
              description: previous.description,
              href: getDocsHref(previous.href, variant),
              align: 'left' as const
            }
          : null,
        next
          ? {
              key: next.href,
              label: 'Next',
              title: next.title,
              description: next.description,
              href: getDocsHref(next.href, variant),
              align: 'right' as const
            }
          : null
      ]
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              'group rounded-[1.75rem] border border-border/70 bg-background/82 p-5 shadow-sm transition-transform hover:-translate-y-0.5',
              item.align === 'right' && 'md:text-right'
            )}
          >
            <div className='flex items-start justify-between gap-4'>
              <div className='space-y-2'>
                <Badge variant='outline' className='rounded-full bg-background/80 px-3 py-1'>
                  {item.label}
                </Badge>
                <div>
                  <h3 className='text-lg font-semibold tracking-tight'>{item.title}</h3>
                  <p className='text-muted-foreground mt-1 text-sm leading-6'>{item.description}</p>
                </div>
              </div>
              <Icons.arrowRight
                className={cn(
                  'text-muted-foreground mt-1 h-4 w-4 shrink-0 transition-transform',
                  item.align === 'left'
                    ? 'rotate-180 group-hover:-translate-x-0.5'
                    : 'group-hover:translate-x-0.5'
                )}
              />
            </div>
          </Link>
        ))}
    </div>
  );
}
