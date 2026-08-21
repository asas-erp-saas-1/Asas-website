import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://asas-dz.vercel.app').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/services`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/for-developers`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/insights`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    const projects = await db.project.findMany({
      where: { published: true, archived: false },
      orderBy: { order: 'asc' },
      select: {
        slug: true,
        updatedAt: true,
        robotsIndex: true,
        apartments: {
          where: { published: true, archived: false, robotsIndex: true },
          select: { slug: true, updatedAt: true },
        },
      },
    });

    const projectRoutes: MetadataRoute.Sitemap = [];
    for (const project of projects) {
      if (project.robotsIndex) {
        projectRoutes.push({
          url: `${siteUrl}/projects/${encodeURIComponent(project.slug)}`,
          lastModified: project.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.85,
        });
      }
      for (const apartment of project.apartments) {
        projectRoutes.push({
          url: `${siteUrl}/projects/${encodeURIComponent(project.slug)}/apartments/${encodeURIComponent(apartment.slug)}`,
          lastModified: apartment.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    return [...staticRoutes, ...projectRoutes];
  } catch (error) {
    console.error('[sitemap] Dynamic catalog unavailable:', error);
    return staticRoutes;
  }
}
