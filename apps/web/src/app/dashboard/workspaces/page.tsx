'use client';

import PageContainer from '@/components/layout/page-container';
import { OrganizationList } from '@clerk/nextjs';
import { workspacesInfoContent } from '@/config/infoconfig';
import { useSearchParams } from 'next/navigation';

export default function WorkspacesPage() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('return_to');
  const nextUrl = returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard/workspaces/team';

  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
    >
      <OrganizationList
        appearance={{
          elements: {
            organizationListBox: 'space-y-2',
            organizationPreview: 'rounded-lg border p-4 hover:bg-accent',
            organizationPreviewMainIdentifier: 'text-lg font-semibold',
            organizationPreviewSecondaryIdentifier: 'text-sm text-muted-foreground'
          }
        }}
        afterSelectOrganizationUrl={nextUrl}
        afterCreateOrganizationUrl={nextUrl}
      />
    </PageContainer>
  );
}
