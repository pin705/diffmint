import { describe, expect, it } from 'vitest';
import manifest from '../../apps/web/src/app/manifest.ts';
import robots from '../../apps/web/src/app/robots.ts';
import sitemap from '../../apps/web/src/app/sitemap.ts';
import { metadata } from '../../apps/web/src/app/layout.tsx';
import { siteConfig } from '../../apps/web/src/lib/site.ts';

describe('site metadata', () => {
  it('publishes the Diffmint brand metadata defaults', () => {
    expect(metadata.applicationName).toBe(siteConfig.name);
    expect(metadata.description).toBe(siteConfig.description);
    expect(metadata.metadataBase?.origin).toBe(new URL(siteConfig.url).origin);
    expect(metadata.alternates?.canonical).toBe('/');
    expect(metadata.manifest).toBe('/manifest.webmanifest');
    expect(metadata.keywords).toContain('local-first review');
    expect(metadata.openGraph?.siteName).toBe(siteConfig.name);
    expect(metadata.twitter?.card).toBe('summary_large_image');

    const openGraphImage = Array.isArray(metadata.openGraph?.images)
      ? metadata.openGraph?.images[0]
      : undefined;
    expect(openGraphImage).toMatchObject({ url: '/opengraph-image' });
    expect(metadata.twitter?.images).toEqual(['/twitter-image']);
  });

  it('generates robots, sitemap, and manifest metadata for public routes', () => {
    const robotsMetadata = robots();
    const sitemapMetadata = sitemap();
    const manifestMetadata = manifest();

    expect(robotsMetadata.host).toBe(siteConfig.url);
    expect(robotsMetadata.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
    expect(robotsMetadata.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: '*',
          disallow: expect.arrayContaining(['/dashboard/', '/api/', '/auth/'])
        })
      ])
    );

    expect(manifestMetadata.name).toBe(siteConfig.name);
    expect(manifestMetadata.short_name).toBe(siteConfig.shortName);
    expect(manifestMetadata.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: '/icon' }),
        expect.objectContaining({ src: '/apple-icon' })
      ])
    );

    expect(sitemapMetadata).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: `${siteConfig.url}/` }),
        expect.objectContaining({ url: `${siteConfig.url}/install` }),
        expect.objectContaining({
          url: `${siteConfig.url}/docs/getting-started/5-minute-quickstart`
        })
      ])
    );
  });
});
