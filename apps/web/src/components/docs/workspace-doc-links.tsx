import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const dashboardLinks = [
  { title: 'Providers', href: '/dashboard/providers', icon: Icons.adjustments },
  { title: 'Policies', href: '/dashboard/policies', icon: Icons.checks },
  { title: 'Billing', href: '/dashboard/billing', icon: Icons.billing },
  { title: 'History', href: '/dashboard/history', icon: Icons.calendar },
  { title: 'Audit', href: '/dashboard/audit', icon: Icons.search }
];

export function WorkspaceDocLinks() {
  return (
    <Card className='rounded-[1.75rem] border-border/70 bg-background/80 shadow-sm'>
      <CardHeader>
        <CardTitle className='text-base'>Workspace shortcuts</CardTitle>
        <CardDescription>Jump from docs into the active control-plane surfaces.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        {dashboardLinks.map((link) => (
          <Button key={link.href} variant='outline' asChild className='w-full justify-start'>
            <Link href={link.href}>
              <link.icon className='mr-2 h-4 w-4' />
              {link.title}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
