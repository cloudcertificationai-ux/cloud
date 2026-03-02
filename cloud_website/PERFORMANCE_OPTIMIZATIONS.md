# Performance Optimizations

This document outlines the performance optimizations implemented for the AnyWhereDoor platform.

## Overview

The platform implements comprehensive performance optimizations across database queries, caching, media loading, and code splitting to ensure fast page loads and smooth user experience.

## 1. Database Query Optimizations (Task 22.1)

### Indexes
The Prisma schema includes optimized indexes for frequently queried fields:

```prisma
model Course {
  @@index([slug])      // For slug-based lookups
  @@index([published]) // For filtering published courses
  @@index([featured])  // For featured course queries
  @@index([instructorId])
  @@index([categoryId])
}
```

### Select Optimization
Database queries use `select` instead of `include` to fetch only needed fields:

**Before:**
```typescript
prisma.course.findMany({
  include: {
    instructor: true,
    category: true,
  }
})
```

**After:**
```typescript
prisma.course.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    // ... only needed fields
    instructor: {
      select: {
        id: true,
        name: true,
        avatar: true,
      }
    }
  }
})
```

### Pagination
All list endpoints implement pagination to limit data transfer:

```typescript
const page = parseInt(searchParams.get('page') || '1', 10);
const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
const skip = (page - 1) * pageSize;

prisma.course.findMany({
  skip,
  take: pageSize,
})
```

## 2. Caching Strategies (Task 22.2)

### In-Memory Cache
Server-side in-memory cache for frequently accessed data:

```typescript
// Cache configuration
const CACHE_CONFIGS = {
  courses: {
    maxAge: 1800, // 30 minutes
    staleWhileRevalidate: 86400, // 24 hours
  },
  featured: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400,
  },
}
```

### ISR (Incremental Static Regeneration)
Course pages use ISR for optimal performance:

```typescript
// Course detail page
export const revalidate = 1800; // Revalidate every 30 minutes

// Course listing page
export const revalidate = 900; // Revalidate every 15 minutes
```

### Static Generation
Popular courses are pre-generated at build time:

```typescript
export async function generateStaticParams() {
  const { courses } = await dbDataService.getCourses({
    published: true,
    featured: true,
    pageSize: 20, // Pre-generate top 20 courses
  });
  
  return courses.map((course) => ({
    slug: course.slug,
  }));
}
```

### API Response Caching
API routes include cache headers:

```typescript
return withCacheHeaders(response, {
  maxAge: 3600,
  sMaxAge: 3600,
  staleWhileRevalidate: 86400,
  tags: ['courses', 'featured'],
});
```

### Cache Invalidation
Admin API for cache invalidation:

```typescript
POST /api/cache/invalidate
{
  "tags": ["courses", "featured"]
}
```

## 3. Media Loading Optimizations (Task 22.3)

### Next.js Image Component
All images use the optimized Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src={thumbnailUrl}
  alt={title}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
/>
```

### Image Formats
Automatic WebP and AVIF conversion:

```typescript
// next.config.ts
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### CDN Integration
Remote patterns configured for CDN images:

```typescript
remotePatterns: [
  {
    protocol: 'https',
    hostname: '**.amazonaws.com',
  },
  {
    protocol: 'https',
    hostname: '**.cloudfront.net',
  },
  {
    protocol: 'https',
    hostname: 'res.cloudinary.com',
  },
]
```

### Lazy Video Loading
Custom LazyVideo component for video lessons:

```typescript
import LazyVideo from '@/components/LazyVideo';

<LazyVideo
  src={videoUrl}
  poster={thumbnailUrl}
  lazyLoad={true}
  streamingOptimized={true}
/>
```

### OptimizedImage Component
Enhanced image component with:
- Intersection Observer-based lazy loading
- Progressive image loading with blur placeholder
- Error handling with fallback images
- Performance monitoring
- Preloading on hover

## 4. Code Splitting (Task 22.4)

### Dynamic Imports
Heavy components are lazy-loaded:

```typescript
// Frontend
import { LazyLessonPlayer } from '@/lib/lazy-components';

// Admin Panel
import { LazyLessonEditor } from '@/lib/lazy-components';
```

### Bundle Splitting
Webpack configuration optimizes bundle splitting:

```typescript
splitChunks: {
  cacheGroups: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
      priority: 10,
    },
    react: {
      test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
      name: 'react',
      priority: 20,
    },
    ui: {
      test: /[\\/]node_modules[\\/](@headlessui|@heroicons)[\\/]/,
      name: 'ui',
      priority: 15,
    },
  },
}
```

### Component Preloading
Preload components on hover for better UX:

```typescript
import { preloadComponent } from '@/lib/lazy-components';

<button
  onMouseEnter={() => preloadComponent(() => import('@/components/LessonPlayer'))}
>
  Start Lesson
</button>
```

## Performance Metrics

### Target Metrics
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Monitoring
Performance is monitored using:
- Vercel Analytics
- Vercel Speed Insights
- Web Vitals tracking
- Custom performance monitoring hooks

## Best Practices

### Images
1. Always use Next.js Image component
2. Specify width and height to prevent layout shift
3. Use appropriate sizes prop for responsive images
4. Enable lazy loading for below-the-fold images
5. Use blur placeholders for better perceived performance

### Videos
1. Use LazyVideo component for lesson videos
2. Enable streaming optimization
3. Provide poster images
4. Preload metadata only, not full video
5. Implement buffering indicators

### API Calls
1. Use pagination for list endpoints
2. Implement caching with appropriate TTL
3. Use select to fetch only needed fields
4. Batch related queries with Promise.all
5. Invalidate cache when data changes

### Code Splitting
1. Lazy load heavy components (editors, players, charts)
2. Preload components on hover or route change
3. Use dynamic imports for route-specific code
4. Optimize bundle splitting configuration
5. Monitor bundle sizes with webpack-bundle-analyzer

## Maintenance

### Regular Tasks
1. Monitor bundle sizes and optimize as needed
2. Review and update cache TTLs based on usage patterns
3. Analyze slow queries and add indexes
4. Test performance on various devices and networks
5. Update image optimization settings as needed

### Tools
- `npm run analyze` - Analyze bundle sizes
- `npm run test:e2e` - Run performance tests
- Lighthouse CI - Automated performance audits
- Prisma Studio - Database query analysis

## References

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Web Vitals](https://web.dev/vitals/)
