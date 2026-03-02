# Quick Fix for Auth0 "invalid_client" Error

## Immediate Action Required

Go to your Auth0 Dashboard and add these callback URLs:

### For Main Application (localhost:3000)
```
http://localhost:3000/api/auth/callback/auth0
```

### For Admin Panel (localhost:3001)
```
http://localhost:3001/api/auth/callback/auth0
```

## Step-by-Step Instructions

1. **Open Auth0 Dashboard**
   - URL: https://manage.auth0.com/dashboard/us/dev-dzupe84r4ur0je5r/

2. **Navigate to Your Application**
   - Click **Applications** in the left sidebar
   - Click **Applications** again
   - Find the application with Client ID: `4RxmAC5Ljo1xmxYTtAIu6cIiFccYbosu`

3. **Add Callback URLs**
   - Scroll to **Application URIs** section
   - In **Allowed Callback URLs**, add:
     ```
     http://localhost:3000/api/auth/callback/auth0,http://localhost:3001/api/auth/callback/auth0
     ```
   - In **Allowed Logout URLs**, add:
     ```
     http://localhost:3000,http://localhost:3001
     ```
   - In **Allowed Web Origins**, add:
     ```
     http://localhost:3000,http://localhost:3001
     ```

4. **Verify Application Type**
   - Scroll to **Application Properties**
   - Ensure **Application Type** is: **Regular Web Application**

5. **Save Changes**
   - Scroll to the bottom
   - Click **Save Changes**

6. **Restart Your Application**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

## Test the Fix

1. Open: http://localhost:3000/auth/signin
2. Click the Auth0 login button
3. You should now be redirected to Auth0's login page successfully

## Still Not Working?

### Check Environment Variables

Make sure your `.env` file has:
```env
AUTH0_DOMAIN="dev-dzupe84r4ur0je5r.us.auth0.com"
AUTH0_CLIENT_ID="4RxmAC5Ljo1xmxYTtAIu6cIiFccYbosu"
AUTH0_CLIENT_SECRET="k4kbNn2LUDIy4gpnJx-5NtdIusqs7mTETzgDxlG7uGXL1kO92_LTWJCYWN9f-dC0"
AUTH0_ISSUER="https://dev-dzupe84r4ur0je5r.us.auth0.com"
NEXTAUTH_URL="http://localhost:3000"
```

### Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Check Auth0 Logs

1. In Auth0 Dashboard, go to **Monitoring** → **Logs**
2. Look for recent failed login attempts
3. Check the error details

## Common Mistakes

❌ **Wrong**: `http://localhost:3000/api/auth/callback`
✅ **Correct**: `http://localhost:3000/api/auth/callback/auth0`

❌ **Wrong**: Application Type = "Single Page Application"
✅ **Correct**: Application Type = "Regular Web Application"

❌ **Wrong**: Missing trailing `/auth0` in callback URL
✅ **Correct**: Include `/auth0` at the end

## Need More Help?

See the full configuration guide: `AUTH0_CONFIGURATION.md`
