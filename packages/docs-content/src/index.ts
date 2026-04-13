import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

export const docSections = [
  'Getting Started',
  'Concepts',
  'CLI Reference',
  'VS Code Guide',
  'Admin Guide',
  'Security & Privacy',
  'Troubleshooting',
  'Changelog',
  'Release Channels'
] as const;

export const visibleDocSections = [
  'Getting Started',
  'Concepts',
  'CLI Reference',
  'VS Code Guide',
  'Admin Guide',
  'Security & Privacy',
  'Troubleshooting',
  'Release Channels'
] as const satisfies readonly (typeof docSections)[number][];

export type VisibleDocSection = (typeof visibleDocSections)[number];

export const docsSectionMeta: Record<
  VisibleDocSection,
  {
    description: string;
    audience: string;
  }
> = {
  'Getting Started': {
    description: 'Install the product, sign in, and reach the first successful review fast.',
    audience: 'Everyone'
  },
  Concepts: {
    description: 'Understand how the CLI, editor, control plane, and policies fit together.',
    audience: 'Developers and leads'
  },
  'CLI Reference': {
    description: 'Command-level guidance for review, explain, tests, history, and diagnostics.',
    audience: 'CLI users'
  },
  'VS Code Guide': {
    description: 'Connect the editor companion to the local CLI and review workflows.',
    audience: 'VS Code users'
  },
  'Admin Guide': {
    description: 'Roll out workspaces, provider strategy, billing, and team governance.',
    audience: 'Workspace admins'
  },
  'Security & Privacy': {
    description: 'See exactly what stays local, what can sync, and which controls admins own.',
    audience: 'Security and platform teams'
  },
  Troubleshooting: {
    description: 'Fix auth, setup, and diagnostics issues without losing momentum.',
    audience: 'Anyone getting unstuck'
  },
  'Release Channels': {
    description: 'Coordinate safe CLI and VS Code rollouts across stable, preview, and canary.',
    audience: 'Release owners'
  }
};

const surfaceValues = ['cli', 'vscode', 'web', 'admin'] as const;

export const docFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  section: z.enum(docSections),
  order: z.number().int().nonnegative(),
  surfaces: z.array(z.enum(surfaceValues)).min(1),
  version: z.string().default('current'),
  related: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('published'),
  updatedAt: z.string().optional()
});

export type DocFrontmatter = z.infer<typeof docFrontmatterSchema>;

export interface DocPage extends DocFrontmatter {
  slug: string;
  slugSegments: string[];
  href: string;
  filePath: string;
  body: string;
  internalLinks: string[];
}

export interface DocsNavGroup {
  section: (typeof docSections)[number];
  items: Pick<DocPage, 'title' | 'description' | 'href' | 'slug'>[];
}

const CONTENT_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content');
let cache: DocPage[] | null = null;

function walk(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(target));
      continue;
    }

    if (entry.isFile() && target.endsWith('.mdx')) {
      files.push(target);
    }
  }

  return files;
}

function extractInternalLinks(body: string): string[] {
  const links = body.matchAll(/\[[^\]]+\]\((\/docs\/[^)]+)\)/g);
  return [...new Set([...links].map((match) => match[1]))];
}

function stripLeadingTitleHeading(body: string, title: string): string {
  const trimmed = body.trim();
  const lines = trimmed.split('\n');

  if (lines[0]?.trim() === `# ${title}`) {
    return lines.slice(1).join('\n').trim();
  }

  return trimmed;
}

function parseDoc(filePath: string): DocPage {
  const raw = readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const frontmatter = docFrontmatterSchema.parse(parsed.data);
  const relativePath = path.relative(CONTENT_ROOT, filePath);
  const slug = relativePath.replace(/\.mdx$/, '').replaceAll(path.sep, '/');
  const slugSegments = slug.split('/');

  return {
    ...frontmatter,
    slug,
    slugSegments,
    href: `/docs/${slug}`,
    filePath,
    body: stripLeadingTitleHeading(parsed.content, frontmatter.title),
    internalLinks: extractInternalLinks(parsed.content)
  };
}

export function getAllDocs(): DocPage[] {
  if (!cache) {
    cache = walk(CONTENT_ROOT)
      .map(parseDoc)
      .sort((left, right) => {
        if (left.section !== right.section) {
          return docSections.indexOf(left.section) - docSections.indexOf(right.section);
        }

        if (left.order !== right.order) {
          return left.order - right.order;
        }

        return left.title.localeCompare(right.title);
      });
  }

  return cache;
}

export function clearDocsCache(): void {
  cache = null;
}

export function getDocBySlug(slugSegments?: string[]): DocPage | undefined {
  const slug =
    !slugSegments || slugSegments.length === 0
      ? 'getting-started/5-minute-quickstart'
      : slugSegments.join('/');
  return getAllDocs().find((doc) => doc.slug === slug);
}

export function getDocsNavigation(): DocsNavGroup[] {
  const docs = getAllDocs();

  return visibleDocSections
    .map((section) => ({
      section,
      items: docs
        .filter((doc) => doc.section === section)
        .map((doc) => ({
          title: doc.title,
          description: doc.description,
          href: doc.href,
          slug: doc.slug
        }))
    }))
    .filter((group) => group.items.length > 0);
}

export function getRelatedDocs(doc: DocPage): DocPage[] {
  const allDocs = getAllDocs();
  return doc.related
    .map((href) => allDocs.find((item) => item.href === href))
    .filter((item): item is DocPage => Boolean(item));
}
