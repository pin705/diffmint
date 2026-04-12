import { NextResponse } from 'next/server';
import { getReadinessHealthReport } from '@/lib/runtime/health';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const report = await getReadinessHealthReport();

  return NextResponse.json(report, {
    status: report.status === 'fail' ? 503 : 200,
    headers: {
      'cache-control': 'no-store'
    }
  });
}
