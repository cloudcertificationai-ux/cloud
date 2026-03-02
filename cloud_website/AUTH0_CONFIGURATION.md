# Auth0 Configuration Guide

## Error: 401 invalid_client

This error occurs when the Auth0 application is not properly configured with the correct callback URLs.

## Steps to Fix

### 1. Log into Auth0 Dashboard
- Go to https://manage.auth0.com/
- Navigate to **Applications** → **Applications**
- Find your application (Client ID: `4RxmAC5Ljo1xmxYTtAIu6cIiFccYbosu`)

### 2. Configure Application Settings

In the **Settings** tab, add the following URLs:

#### Allowed Callback URLs
```
http://localhost:3000/api/auth/callback/auth0
https://yourdomain.com/api/auth/callback/auth0
```

#### Allowed Logout URLs
```
http://localhost:3000
https://yourdomain.com
```

#### Allowed Web Origins
```
http://localhost:3000
https://yourdomain.com
```

#### Allowed Origins (CORS)
```
http://localhost:3000
https://yourdomain.com
```

### 3. Application Type
Make sure the **Application Type** is set to:
- **Regular Web Application**

### 4. Grant Types
Ensure the following grant types are enabled:
- ✅ Authorization Code
- ✅ Refresh Token
- ✅ Implicit (optional, for legacy support)

### 5. Save Changes
Click **Save Changes** at the bottom of the page.

## For Admin Panel (Port 3001)

If you're also using Auth0 for the admin panel, add these URLs as well:

#### Allowed Callback URLs
```
http://localhost:3001/api/auth/callback/auth0
```

#### Allowed Logout URLs
```
http://localhost:3001
```

#### Allowed Web Origins
```
http://localhost:3001
```

## Environment Variables

Your `.env` file should have:
```env
AUTH0_DOMAIN="dev-dzupe84r4ur0je5r.us.auth0.com"
AUTH0_CLIENT_ID="4RxmAC5Ljo1xmxYTtAIu6cIiFccYbosu"
AUTH0_CLIENT_SECRET="k4kbNn2LUDIy4gpnJx-5NtdIusqs7mTETzgDxlG7uGXL1kO92_LTWJCYWN9f-dC0"
AUTH0_ISSUER="https://dev-dzupe84r4ur0je5r.us.auth0.com"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
```

## Testing

After configuring Auth0:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/auth/signin

3. Click on the Auth0 sign-in button

4. You should be redirected to Auth0's login page

## Troubleshooting

### Still getting "invalid_client"?

1. **Double-check the Client ID and Secret** in your `.env` file
2. **Verify the domain** is exactly `dev-dzupe84r4ur0je5r.us.auth0.com`
3. **Clear your browser cache** and cookies
4. **Check Auth0 logs** in the dashboard under Monitoring → Logs

### Check Auth0 Application Type

Make sure your application is configured as a **Regular Web Application**, not:
- Single Page Application (SPA)
- Native Application
- Machine to Machine

### Verify Callback URL Format

The callback URL must be exactly:
```
http://localhost:3000/api/auth/callback/auth0
```

Note:
- No trailing slash
- Must include `/api/auth/callback/auth0`
- Protocol must match (http for localhost, https for production)

## Additional Configuration (Optional)

### Enable Social Connections

In Auth0 Dashboard:
1. Go to **Authentication** → **Social**
2. Enable Google, Apple, or other providers
3. Configure each provider with their credentials

### Customize Login Page

1. Go to **Branding** → **Universal Login**
2. Customize the login page appearance
3. Add your logo and brand colors

## Production Deployment

When deploying to production:

1. Update `NEXTAUTH_URL` in your production environment:
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   ```

2. Add production URLs to Auth0:
   ```
   https://yourdomain.com/api/auth/callback/auth0
   https://yourdomain.com
   ```

3. Consider creating a separate Auth0 application for production

## Security Best Practices

1. **Never commit** `.env` files to version control
2. **Rotate secrets** regularly
3. **Use different credentials** for development and production
4. **Enable MFA** for admin accounts in Auth0
5. **Monitor Auth0 logs** for suspicious activity
