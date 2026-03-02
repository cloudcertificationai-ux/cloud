# Quick Fix Guide

## 🚨 Main Issues Found

1. **Service Worker** causing fetch errors in development ✅ FIXED
2. **Database** has courses without instructors (NULL instructorId)
3. **Memory allocation** error from Next.js/Turbopack
4. **PostgreSQL SSL** warning (non-critical)

## 🔧 Quick Fix (2 minutes)

### Option 1: Run the automated script
```bash
cd anywheredoor
./fix-errors.sh
```

### Option 2: Manual fix
```bash
cd anywheredoor

# Clear cache
rm -rf .next node_modules/.cache

# Setup database
npx prisma db push
npx prisma db seed

# Start server
npm run dev
```

### Option 3: Just restart (if you only want the service worker fix)
```bash
cd anywheredoor
rm -rf .next
npm run dev
```

## 🌐 Browser Cleanup (Important!)

After running the fix, clear your browser:

**Chrome/Edge:**
1. Press F12 (DevTools)
2. Application tab → Service Workers → Unregister
3. Application tab → Clear storage → Clear site data
4. Refresh page (Cmd+Shift+R or Ctrl+Shift+R)

**Firefox:**
1. Press F12 (DevTools)
2. Storage tab → Service Workers → Unregister
3. Clear all storage
4. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

## ✅ What Was Fixed

### Service Worker (Main Fix)
- Modified `src/lib/service-worker.ts`
- Service worker now disabled in development
- No more fetch errors or HMR issues

### Database
- Seed script available to populate instructors
- Run `npx prisma db seed` to fix NULL instructors

## 📊 Expected Results

After the fix, you should see:
- ✅ No "Failed to fetch" errors
- ✅ No service worker errors in console
- ✅ "Service Worker disabled in development mode" message
- ✅ HMR (Hot Module Replacement) working
- ✅ Images loading correctly
- ✅ No NULL instructorId in Prisma logs (after seeding)

## 🐛 If Issues Persist

1. **Check Node version:** `node -v` (should be 18+ or 20+)
2. **Check port 3000:** `lsof -i :3000` (kill if in use)
3. **Check database:** `npx prisma studio` (verify data exists)
4. **Try without Turbopack:** `next dev --no-turbo`
5. **Check logs:** Look for specific error messages

## 📝 More Details

See `ERROR_FIXES.md` for comprehensive documentation.

## 🚀 Production Notes

- Service worker will work in production (only disabled in dev)
- Ensure all courses have instructors before deploying
- Update DATABASE_URL with proper SSL settings
