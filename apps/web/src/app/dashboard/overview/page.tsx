import PageContainer from '@/components/layout/page-container';
import { overviewInfoContent } from '@/config/infoconfig';
import { ControlPlaneOverviewPage } from '@/features/control-plane/components/overview-page';
import {
  getOverviewStats,
  listPolicies,
  listProviders,
  listReviewSessions
} from '@/features/control-plane/server/service';

export default async function OverviewPage() {
  return (
    <PageContainer
      pageTitle='Workspace Overview'
      pageDescription='CLI and VS Code stay primary. This dashboard manages policies, providers, Polar billing, history, audit, and docs.'
      infoContent={overviewInfoContent}
    >
      <ControlPlaneOverviewPage
        overviewStats={getOverviewStats()}
        policyBundles={listPolicies()}
        providerSummaries={listProviders()}
        reviewSessions={listReviewSessions()}
      />
    </PageContainer>
  );
}
