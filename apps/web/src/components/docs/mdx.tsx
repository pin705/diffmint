import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import type { HTMLAttributes, ReactNode } from 'react';

function MdxLink({ href = '', children }: { href?: string; children?: ReactNode }) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} className='text-primary font-medium underline underline-offset-4'>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      className='text-primary font-medium underline underline-offset-4'
    >
      {children}
    </a>
  );
}

const components = {
  a: MdxLink,
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className='text-4xl font-semibold tracking-tight text-balance' {...props} />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className='mt-10 text-2xl font-semibold tracking-tight' {...props} />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className='mt-8 text-xl font-semibold tracking-tight' {...props} />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p className='text-muted-foreground mt-4 text-base leading-8' {...props} />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul className='text-muted-foreground mt-4 list-disc space-y-2 pl-6' {...props} />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol className='text-muted-foreground mt-4 list-decimal space-y-2 pl-6' {...props} />
  ),
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className='border-primary/30 bg-muted/40 text-foreground mt-6 rounded-2xl border-l-4 px-5 py-4 italic'
      {...props}
    />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code className='bg-muted rounded px-1.5 py-0.5 text-sm' {...props} />
  ),
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre
      className='bg-card mt-6 overflow-x-auto rounded-2xl border px-4 py-4 text-sm leading-7'
      {...props}
    />
  ),
  table: (props: HTMLAttributes<HTMLTableElement>) => (
    <table className='mt-6 w-full border-collapse overflow-hidden rounded-2xl border' {...props} />
  ),
  th: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <th className='bg-muted/60 border px-3 py-2 text-left font-semibold' {...props} />
  ),
  td: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <td className='border px-3 py-2 align-top' {...props} />
  ),
  hr: () => <div className='border-border my-8 border-t' />
};

export async function DocMdx({ source }: { source: string }) {
  return (
    <div className='[&_strong]:text-foreground'>
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm]
          }
        }}
      />
    </div>
  );
}
