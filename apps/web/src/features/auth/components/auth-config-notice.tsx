import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthConfigNoticeProps {
  mode: 'sign-in' | 'sign-up';
}

export function AuthConfigNotice({ mode }: AuthConfigNoticeProps) {
  return (
    <div className='bg-background flex min-h-screen items-center justify-center px-4 py-10'>
      <Card className='w-full max-w-lg'>
        <CardHeader className='space-y-3'>
          <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl'>
            <Icons.lock className='h-5 w-5' />
          </div>
          <CardTitle>Authentication is not configured</CardTitle>
          <CardDescription>
            Diffmint can render public docs and install flows without Clerk keys, but {mode}{' '}
            requires a real Clerk configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-3'>
          <Button asChild>
            <Link href='/docs/getting-started/5-minute-quickstart'>Open the quickstart</Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/install'>Open install guide</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
