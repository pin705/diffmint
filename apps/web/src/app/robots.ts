import { getSiteUrl, siteConfig } from '@/lib/site';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/auth/']
      }
    ],
    sitemap: getSiteUrl('/sitemap.xml'),
    host: siteConfig.url
  };
}
