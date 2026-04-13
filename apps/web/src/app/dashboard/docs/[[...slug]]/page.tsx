import { getDocBySlug, getDocsNavigation } from '@diffmint/docs-content';
import { notFound } from 'next/navigation';
import { DocsHome, DocsOverviewAside } from '@/components/docs/docs-home';
import PageContainer from '@/components/layout/page-container';
import { DocsShell } from '@/components/docs/docs-shell';
import { DocMdx } from '@/components/docs/mdx';
import { WorkspaceDocLinks } from '@/components/docs/workspace-doc-links';
import { docsCenterInfoContent } from '@/config/infoconfig';

export default async function DashboardDocsPage({
  params
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const navigation = getDocsNavigation();

  if (!slug || slug.length === 0) {
    return (
      <PageContainer
        scrollable
        pageTitle='Docs Center'
        pageDescription='Canonical onboarding, product concepts, CLI reference, and admin rollout guidance.'
        infoContent={docsCenterInfoContent}
      >
        <DocsShell
          currentHref='/dashboard/docs'
          navigation={navigation}
          title='Docs Center'
          description='The same canonical docs as the public site, with a workspace-aware path for admins and operators.'
          aside={
            <div className='space-y-4'>
              <DocsOverviewAside variant='dashboard' />
              <WorkspaceDocLinks />
            </div>
          }
          frameContent={false}
          variant='dashboard'
        >
          <DocsHome navigation={navigation} variant='dashboard' />
        </DocsShell>
      </PageContainer>
    );
  }

  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <PageContainer
      scrollable
      pageTitle='Docs Center'
      pageDescription='Canonical onboarding, product concepts, CLI reference, and admin rollout guidance.'
      infoContent={docsCenterInfoContent}
    >
      <DocsShell
        currentHref={`/dashboard${doc.href}`}
        navigation={navigation}
        title={doc.title}
        description={doc.description}
        aside={<WorkspaceDocLinks />}
        variant='dashboard'
      >
        <DocMdx source={doc.body} />
      </DocsShell>
    </PageContainer>
  );
}
