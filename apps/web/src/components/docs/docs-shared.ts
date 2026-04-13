import { docsSectionMeta, type DocsNavGroup, type VisibleDocSection } from '@diffmint/docs-content';
import { Icons } from '@/components/icons';

export type DocsVariant = 'public' | 'dashboard';

export interface DocsSectionVisual {
  accentClass: string;
  borderClass: string;
  icon: keyof typeof Icons;
  pillClass: string;
}

export const docsSectionVisuals: Record<VisibleDocSection, DocsSectionVisual> = {
  'Getting Started': {
    icon: 'sparkles',
    accentClass: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-500/20',
    pillClass: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
  },
  Concepts: {
    icon: 'dashboard',
    accentClass: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
    borderClass: 'border-sky-500/20',
    pillClass: 'bg-sky-500/12 text-sky-700 dark:text-sky-300'
  },
  'CLI Reference': {
    icon: 'code',
    accentClass: 'bg-amber-500/12 text-amber-800 dark:text-amber-300',
    borderClass: 'border-amber-500/20',
    pillClass: 'bg-amber-500/12 text-amber-800 dark:text-amber-300'
  },
  'VS Code Guide': {
    icon: 'panelLeft',
    accentClass: 'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-500/20',
    pillClass: 'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300'
  },
  'Admin Guide': {
    icon: 'workspace',
    accentClass: 'bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300',
    borderClass: 'border-fuchsia-500/20',
    pillClass: 'bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300'
  },
  'Security & Privacy': {
    icon: 'lock',
    accentClass: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-500/20',
    pillClass: 'bg-rose-500/12 text-rose-700 dark:text-rose-300'
  },
  Troubleshooting: {
    icon: 'help',
    accentClass: 'bg-orange-500/12 text-orange-800 dark:text-orange-300',
    borderClass: 'border-orange-500/20',
    pillClass: 'bg-orange-500/12 text-orange-800 dark:text-orange-300'
  },
  'Release Channels': {
    icon: 'trendingUp',
    accentClass: 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300',
    borderClass: 'border-cyan-500/20',
    pillClass: 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300'
  }
};

export function getDocsHref(href: string, variant: DocsVariant): string {
  return variant === 'dashboard' ? href.replace('/docs/', '/dashboard/docs/') : href;
}

export function getDocsSectionHref(
  group: DocsNavGroup,
  variant: DocsVariant,
  fallback = '/docs'
): string {
  return getDocsHref(group.items[0]?.href ?? fallback, variant);
}

export function getDocMap(navigation: DocsNavGroup[]): Map<string, DocsNavGroup['items'][number]> {
  return new Map(navigation.flatMap((group) => group.items.map((item) => [item.href, item])));
}

export function getSectionMeta(section: VisibleDocSection) {
  return docsSectionMeta[section];
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
