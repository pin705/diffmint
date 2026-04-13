import { AuthShell } from './auth-shell';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthConfigNoticeProps {
  mode: 'sign-in' | 'sign-up';
}

export function AuthConfigNotice({ mode }: AuthConfigNoticeProps) {
  return (
    <AuthShell
      title={mode === 'sign-in' ? 'Sign in unavailable' : 'Sign up unavailable'}
      description='Authentication needs a real Clerk configuration before this screen can be used.'
      alternatePrompt='Need setup steps?'
      alternateLabel='Open install guide'
      alternateHref='/install'
    >
      <Card className='w-full max-w-lg rounded-[1.5rem] border-border/70 bg-background/82 shadow-sm'>
        <CardHeader className='space-y-3'>
          <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl'>
            <Icons.lock className='h-5 w-5' />
          </div>
          <CardTitle>Authentication is not configured</CardTitle>
          <CardDescription>
            Public docs and install flows still work, but this auth route needs Clerk keys.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-3'>
          <Button asChild>
            <Link href='/docs/getting-started/5-minute-quickstart'>Quickstart</Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/install'>Install</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
