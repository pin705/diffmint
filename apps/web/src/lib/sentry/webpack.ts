import path from 'node:path';
import { isSentryRuntimeEnabled } from './flags';

interface IgnoreWarningRule {
  module: RegExp;
  message: RegExp;
}

export function getSentryWebpackAliases(
  rootDir: string,
  env: NodeJS.ProcessEnv = process.env
): Record<string, string> {
  if (isSentryRuntimeEnabled(env)) {
    return {};
  }

  return {
    '@sentry/nextjs': path.resolve(rootDir, 'src/lib/sentry/noop.ts')
  };
}

export function getSentryWebpackIgnoreWarnings(): IgnoreWarningRule[] {
  return [
    {
      module: /@opentelemetry\/instrumentation/,
      message: /Critical dependency: the request of a dependency is an expression/
    },
    {
      module: /require-in-the-middle/,
      message:
        /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/
    }
  ];
}
