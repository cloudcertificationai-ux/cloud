# Vercel Deployment Checklist

## ✅ Pre-Deployment Steps

1. **Environment Variables** (Set in Vercel Dashboard)
   - [ ] `NEXTAUTH_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)
   - [ ] `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - [ ] `API_SECRET` - Generate with: `openssl rand -base64 32`
   - [ ] `NODE_ENV=production`

2. **Build Test**
   - [ ] Run `npm run build` locally (should succeed)
   - [ ] Run `npm run type-check` (should pass)

3. **Configuration Files**
   - [ ] `vercel.json` exists
   - [ ] `next.config.js` updated for production
   - [ ] Middleware simplified for Edge Runtime

## 🚀 Deployment Commands

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🔧 Common Issues & Solutions

### Issue: "Function exceeded timeout"
**Solution:** API routes are limited to 30s on Vercel. Optimize slow operations.

### Issue: "NextAuth configuration error"
**Solution:** Ensure `NEXTAUTH_URL` matches your deployment URL exactly.

### Issue: "Environment variable not found"
**Solution:** Check Vercel dashboard > Settings > Environment Variables.

### Issue: "Middleware errors"
**Solution:** Middleware is simplified for Edge Runtime compatibility.

### Issue: "CORS errors"
**Solution:** Update allowed origins in middleware to include your domain.

## 📋 Post-Deployment Verification

1. **Basic Functionality**
   - [ ] Site loads without errors
   - [ ] Authentication works (login/logout)
   - [ ] Admin dashboard accessible
   - [ ] API endpoints respond correctly

2. **Security Check**
   - [ ] HTTPS enforced
   - [ ] Security headers present (check browser dev tools)
   - [ ] Rate limiting works
   - [ ] Authentication required for admin routes

3. **Performance**
   - [ ] Page load times acceptable
   - [ ] Images optimized
   - [ ] No console errors

## 🔐 Security Notes

- Never commit `.env` files
- Use strong, unique secrets for production
- Regularly rotate API keys
- Monitor function logs for security events
- Set up proper CORS origins

## 📞 Support

If deployment fails:
1. Check Vercel function logs
2. Verify all environment variables
3. Test build locally first
4. Check Next.js 16.x compatibility