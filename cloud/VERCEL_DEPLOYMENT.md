# Vercel Deployment Guide

## Required Environment Variables

Set these in your Vercel project settings:

### Essential Variables
```
NEXTAUTH_URL=https://your-admin-panel.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters-long
API_SECRET=your-api-secret-key-for-request-signing
NODE_ENV=production
```

### Optional Variables (for full functionality)
```
MAIN_WEBSITE_URL=https://your-main-site.com
ADMIN_PANEL_URL=https://your-admin-panel.vercel.app
IP_WHITELIST=127.0.0.1,::1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://your-main-site.com,https://your-admin-panel.vercel.app
```

## Deployment Steps

1. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Navigate to Environment Variables
   - Add all required variables above

2. **Generate Secure Secrets:**
   ```bash
   # Generate NEXTAUTH_SECRET (32+ characters)
   openssl rand -base64 32
   
   # Generate API_SECRET
   openssl rand -base64 32
   ```

3. **Update NEXTAUTH_URL:**
   - Set to your actual Vercel deployment URL
   - Example: `https://your-project.vercel.app`

4. **Deploy:**
   ```bash
   vercel --prod
   ```

## Common Issues & Solutions

### 1. NextAuth Errors
- Ensure NEXTAUTH_URL matches your deployment URL exactly
- NEXTAUTH_SECRET must be at least 32 characters
- Check that cookies are configured for production

### 2. API Route Failures
- Verify all environment variables are set
- Check function timeout limits (max 30s on Vercel)
- Ensure middleware is compatible with Edge Runtime

### 3. Build Failures
- Run `npm run build` locally first
- Check for TypeScript errors with `npm run type-check`
- Verify all dependencies are in package.json

### 4. Authentication Issues
- Update allowed origins in CORS configuration
- Check cookie settings for production
- Verify redirect URLs are whitelisted

## Security Checklist

- [ ] NEXTAUTH_SECRET is cryptographically secure
- [ ] API_SECRET is unique and secure
- [ ] CORS origins are properly configured
- [ ] IP whitelist is configured if needed
- [ ] Rate limiting is enabled
- [ ] Security headers are applied

## Testing Deployment

1. Visit your deployed URL
2. Test authentication flow
3. Verify API endpoints work
4. Check security headers in browser dev tools
5. Test admin functionality

## Monitoring

- Check Vercel function logs for errors
- Monitor authentication events
- Review security audit logs
- Set up error tracking (Sentry recommended)