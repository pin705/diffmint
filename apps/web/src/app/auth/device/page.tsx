import type { Metadata } from 'next';
import { DeviceApprovalPage } from '@/features/auth/components/device-approval-page';
import { getServerAuthContext } from '@/lib/clerk/server-auth';
import { getDeviceAuthSession } from '@/features/control-plane/server/service';

export const metadata: Metadata = {
  title: 'Authentication | Device Approval',
  description: 'Approve a Diffmint CLI or VS Code device sign-in request.'
};

export default async function DeviceApprovalRoute({
  searchParams
}: {
  searchParams: Promise<{ device_code?: string; status?: string }>;
}) {
  const { device_code: deviceCode, status } = await searchParams;

  if (!deviceCode) {
    return <DeviceApprovalPage session={null} status={status} />;
  }

  const { userId, orgId, redirectToSignIn } = await getServerAuthContext();

  if (!userId) {
    return redirectToSignIn({
      returnBackUrl: `/auth/device?device_code=${encodeURIComponent(deviceCode)}`
    });
  }

  const session = await getDeviceAuthSession(deviceCode);

  return (
    <DeviceApprovalPage
      deviceCode={deviceCode}
      session={session}
      status={status}
      hasActiveWorkspace={Boolean(orgId)}
      workspaceSelectionHref={`/dashboard/workspaces?return_to=${encodeURIComponent(
        `/auth/device?device_code=${encodeURIComponent(deviceCode)}`
      )}`}
    />
  );
}
