import { describe, expect, it } from 'vitest';
import { buildSecurityHeaders } from '../../apps/web/security-headers.ts';

describe('security headers', () => {
  it('returns a safe baseline header set for all routes', () => {
    const headers = buildSecurityHeaders({
      env: {
        NODE_ENV: 'development'
      } as NodeJS.ProcessEnv
    });

    expect(headers).toEqual(
      expect.arrayContaining([
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
      ])
    );
    expect(headers.some((header) => header.key === 'Strict-Transport-Security')).toBe(false);
  });

  it('adds HSTS in production-like environments', () => {
    const headers = buildSecurityHeaders({
      env: {
        NODE_ENV: 'production'
      } as NodeJS.ProcessEnv
    });

    expect(headers).toEqual(
      expect.arrayContaining([
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        }
      ])
    );
  });
});
