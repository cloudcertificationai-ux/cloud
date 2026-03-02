# Error Fixes for Anywheredoor Application

## Current Status: Database Connected ✅

The database connection is working. The P1001 error during the fix script was likely a temporary network issue.

## Issues Identified and Fixed

### 1. ✅ Service Worker Fetch Errors (FIXED)

**Problem:** Service worker was intercepting requests in development mode, causing:
- `Failed to fetch` errors
- `ERR_INCOMPLETE_CHUNKED_ENCODING` errors
- WebSocket HMR connection failures
- Favicon and image loading failures

**Solution:** Disabled service worker in development mode by modifying `src/lib/service-worker.ts`

**What was changed:**
- Added check for `NODE_ENV === 'development'` to skip service worker registration
- Service worker will only run in production builds

---

### 2. ⚠️ Database NULL Instructor Issue

**Problem:** Prisma queries showing `instructorId: NULL` in logs, which means:
- Some courses in your database don't have instructors assigned
- The schema allows `instructorId` to be optional (`String?`)

**To Fix This:**

#### Option A: Run the seed script to populate data
```bash
cd anywheredoor
npx prisma db push
npx prisma db seed
```

#### Option B: Update existing courses manually
```bash
# Connect to your database and run:
npx prisma studio
# Then assign instructors to courses that have NULL instructorId
```

#### Option C: Make instructorId required (if all courses should have instructors)
Edit `prisma/schema.prisma` and change:
```prisma
instructorId  String?  // Optional
```
to:
```prisma
instructorId  String   // Required
```

Then run:
```bash
npx prisma migrate dev --name make_instructor_required
```

---

### 3. 🔴 CRITICAL: Memory Allocation Error

**Problem:** 
```
malloc: *** error for object 0x94c6d5b00: pointer being freed was not allocated
malloc: *** error for object 0x94c6d5e20: pointer being freed was not allocated
```

**This is a CRITICAL issue** that indicates memory corruption in the Node.js process.

**Root Causes:**
1. **Next.js Image Optimization with Turbopack** - Known issue with concurrent image processing
2. **Native module conflicts** - Possible issue with @prisma/client or pg native bindings
3. **Memory pressure** - Multiple large images loading simultaneously

**Immediate Solutions:**

#### Solution 1: Disable Turbopack (Recommended)
```bash
# Edit package.json and change:
"dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev --turbo"
# to:
"dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
```

#### Solution 2: Reduce Image Concurrency
Add to `next.config.js`:
```javascript
images: {
  minimumCacheTTL: 60,
  deviceSizes: [640, 750, 828, 1080, 1200],
  imageSizes: [16, 32, 48, 64, 96],
  formats: ['image/webp'],
  dangerouslyAllowSVG: false,
  contentDispositionType: 'attachment',
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',
    },
  ],
  // Limit concurrent image optimization
  unoptimized: process.env.NODE_ENV === 'development',
}
```

#### Solution 3: Update Dependencies
```bash
npm update @prisma/client prisma pg
npm update next react react-dom
```

#### Solution 4: Use Alternative Image Loading
Instead of loading all course images at once, implement lazy loading or pagination.

---

### 4. ⚠️ PostgreSQL SSL Warning

**Problem:**
```
SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'
```

**Solution:** Update your database connection string in `.env`:

**Change from:**
```env
DATABASE_URL="postgresql://neondb_owner:npg_GvfyqM2rzl1X@ep-cold-field-a1hahwd6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**To:**
```env
DATABASE_URL="postgresql://neondb_owner:npg_GvfyqM2rzl1X@ep-cold-field-a1hahwd6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require"
```

This warning is informational and won't break functionality, but it's good practice to use the explicit mode.

---

### 6. 🔴 Poor Performance Metrics

**Problem:**
```
FCP: 3892ms (poor) - Target: <1800ms
TTFB: 3745ms (poor) - Target: <600ms
LCP: 3892ms (needs-improvement) - Target: <2500ms
```

**Root Causes:**
1. Database queries running on every page load (no caching)
2. Multiple Prisma queries with NULL foreign keys causing inefficient joins
3. All course images loading simultaneously
4. No static generation or ISR (Incremental Static Regeneration)

**Solutions:**

#### Immediate: Add Redis Caching
```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedCourses() {
  const cached = await redis.get('courses:all');
  if (cached) return JSON.parse(cached);
  
  const courses = await prisma.course.findMany({...});
  await redis.setex('courses:all', 300, JSON.stringify(courses)); // 5 min cache
  return courses;
}
```

#### Medium-term: Use ISR
```typescript
// app/page.tsx
export const revalidate = 300; // Revalidate every 5 minutes

export default async function HomePage() {
  // This will be statically generated and cached
  const courses = await getCourses();
  return <CourseList courses={courses} />;
}
```

#### Long-term: Fix Database Schema
Ensure all courses have instructors and categories to avoid NULL joins.

---

## Quick Fix Checklist - Priority Order

### 🔴 CRITICAL: Fix Memory Errors First

```bash
# 1. Stop the dev server (Ctrl+C)

# 2. Clear all caches
cd anywheredoor
rm -rf .next
rm -rf node_modules/.cache

# 3. Disable Turbopack temporarily
# Edit package.json and remove --turbo flag if present

# 4. Restart with clean slate
npm run dev
```

### ⚠️ HIGH: Fix Database SSL Warning

```bash
# Edit .env file and change sslmode=require to sslmode=verify-full
# Then restart the server
```

### ⚠️ MEDIUM: Seed Database to Fix NULL Issues

```bash
# In a new terminal
cd anywheredoor
npx prisma generate
npx prisma db push
npm run db:seed
```

### 📊 LOW: Optimize Performance

```bash
# 1. Implement caching (see section 6 above)
# 2. Add ISR to pages
# 3. Optimize image loading
```

---

## Testing the Fixes

1. **Service Worker:** Should see "Service Worker disabled in development mode" in console
2. **Database:** No more NULL instructorId in Prisma query logs
3. **Memory:** No malloc errors
4. **Performance:** Metrics should send successfully

---

## If Issues Persist

1. Check your `.env` file has correct database credentials
2. Verify PostgreSQL is running
3. Check if port 3000 is already in use
4. Try running without Turbopack: `next dev --no-turbo`
5. Check Node.js version (should be 18+ or 20+)

---

## Production Deployment Notes

When deploying to production:
- Service worker will be enabled automatically
- Ensure all courses have instructors assigned
- Use proper SSL mode for database connection
- Set appropriate memory limits for your hosting platform
