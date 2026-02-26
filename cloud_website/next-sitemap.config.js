/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://anywheredoor.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*', '/admin/*', '/_next/*', '/404', '/500'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/404', '/500'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
    ],
    additionalSitemaps: [
      'https://anywheredoor.com/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq for different page types
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    if (path.startsWith('/courses/') && !path.includes('?')) {
      // Individual course pages
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    if (path === '/courses') {
      // Course listing page
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    if (path.startsWith('/instructors/') && !path.includes('?')) {
      // Individual instructor pages
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      };
    }

    if (path === '/instructors') {
      // Instructors listing page
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      };
    }

    if (path === '/about' || path === '/contact') {
      // Static pages
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod: new Date().toISOString(),
      };
    }

    // Default values for other pages
    return {
      loc: path,
      changefreq: 'monthly',
      priority: 0.4,
      lastmod: new Date().toISOString(),
    };
  },
};
