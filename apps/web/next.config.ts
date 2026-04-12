import path from 'node:path';
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import { isSentryBuildEnabled } from './src/lib/sentry/flags';
import { getSentryWebpackAliases, getSentryWebpackIgnoreWarnings } from './src/lib/sentry/webpack';
import { buildSecurityHeaders } from './security-headers';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: buildSecurityHeaders()
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'clerk.com',
        port: ''
      }
    ]
  },
  transpilePackages: [
    'geist',
    '@diffmint/contracts',
    '@diffmint/docs-content',
    '@diffmint/policy-engine',
    '@diffmint/review-core'
  ],
  webpack(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      ...getSentryWebpackAliases(path.resolve(__dirname))
    };
    config.ignoreWarnings = [
      ...(Array.isArray(config.ignoreWarnings) ? config.ignoreWarnings : []),
      ...getSentryWebpackIgnoreWarnings()
    ];

    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};

let configWithPlugins = baseConfig;

// Only enable the Sentry build plugin when the optional integration is fully configured.
if (isSentryBuildEnabled()) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    org: process.env.NEXT_PUBLIC_SENTRY_ORG,
    project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    tunnelRoute: '/monitoring',

    // Disable Sentry telemetry
    telemetry: false,

    // Sentry v10: moved under webpack namespace
    webpack: {
      reactComponentAnnotation: {
        enabled: true
      },
      treeshake: {
        removeDebugLogging: true
      }
    },

    sourcemaps: {
      disable: false
    }
  });
}

const nextConfig = configWithPlugins;
export default nextConfig;
