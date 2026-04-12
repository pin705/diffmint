import { redirect } from 'next/navigation';
import { getServerAuthContext } from '@/lib/clerk/server-auth';
import { getDashboardRedirectTarget } from './access-rules';

export interface DashboardAccessContext {
  userId: string;
  orgId: string | null;
}

interface DashboardAccessOptions {
  requireWorkspace?: boolean;
  signInUrl?: string;
  workspaceSelectionUrl?: string;
}

export async function requireDashboardAccess(
  options: DashboardAccessOptions = {}
): Promise<DashboardAccessContext> {
  const { userId, orgId } = await getServerAuthContext();
  const normalizedUserId = userId ?? null;
  const normalizedOrgId = orgId ?? null;
  const redirectTarget = getDashboardRedirectTarget({
    userId: normalizedUserId,
    orgId: normalizedOrgId,
    requireWorkspace: options.requireWorkspace ?? false,
    signInUrl: options.signInUrl ?? '/auth/sign-in',
    workspaceSelectionUrl: options.workspaceSelectionUrl ?? '/dashboard/workspaces'
  });

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  return {
    userId: normalizedUserId as string,
    orgId: normalizedOrgId
  };
}

export async function requireWorkspaceAccess(): Promise<
  DashboardAccessContext & { orgId: string }
> {
  const access = await requireDashboardAccess({ requireWorkspace: true });

  return {
    ...access,
    orgId: access.orgId as string
  };
}
