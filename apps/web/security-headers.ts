export interface SecurityHeader {
  key: string;
  value: string;
}

interface SecurityHeaderOptions {
  env?: NodeJS.ProcessEnv;
}

export function buildSecurityHeaders(options: SecurityHeaderOptions = {}): SecurityHeader[] {
  const env = options.env ?? process.env;
  const headers: SecurityHeader[] = [
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=()'
    },
    {
      key: 'Cross-Origin-Opener-Policy',
      value: 'same-origin-allow-popups'
    },
    {
      key: 'Origin-Agent-Cluster',
      value: '?1'
    }
  ];

  if (env.NODE_ENV === 'production' || env.DIFFMINT_ENABLE_HSTS === 'true') {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload'
    });
  }

  return headers;
}
