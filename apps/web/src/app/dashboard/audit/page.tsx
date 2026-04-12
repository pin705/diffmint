import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { auditInfoContent } from '@/config/infoconfig';
import { AuditPageContent } from '@/features/control-plane/components/audit-page';
import { requireWorkspaceAccess } from '@/features/control-plane/server/access';
import { listAuditEvents } from '@/features/control-plane/server/service';

export default async function AuditPage() {
  const { orgId } = await requireWorkspaceAccess();

  const auditEvents = await listAuditEvents(orgId);

  return (
    <PageContainer
      pageTitle='Audit Trail'
      pageDescription='Track provider changes, policy publishes, and synced review events across the workspace.'
      infoContent={auditInfoContent}
      pageHeaderAction={
        <Button variant='outline' asChild>
          <Link href='/dashboard/audit/export?format=csv'>Export CSV</Link>
        </Button>
      }
    >
      <AuditPageContent auditEvents={auditEvents} />
    </PageContainer>
  );
}
