import { NextResponse } from 'next/server';
import { getLiveHealthReport } from '@/lib/runtime/health';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getLiveHealthReport(), {
    status: 200,
    headers: {
      'cache-control': 'no-store'
    }
  });
}
