export const siteConfig = {
  name: 'Diffmint',
  shortName: 'Diffmint',
  domain: 'diffmint.deplio.app',
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://diffmint.deplio.app',
  description:
    'Diffmint is the local-first, policy-driven code review platform for engineering teams that live in the CLI and VS Code.',
  headline: 'Review local diffs with policy, history, provider control, and audit built in.',
  ogImageAlt:
    'Diffmint social card showing a terminal-first code review workflow and control plane overview.',
  keywords: [
    'Diffmint',
    'code review',
    'cli code review',
    'vs code extension',
    'developer tools',
    'engineering governance',
    'audit logs',
    'local-first review',
    'git diff review',
    'policy-driven review',
    'BYOK AI review',
    'qwen code'
  ]
} as const;

export function getSiteUrl(path = '/'): string {
  return new URL(path, siteConfig.url).toString();
}
