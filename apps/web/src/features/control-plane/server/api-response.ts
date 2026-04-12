import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

interface ApiJsonResponseOptions {
  status?: number;
  headers?: HeadersInit;
  requestId?: string;
}

interface ClientJsonResponseOptions extends ApiJsonResponseOptions {
  sensitive?: boolean;
}

function applyBaseHeaders(response: NextResponse, requestId: string): NextResponse {
  response.headers.set('x-diffmint-request-id', requestId);
  response.headers.set('x-content-type-options', 'nosniff');
  return response;
}

function applySensitiveHeaders(response: NextResponse): NextResponse {
  response.headers.set('cache-control', 'private, no-store, max-age=0');
  response.headers.set('pragma', 'no-cache');
  response.headers.set('expires', '0');
  response.headers.set('vary', 'Authorization, X-Diffmint-Device-Code');
  return response;
}

function applyPublicHeaders(response: NextResponse): NextResponse {
  response.headers.set('cache-control', 'public, max-age=300, stale-while-revalidate=300');
  return response;
}

export function createApiRequestId(): string {
  return `req_${randomUUID()}`;
}

export function jsonWithClientApiHeaders(
  payload: unknown,
  options: ClientJsonResponseOptions = {}
): NextResponse {
  const requestId = options.requestId ?? createApiRequestId();
  const response = NextResponse.json(payload, {
    status: options.status,
    headers: options.headers
  });

  applyBaseHeaders(response, requestId);

  if (options.sensitive === false) {
    applyPublicHeaders(response);
  } else {
    applySensitiveHeaders(response);
  }

  return response;
}

export function withClientApiHeaders(
  response: NextResponse,
  options: Pick<ClientJsonResponseOptions, 'requestId' | 'sensitive'> = {}
): NextResponse {
  const requestId = options.requestId ?? createApiRequestId();
  applyBaseHeaders(response, requestId);

  if (options.sensitive === false) {
    applyPublicHeaders(response);
  } else {
    applySensitiveHeaders(response);
  }

  return response;
}
