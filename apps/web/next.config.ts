import path from 'node:path';
import type { NextConfig } from 'next';
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

const nextConfig = configWithPlugins;
export default nextConfig;
