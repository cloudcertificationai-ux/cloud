# Troubleshooting Guide

This comprehensive guide covers common issues and their solutions for both students and administrators.

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Enrollment Issues](#enrollment-issues)
3. [Video Playback Issues](#video-playback-issues)
4. [Progress Tracking Issues](#progress-tracking-issues)
5. [Payment Issues](#payment-issues)
6. [Profile Issues](#profile-issues)
7. [Performance Issues](#performance-issues)
8. [Admin Panel Issues](#admin-panel-issues)
9. [API Integration Issues](#api-integration-issues)
10. [Database Issues](#database-issues)

---

## Authentication Issues

### Issue: Cannot Log In

**Symptoms:**
- Login button doesn't respond
- Redirected back to login page after authentication
- "Authentication failed" error message

**Possible Causes:**
1. Browser blocking third-party cookies
2. Pop-up blocker preventing OAuth redirect
3. Incorrect OAuth configuration
4. Session cookie issues
5. Browser cache corruption

**Solutions:**

**For Students:**
1. **Enable Third-Party Cookies:**
   - Chrome: Settings > Privacy > Cookies > Allow all cookies
   - Firefox: Settings > Privacy > Accept cookies from sites
   - Safari: Preferences > Privacy > Uncheck "Block all cookies"

2. **Disable Pop-up Blocker:**
   - Check browser settings
   - Add the site to allowed list

3. **Clear Browser Cache:**
   ```
   Chrome: Ctrl+Shift+Delete
   Firefox: Ctrl+Shift+Delete
   Safari: Cmd+Option+E
   ```

4. **Try Incognito/Private Mode:**
   - This helps identify if extensions are causing issues

5. **Try Different Browser:**
   - Test with Chrome, Firefox, or Safari

**For Administrators:**
1. **Verify OAuth Configuration:**
   - Check Auth0 dashboard settings
   - Verify callback URLs are correct
   - Ensure OAuth credentials are valid

2. **Check Environment Variables:**
   ```bash
   # Verify these are set correctly
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_ISSUER=https://your-domain.auth0.com
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=your-secret-key
   ```

3. **Check Database Connection:**
   ```bash
   # Test database connection
   npx prisma db pull
   ```

4. **Review Logs:**
   ```bash
   # Check application logs for errors
   tail -f logs/application.log
   ```

---

### Issue: Session Expires Too Quickly

**Symptoms:**
- Logged out after a few minutes
- "Session expired" message appears frequently

**Possible Causes:**
1. Session maxAge set too low
2. Inactivity timeout too aggressive
3. Clock skew between client and server

**Solutions:**

**For Administrators:**
1. **Check Session Configuration:**
   ```typescript
   // In src/lib/auth.ts
   session: {
     maxAge: 24 * 60 * 60, // 24 hours
   }
   ```

2. **Adjust Inactivity Timeout:**
   ```typescript
   // In src/middleware.ts
   const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000 // 2 hours
   ```

3. **Verify Server Time:**
   ```bash
   # Check server time is correct
   date
   # Sync with NTP if needed
   sudo ntpdate -s time.nist.gov
   ```

---

### Issue: "Access Denied" for Admin Panel

**Symptoms:**
- Cannot access admin panel
- Redirected to error page
- "Insufficient permissions" message

**Possible Causes:**
1. User doesn't have admin role
2. Role not synced from database
3. Middleware not checking role correctly

**Solutions:**

**For Administrators:**
1. **Verify User Role in Database:**
   ```sql
   SELECT id, email, role FROM "User" WHERE email = 'admin@example.com';
   ```

2. **Update User Role:**
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
   ```

3. **Check Middleware Configuration:**
   ```typescript
   // In src/middleware.ts
   if (session?.user?.role !== 'ADMIN') {
     return NextResponse.redirect(new URL('/auth/error', request.url))
   }
   ```

4. **Clear Session and Re-login:**
   - Log out completely
   - Clear browser cookies
   - Log back in

---

## Enrollment Issues

### Issue: Cannot Enroll in Course

**Symptoms:**
- "Enroll" button doesn't work
- Error message when clicking enroll
- Redirected but enrollment not created

**Possible Causes:**
1. Not authenticated
2. Already enrolled
3. Course not found
4. Database connection issue
5. API error

**Solutions:**

**For Students:**
1. **Verify You're Logged In:**
   - Check if profile picture appears in header
   - Try logging out and back in

2. **Check Dashboard:**
   - You may already be enrolled
   - Check "My Courses" section

3. **Try Different Browser:**
   - Clear cache and try again

4. **Contact Support:**
   - Provide course name and error message

**For Administrators:**
1. **Check Database:**
   ```sql
   -- Check if enrollment exists
   SELECT * FROM "Enrollment" 
   WHERE "userId" = 'user-id' AND "courseId" = 'course-id';
   ```

2. **Check Course Status:**
   ```sql
   -- Verify course is published
   SELECT id, title, published FROM "Course" WHERE id = 'course-id';
   ```

3. **Review API Logs:**
   ```bash
   # Check enrollment API logs
   grep "POST /api/enrollments" logs/api.log
   ```

4. **Test Enrollment Manually:**
   ```bash
   curl -X POST https://yourdomain.com/api/enrollments \
     -H "Content-Type: application/json" \
     -H "Cookie: next-auth.session-token=..." \
     -d '{"courseId":"course-id","courseSlug":"course-slug"}'
   ```

---

### Issue: Enrollment Not Completing After Payment

**Symptoms:**
- Payment successful but no course access
- Enrollment not in dashboard
- "Not enrolled" message on course page

**Possible Causes:**
1. Webhook not received from Stripe
2. Webhook signature verification failed
3. Database transaction failed
4. Purchase record not updated

**Solutions:**

**For Administrators:**
1. **Check Stripe Webhook Logs:**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Check recent webhook deliveries
   - Look for failed deliveries

2. **Verify Webhook Endpoint:**
   ```bash
   # Test webhook endpoint
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Check Purchase Status:**
   ```sql
   SELECT * FROM "Purchase" 
   WHERE "userId" = 'user-id' 
   ORDER BY "createdAt" DESC LIMIT 5;
   ```

4. **Manually Complete Enrollment:**
   ```sql
   -- Update purchase status
   UPDATE "Purchase" SET status = 'COMPLETED' WHERE id = 'purchase-id';
   
   -- Create enrollment
   INSERT INTO "Enrollment" ("userId", "courseId", "source", "purchaseId")
   VALUES ('user-id', 'course-id', 'purchase', 'purchase-id');
   ```

5. **Resend Webhook:**
   - In Stripe Dashboard, find the event
   - Click "Resend webhook"

---

## Video Playback Issues

### Issue: Videos Won't Play

**Symptoms:**
- Black screen instead of video
- "Video unavailable" error
- Infinite loading spinner

**Possible Causes:**
1. Slow internet connection
2. Browser doesn't support video format
3. Ad blocker interfering
4. CDN issue
5. Video file corrupted

**Solutions:**

**For Students:**
1. **Check Internet Speed:**
   - Visit speedtest.net
   - Minimum 2 Mbps required for video streaming

2. **Try Different Browser:**
   - Chrome, Firefox, or Safari recommended

3. **Disable Ad Blocker:**
   - Temporarily disable extensions
   - Add site to whitelist

4. **Clear Browser Cache:**
   - Clear cache and reload page

5. **Try Lower Quality:**
   - If available, select lower video quality

**For Administrators:**
1. **Verify Video URL:**
   ```sql
   SELECT id, title, videoUrl FROM "Lesson" WHERE id = 'lesson-id';
   ```

2. **Test Video URL:**
   ```bash
   curl -I https://video-url.com/video.mp4
   ```

3. **Check CDN Status:**
   - Verify CDN is operational
   - Check CDN logs for errors

4. **Re-upload Video:**
   - If video is corrupted, re-upload

---

### Issue: Video Buffering Constantly

**Symptoms:**
- Video pauses frequently to buffer
- Poor playback quality
- Long loading times

**Possible Causes:**
1. Slow internet connection
2. CDN performance issues
3. High server load
4. Video not optimized

**Solutions:**

**For Students:**
1. **Check Internet Speed:**
   - Close other applications using bandwidth
   - Move closer to WiFi router

2. **Lower Video Quality:**
   - Select lower resolution (480p or 360p)

3. **Pause and Let Buffer:**
   - Pause video for 30 seconds to buffer

**For Administrators:**
1. **Optimize Videos:**
   - Use adaptive bitrate streaming
   - Compress videos appropriately
   - Use multiple quality options

2. **Check CDN Performance:**
   - Monitor CDN analytics
   - Consider switching CDN provider

3. **Enable Video Caching:**
   ```typescript
   // Add cache headers for videos
   res.setHeader('Cache-Control', 'public, max-age=31536000')
   ```

---

## Progress Tracking Issues

### Issue: Progress Not Saving

**Symptoms:**
- Completed lessons show as incomplete
- Progress resets after refresh
- Dashboard shows 0% progress

**Possible Causes:**
1. Not logged in
2. API request failing
3. Database connection issue
4. Browser blocking requests

**Solutions:**

**For Students:**
1. **Verify You're Logged In:**
   - Check profile picture in header
   - Log out and back in

2. **Check Internet Connection:**
   - Ensure stable connection
   - Try refreshing page

3. **Wait Before Navigating:**
   - Wait 2-3 seconds after completing lesson
   - Ensure "Completed" checkmark appears

4. **Try Different Browser:**
   - Test with another browser

**For Administrators:**
1. **Check Progress API:**
   ```bash
   # Test progress endpoint
   curl -X POST https://yourdomain.com/api/progress \
     -H "Content-Type: application/json" \
     -H "Cookie: next-auth.session-token=..." \
     -d '{"courseId":"course-id","lessonId":"lesson-id","completed":true}'
   ```

2. **Verify Database Records:**
   ```sql
   SELECT * FROM "CourseProgress" 
   WHERE "userId" = 'user-id' AND "courseId" = 'course-id';
   ```

3. **Check for Errors:**
   ```bash
   # Review API logs
   grep "POST /api/progress" logs/api.log | grep "error"
   ```

4. **Test Database Connection:**
   ```bash
   npx prisma db pull
   ```

---

### Issue: Progress Percentage Incorrect

**Symptoms:**
- Progress shows wrong percentage
- Completed all lessons but not 100%
- Progress stuck at certain percentage

**Possible Causes:**
1. Calculation error
2. Hidden/unpublished lessons counted
3. Database inconsistency

**Solutions:**

**For Administrators:**
1. **Recalculate Progress:**
   ```typescript
   // Run progress recalculation script
   npm run recalculate-progress
   ```

2. **Check Lesson Count:**
   ```sql
   -- Count total lessons
   SELECT COUNT(*) FROM "Lesson" l
   JOIN "Module" m ON l."moduleId" = m.id
   WHERE m."courseId" = 'course-id';
   
   -- Count completed lessons
   SELECT COUNT(*) FROM "CourseProgress"
   WHERE "userId" = 'user-id' 
     AND "courseId" = 'course-id' 
     AND completed = true;
   ```

3. **Fix Calculation Logic:**
   ```typescript
   // In src/lib/course-completion.ts
   const completionPercentage = (completedLessons / totalLessons) * 100
   ```

---

## Payment Issues

### Issue: Payment Fails

**Symptoms:**
- "Payment failed" error
- Redirected back to course page
- Card declined message

**Possible Causes:**
1. Insufficient funds
2. Card declined by bank
3. Stripe configuration issue
4. Network error

**Solutions:**

**For Students:**
1. **Check Card Details:**
   - Verify card number, expiry, CVV
   - Ensure billing address is correct

2. **Try Different Card:**
   - Use another payment method

3. **Contact Bank:**
   - Bank may be blocking transaction
   - Verify card is enabled for online payments

4. **Try Again Later:**
   - Temporary network issue may resolve

**For Administrators:**
1. **Check Stripe Dashboard:**
   - Review failed payment details
   - Check decline reason

2. **Verify Stripe Configuration:**
   ```bash
   # Check environment variables
   echo $STRIPE_SECRET_KEY
   echo $STRIPE_PUBLISHABLE_KEY
   ```

3. **Test Stripe Integration:**
   ```bash
   # Use Stripe test cards
   # 4242 4242 4242 4242 - Success
   # 4000 0000 0000 0002 - Decline
   ```

4. **Check Webhook Configuration:**
   - Verify webhook endpoint is correct
   - Ensure webhook secret is set

---

## Profile Issues

### Issue: Profile Information Not Updating

**Symptoms:**
- Changes don't save
- Old information still displayed
- "Update failed" error

**Possible Causes:**
1. API request failing
2. Validation error
3. Database connection issue
4. Cache not cleared

**Solutions:**

**For Students:**
1. **Check Required Fields:**
   - Ensure all required fields are filled
   - Check for validation errors

2. **Try Refreshing:**
   - Save changes
   - Refresh page to see updates

3. **Clear Browser Cache:**
   - Clear cache and reload

**For Administrators:**
1. **Check Profile API:**
   ```bash
   curl -X PUT https://yourdomain.com/api/profile \
     -H "Content-Type: application/json" \
     -H "Cookie: next-auth.session-token=..." \
     -d '{"name":"New Name"}'
   ```

2. **Verify Database Update:**
   ```sql
   SELECT * FROM "User" WHERE id = 'user-id';
   SELECT * FROM "Profile" WHERE "userId" = 'user-id';
   ```

3. **Check Validation Logic:**
   ```typescript
   // In src/app/api/profile/route.ts
   // Verify validation rules
   ```

---

## Performance Issues

### Issue: Slow Page Load Times

**Symptoms:**
- Pages take long to load
- Slow navigation between pages
- Timeout errors

**Possible Causes:**
1. Slow database queries
2. Large bundle size
3. No caching
4. Server overload

**Solutions:**

**For Administrators:**
1. **Optimize Database Queries:**
   ```sql
   -- Add indexes
   CREATE INDEX idx_enrollment_user ON "Enrollment"("userId");
   CREATE INDEX idx_progress_course ON "CourseProgress"("courseId");
   ```

2. **Enable Caching:**
   ```typescript
   // Add Redis caching
   import { redis } from '@/lib/redis'
   
   const cached = await redis.get(cacheKey)
   if (cached) return JSON.parse(cached)
   ```

3. **Optimize Bundle Size:**
   ```bash
   # Analyze bundle
   npm run analyze
   
   # Use dynamic imports
   const Component = dynamic(() => import('./Component'))
   ```

4. **Enable CDN:**
   - Use CDN for static assets
   - Enable edge caching

5. **Monitor Performance:**
   ```bash
   # Check server metrics
   pm2 monit
   ```

---

## Admin Panel Issues

### Issue: Data Not Syncing

**Symptoms:**
- Changes in main app not reflected in admin panel
- Stale data displayed
- Sync status shows errors

**Possible Causes:**
1. API key invalid
2. Webhook not configured
3. Network connectivity issue
4. Database replication lag

**Solutions:**

**For Administrators:**
1. **Check API Key:**
   ```bash
   # Verify API key is active
   SELECT * FROM "ApiKey" WHERE "apiKey" = 'your-key';
   ```

2. **Test API Connection:**
   ```bash
   # Test admin API endpoint
   curl -X GET https://yourdomain.com/api/admin/students \
     -H "X-API-Key: your-key" \
     -H "X-Signature: signature" \
     -H "X-Timestamp: timestamp"
   ```

3. **Check Webhook Configuration:**
   ```typescript
   // Verify webhook endpoints are configured
   WEBHOOK_ENROLLMENT_URL=https://admin.yourdomain.com/api/webhooks/enrollment
   WEBHOOK_PROFILE_URL=https://admin.yourdomain.com/api/webhooks/profile
   ```

4. **Review Sync Logs:**
   ```bash
   grep "sync" logs/application.log
   ```

5. **Manually Trigger Sync:**
   ```bash
   # Run sync script
   npm run sync-data
   ```

---

## API Integration Issues

### Issue: API Requests Failing

**Symptoms:**
- 401 Unauthorized errors
- 403 Forbidden errors
- 429 Rate limit errors

**Possible Causes:**
1. Invalid API key
2. Incorrect signature
3. Rate limit exceeded
4. Timestamp too old

**Solutions:**

**For Administrators:**
1. **Verify API Key:**
   ```bash
   # Check if key is active
   SELECT * FROM "ApiKey" 
   WHERE "apiKey" = 'your-key' AND "isActive" = true;
   ```

2. **Check Signature Generation:**
   ```typescript
   // Correct signature generation
   const signature = crypto
     .createHmac('sha256', apiSecret)
     .update(`${method}${path}${timestamp}${body}`)
     .digest('hex')
   ```

3. **Verify Timestamp:**
   ```typescript
   // Timestamp must be within 5 minutes
   const timestamp = Date.now().toString()
   ```

4. **Check Rate Limits:**
   ```bash
   # Review rate limit settings
   grep "rate-limit" config/api.config.ts
   ```

5. **Monitor API Usage:**
   ```sql
   SELECT "keyName", "lastUsedAt", COUNT(*) as requests
   FROM "ApiKey"
   GROUP BY "keyName", "lastUsedAt";
   ```

---

## Database Issues

### Issue: Database Connection Errors

**Symptoms:**
- "Cannot connect to database" errors
- Timeout errors
- Connection pool exhausted

**Possible Causes:**
1. Database server down
2. Incorrect connection string
3. Connection pool exhausted
4. Network issue

**Solutions:**

**For Administrators:**
1. **Check Database Status:**
   ```bash
   # Test connection
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **Verify Connection String:**
   ```bash
   # Check DATABASE_URL format
   # postgresql://user:password@host:port/database
   echo $DATABASE_URL
   ```

3. **Increase Connection Pool:**
   ```typescript
   // In prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     connection_limit = 20
   }
   ```

4. **Restart Database:**
   ```bash
   # Restart PostgreSQL
   sudo systemctl restart postgresql
   ```

5. **Check Database Logs:**
   ```bash
   tail -f /var/log/postgresql/postgresql.log
   ```

---

## Getting Help

If you've tried the solutions above and still experiencing issues:

### For Students

**Email Support:**
- support@yourdomain.com
- Include: Error message, browser, steps to reproduce

**Live Chat:**
- Available Monday-Friday, 9 AM - 6 PM IST
- Click chat icon in bottom right

### For Administrators

**Technical Support:**
- admin-support@yourdomain.com
- Include: Error logs, database queries, API requests

**Emergency Support:**
- Phone: +91-XXX-XXX-XXXX (24/7 for critical issues)

### Information to Provide

When contacting support, include:
1. **Error Message:** Exact error text
2. **Steps to Reproduce:** What you did before the error
3. **Environment:** Browser, device, OS
4. **Screenshots:** Visual representation of the issue
5. **Logs:** Relevant log entries (for admins)
6. **User ID:** Your user ID or email

---

## Preventive Measures

### For Students

1. **Keep Browser Updated:** Use latest browser version
2. **Stable Internet:** Ensure reliable connection
3. **Regular Backups:** Save important notes externally
4. **Clear Cache Regularly:** Prevent cache-related issues

### For Administrators

1. **Monitor Logs:** Review logs daily
2. **Database Backups:** Automated daily backups
3. **Performance Monitoring:** Use APM tools
4. **Security Updates:** Keep dependencies updated
5. **Load Testing:** Test before major releases
6. **Documentation:** Keep runbooks updated

---

**Last Updated:** January 2024

For the most up-to-date troubleshooting information, visit our documentation at https://docs.yourdomain.com
