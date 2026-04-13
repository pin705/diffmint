import { BrandLink } from '@/components/brand-logo';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthShellProps {
  alternateHref: string;
  alternateLabel: string;
  alternatePrompt: string;
  children: ReactNode;
  description: string;
  title: string;
}

export function AuthShell({
  alternateHref,
  alternateLabel,
  alternatePrompt,
  children,
  description,
  title
}: AuthShellProps) {
  return (
    <main className='relative min-h-screen overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_28%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--muted)_14%,transparent))]' />
      <div className='absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--border)_40%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_40%,transparent)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20' />

      <div className='relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8'>
        <header className='mb-10 flex items-center justify-between gap-4'>
          <BrandLink
            priority
            size={42}
            className='gap-3.5'
            imageClassName='rounded-2xl'
            labelClassName='text-lg font-semibold'
          />
          <Link
            href='/'
            className='text-muted-foreground hover:text-foreground text-sm transition-colors'
          >
            Home
          </Link>
        </header>

        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-md space-y-6'>
            <div className='space-y-4 text-center'>
              <Badge variant='outline' className='rounded-full bg-background/80 px-3 py-1'>
                Authentication
              </Badge>
              <div className='space-y-2'>
                <h1 className='text-4xl font-semibold tracking-tight'>{title}</h1>
                <p className='text-muted-foreground text-base leading-7'>{description}</p>
              </div>
            </div>

            <div className='flex justify-center'>{children}</div>

            <div className='text-muted-foreground text-center text-sm'>
              {alternatePrompt}{' '}
              <Link
                href={alternateHref}
                className='text-foreground font-medium underline underline-offset-4'
              >
                {alternateLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
