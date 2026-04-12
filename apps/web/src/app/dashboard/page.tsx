import { redirect } from 'next/navigation';
import { getServerAuthContext } from '@/lib/clerk/server-auth';

export default async function Dashboard() {
  const { userId } = await getServerAuthContext();

  if (!userId) {
    return redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/overview');
  }
}
