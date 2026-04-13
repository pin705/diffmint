import type { Metadata } from 'next';
import {
  getAllDocs,
  getAdjacentDocs,
  getDocBySlug,
  getDocsNavigation,
  getRelatedDocs
} from '@diffmint/docs-content';
import { notFound } from 'next/navigation';
import { DocsHome, DocsOverviewAside } from '@/components/docs/docs-home';
import { DocsPager, DocsPublicHeader, DocsRelatedRail } from '@/components/docs/docs-page-parts';
import { DocsShell } from '@/components/docs/docs-shell';
import { DocMdx } from '@/components/docs/mdx';

export async function generateStaticParams() {
  return getAllDocs().map((doc) => ({
    slug: doc.slugSegments
  }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {
      title: 'Documentation',
      description:
        'Install Diffmint, understand the product model, and roll it out with polished end-user guidance.'
    };
  }

  return {
    title: doc.title,
    description: doc.description,
    robots:
      doc.section === 'Changelog'
        ? {
            index: false,
            follow: false
          }
        : undefined
  };
}

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const navigation = getDocsNavigation();

  if (!slug || slug.length === 0) {
    return (
      <main className='relative min-h-screen overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.1),transparent_30%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--muted)_18%,transparent))]' />
        <div className='absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--border)_42%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_42%,transparent)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25' />

        <div className='relative mx-auto min-h-screen max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8'>
          <DocsPublicHeader navigation={navigation} />
          <DocsShell
            currentHref='/docs'
            navigation={navigation}
            title='Documentation'
            description='Self-serve onboarding, rollout guidance, command reference, and operating principles for teams using Diffmint.'
            aside={<DocsOverviewAside />}
            frameContent={false}
            showPageIntro={false}
          >
            <DocsHome navigation={navigation} />
          </DocsShell>
        </div>
      </main>
    );
  }

  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const relatedDocs = getRelatedDocs(doc);
  const { previous, next } = getAdjacentDocs(doc);

  return (
    <main className='relative min-h-screen overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.1),transparent_30%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--muted)_18%,transparent))]' />
      <div className='absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--border)_42%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_42%,transparent)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25' />

      <div className='relative mx-auto min-h-screen max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8'>
        <DocsPublicHeader navigation={navigation} />
        <DocsShell
          currentHref={doc.href}
          navigation={navigation}
          title={doc.title}
          description={doc.description}
          aside={<DocsRelatedRail relatedDocs={relatedDocs} variant='public' />}
          footer={<DocsPager previous={previous} next={next} variant='public' />}
          headingItems={doc.headings}
          readingTimeMinutes={doc.readingTimeMinutes}
          section={doc.section}
          surfaces={doc.surfaces}
        >
          <DocMdx source={doc.body} />
        </DocsShell>
      </div>
    </main>
  );
}
