import { MetadataRoute } from 'next';

/**
 * Generate robots.txt dynamically
 * This ensures proper crawling rules for the site
 * 
 * Requirements: 13.1 - Allow crawling of published courses, disallow admin panel
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anywheredoor.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/auth/signout',
          '/dashboard/settings',
          '/profile/edit',
          '/*?*', // Disallow URLs with query parameters (except for specific cases)
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/courses/',
          '/courses/*',
          '/instructors/',
          '/instructors/*',
          '/about',
          '/contact',
          '/faq',
          '/resources/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/auth/',
          '/dashboard/',
          '/profile/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/courses/',
          '/courses/*',
          '/instructors/',
          '/instructors/*',
          '/about',
          '/contact',
          '/faq',
          '/resources/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/auth/',
          '/dashboard/',
          '/profile/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
