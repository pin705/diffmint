export type DashboardExportFormat = 'csv' | 'json';

interface DashboardExportResponseOptions {
  filename: string;
  format?: DashboardExportFormat;
}

function createRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}

function escapeCsvValue(value: unknown): string {
  const normalized =
    value === null || value === undefined
      ? ''
      : typeof value === 'string'
        ? value
        : JSON.stringify(value);

  return `"${normalized.replaceAll('"', '""')}"`;
}

export function buildCsv(headers: string[], rows: Array<Record<string, unknown>>): string {
  const csvRows = [
    headers.map((header) => escapeCsvValue(header)).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(','))
  ];

  return `\uFEFF${csvRows.join('\n')}\n`;
}

export function createDashboardExportResponse(
  body: string,
  options: DashboardExportResponseOptions
): Response {
  const format = options.format ?? 'csv';
  const extension = format === 'json' ? 'json' : 'csv';
  const contentType =
    format === 'json' ? 'application/json; charset=utf-8' : 'text/csv; charset=utf-8';
  const requestId = createRequestId();

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': contentType,
      'content-disposition': `attachment; filename="${options.filename}.${extension}"`,
      'cache-control': 'private, no-store, max-age=0',
      pragma: 'no-cache',
      expires: '0',
      'x-content-type-options': 'nosniff',
      'x-diffmint-request-id': requestId
    }
  });
}
