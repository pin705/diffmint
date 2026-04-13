import { getAllDocs } from '@diffmint/docs-content';
import { getSiteUrl } from '@/lib/site';
import type { MetadataRoute } from 'next';

const STATIC_ROUTES = [
  { path: '/', priority: 1 },
  { path: '/install', priority: 0.9 },
  { path: '/docs', priority: 0.85 },
  { path: '/privacy-policy', priority: 0.5 },
  { path: '/terms-of-service', priority: 0.5 }
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: getSiteUrl(route.path),
    lastModified: now,
    changeFrequency: route.path === '/' ? 'weekly' : 'monthly',
    priority: route.priority
  }));

  const docsEntries: MetadataRoute.Sitemap = getAllDocs()
    .filter((doc) => doc.section !== 'Changelog')
    .map((doc) => ({
      url: getSiteUrl(doc.href),
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: doc.section === 'Getting Started' ? 0.8 : 0.7
    }));

  return [...staticEntries, ...docsEntries];
}
