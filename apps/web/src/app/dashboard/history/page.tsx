import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { historyInfoContent } from '@/config/infoconfig';
import { HistoryPageContent } from '@/features/control-plane/components/history-page';
import { requireWorkspaceAccess } from '@/features/control-plane/server/access';
import { listReviewSessions } from '@/features/control-plane/server/service';

export default async function HistoryPage() {
  const { orgId } = await requireWorkspaceAccess();

  const reviewSessions = await listReviewSessions(orgId);

  return (
    <PageContainer
      pageTitle='Review History'
      pageDescription='Search synced review sessions by trace ID, provider, source, and policy version.'
      infoContent={historyInfoContent}
      pageHeaderAction={
        <Button variant='outline' asChild>
          <Link href='/dashboard/history/export?format=csv'>Export CSV</Link>
        </Button>
      }
    >
      <HistoryPageContent reviewSessions={reviewSessions} />
    </PageContainer>
  );
}
