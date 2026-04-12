import { jsonWithClientApiHeaders } from '@/features/control-plane/server/api-response';
import { listReleaseManifests } from '@/features/control-plane/server/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return jsonWithClientApiHeaders(
    {
      items: await listReleaseManifests()
    },
    { sensitive: false }
  );
}
