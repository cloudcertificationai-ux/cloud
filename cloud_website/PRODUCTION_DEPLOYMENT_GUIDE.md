# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Anywheredoor platform to production, including both the main application and admin panel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Auth0 Configuration](#auth0-configuration)
5. [Stripe Configuration](#stripe-configuration)
6. [API Key Generation](#api-key-generation)
7. [Deployment Steps](#deployment-steps)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Production Checklist](#production-checklist)

---

## Prerequisites

### Required Accounts

- [ ] Vercel account (or alternative hosting platform)
- [ ] PostgreSQL database (Supabase, Neon, Railway, or AWS RDS)
- [ ] Auth0 account
- [ ] Google Cloud Console (for Google OAuth)
- [ ] Apple Developer account (for Apple Sign In)
- [ ] Stripe account
- [ ] Redis instance (for rate limiting)

### Required Tools

```bash
# Install Vercel CLI
npm install -g vercel

# Install Prisma CLI
npm install -g prisma

# Install PostgreSQL client (optional, for database management)
brew install postgresql  # macOS
```

---

## Environment Variables

### Main Application (.env)

Create a `.env` file in the `anywheredoor` directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/anywheredoor?schema=public"

# NextAuth.js
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Auth0
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"
AUTH0_ISSUER="https://your-tenant.auth0.com"

# Google OAuth (configured in Auth0)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Apple Sign In (configured in Auth0)
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_TEAM_ID="your-apple-team-id"
APPLE_KEY_ID="your-apple-key-id"
APPLE_PRIVATE_KEY="your-apple-private-key"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis (for rate limiting)
REDIS_URL="redis://default:password@host:6379"

# API Security
API_KEY="generate-secure-api-key"
API_SECRET="generate-secure-api-secret"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_NAME="Anywheredoor"

# Analytics (optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
```

### Admin Panel (.env)

Create a `.env` file in the `anywheredoor_admin` directory:

```bash
# Database (same as main app)
DATABASE_URL="postgresql://user:password@host:5432/anywheredoor?schema=public"

# NextAuth.js
NEXTAUTH_URL="https://admin.yourdomain.com"
NEXTAUTH_SECRET="generate-different-secret-from-main-app"

# Auth0 (same tenant, different application)
AUTH0_CLIENT_ID="your-admin-auth0-client-id"
AUTH0_CLIENT_SECRET="your-admin-auth0-client-secret"
AUTH0_ISSUER="https://your-tenant.auth0.com"

# Main App API
MAIN_APP_URL="https://yourdomain.com"
MAIN_APP_API_KEY="same-as-main-app-api-key"
MAIN_APP_API_SECRET="same-as-main-app-api-secret"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://admin.yourdomain.com"
NEXT_PUBLIC_APP_NAME="Anywheredoor Admin"
```

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate API_KEY
openssl rand -hex 32

# Generate API_SECRET
openssl rand -base64 64
```

---

## Database Setup

### 1. Create PostgreSQL Database

**Option A: Supabase (Recommended)**

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings → Database
4. Enable connection pooling for production

**Option B: Neon**

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Enable connection pooling

**Option C: Railway**

1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string

### 2. Run Database Migrations

```bash
cd anywheredoor

# Set DATABASE_URL environment variable
export DATABASE_URL="your-connection-string"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Verify migration
npx prisma db pull
```

### 3. Seed Database (Optional)

```bash
# Create seed script if needed
npx prisma db seed
```

### 4. Connection Pooling

For production, use connection pooling to handle concurrent requests:

```bash
# Supabase: Use the pooler connection string
DATABASE_URL="postgresql://user:password@host:6543/anywheredoor?pgbouncer=true"

# Neon: Connection pooling is automatic

# Railway: Add ?connection_limit=10 to connection string
DATABASE_URL="postgresql://user:password@host:5432/anywheredoor?connection_limit=10"
```

---

## Auth0 Configuration

### 1. Create Auth0 Tenant

1. Go to [auth0.com](https://auth0.com)
2. Create a new tenant (e.g., `anywheredoor`)
3. Note your domain: `anywheredoor.auth0.com`

### 2. Configure Main Application

1. **Create Application**:
   - Go to Applications → Create Application
   - Name: "Anywheredoor Main"
   - Type: Regular Web Application
   - Technology: Next.js

2. **Configure Settings**:
   ```
   Allowed Callback URLs:
   https://yourdomain.com/api/auth/callback/auth0
   http://localhost:3000/api/auth/callback/auth0 (for testing)
   
   Allowed Logout URLs:
   https://yourdomain.com
   http://localhost:3000
   
   Allowed Web Origins:
   https://yourdomain.com
   http://localhost:3000
   ```

3. **Copy Credentials**:
   - Domain → AUTH0_ISSUER
   - Client ID → AUTH0_CLIENT_ID
   - Client Secret → AUTH0_CLIENT_SECRET

### 3. Configure Admin Panel

1. **Create Application**:
   - Go to Applications → Create Application
   - Name: "Anywheredoor Admin"
   - Type: Regular Web Application

2. **Configure Settings**:
   ```
   Allowed Callback URLs:
   https://admin.yourdomain.com/api/auth/callback/auth0
   
   Allowed Logout URLs:
   https://admin.yourdomain.com
   
   Allowed Web Origins:
   https://admin.yourdomain.com
   ```

### 4. Configure Google OAuth

1. **Google Cloud Console**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     ```
     https://anywheredoor.auth0.com/login/callback
     ```

2. **Auth0 Configuration**:
   - Go to Authentication → Social
   - Enable Google
   - Enter Client ID and Client Secret
   - Configure permissions: email, profile

### 5. Configure Apple Sign In

1. **Apple Developer Account**:
   - Go to [developer.apple.com](https://developer.apple.com)
   - Create an App ID
   - Enable Sign In with Apple
   - Create a Service ID
   - Configure return URLs:
     ```
     https://anywheredoor.auth0.com/login/callback
     ```

2. **Auth0 Configuration**:
   - Go to Authentication → Social
   - Enable Apple
   - Enter Service ID, Team ID, Key ID
   - Upload private key

### 6. Configure User Roles

1. **Create Roles**:
   - Go to User Management → Roles
   - Create roles: ADMIN, INSTRUCTOR, STUDENT

2. **Assign Roles**:
   - Go to User Management → Users
   - Assign ADMIN role to admin users

3. **Add Role to Token**:
   - Go to Auth Pipeline → Rules
   - Create a rule to add role to ID token:
   ```javascript
   function addRoleToToken(user, context, callback) {
     const namespace = 'https://anywheredoor.com';
     const assignedRoles = (context.authorization || {}).roles;
     
     context.idToken[namespace + '/roles'] = assignedRoles;
     context.accessToken[namespace + '/roles'] = assignedRoles;
     
     callback(null, user, context);
   }
   ```

---

## Stripe Configuration

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create an account
3. Complete business verification

### 2. Get API Keys

1. Go to Developers → API keys
2. Copy:
   - Publishable key → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - Secret key → STRIPE_SECRET_KEY

### 3. Configure Webhook

1. **Create Webhook Endpoint**:
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

2. **Get Webhook Secret**:
   - Copy signing secret → STRIPE_WEBHOOK_SECRET

3. **Test Webhook**:
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Login
   stripe login
   
   # Forward webhooks to local
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### 4. Configure Products

1. Go to Products → Add product
2. Create products for each course
3. Note product IDs for course configuration

---

## API Key Generation

### 1. Generate API Keys

```bash
cd anywheredoor

# Run the API key generation script
npx ts-node scripts/generate-api-key.ts
```

### 2. Store API Keys

1. **Main Application**:
   - Add to Vercel environment variables
   - API_KEY and API_SECRET

2. **Admin Panel**:
   - Add to Vercel environment variables
   - MAIN_APP_API_KEY and MAIN_APP_API_SECRET

### 3. Rotate API Keys (Quarterly)

```bash
# Generate new keys
npx ts-node scripts/generate-api-key.ts

# Update environment variables
vercel env add API_KEY production
vercel env add API_SECRET production

# Redeploy both applications
```

---

## Deployment Steps

### Main Application Deployment

#### 1. Prepare for Deployment

```bash
cd anywheredoor

# Install dependencies
npm install

# Run type check
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test

# Build locally to verify
npm run build
```

#### 2. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
# ... add all other variables

# Deploy to production
vercel --prod
```

#### 3. Configure Custom Domain

1. Go to Vercel dashboard → Project → Settings → Domains
2. Add your domain: `yourdomain.com`
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

### Admin Panel Deployment

#### 1. Prepare for Deployment

```bash
cd anywheredoor_admin

# Install dependencies
npm install

# Run type check
npm run type-check

# Run linting
npm run lint

# Build locally to verify
npm run build
```

#### 2. Deploy to Vercel

```bash
# Link project (create new project)
vercel link

# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
# ... add all other variables

# Deploy to production
vercel --prod
```

#### 3. Configure Custom Domain

1. Add subdomain: `admin.yourdomain.com`
2. Configure DNS records
3. Wait for SSL certificate

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check main application
curl https://yourdomain.com/api/health

# Check admin panel
curl https://admin.yourdomain.com/api/health
```

### 2. Authentication Testing

1. **Main Application**:
   - Visit `https://yourdomain.com`
   - Click "Sign In"
   - Test Google OAuth
   - Test Apple Sign In
   - Verify user record created in database

2. **Admin Panel**:
   - Visit `https://admin.yourdomain.com`
   - Sign in with admin account
   - Verify admin role access

### 3. Database Verification

```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt

# Verify user count
SELECT COUNT(*) FROM "User";

# Check enrollments
SELECT COUNT(*) FROM "Enrollment";
```

### 4. API Testing

```bash
# Test enrollment API
curl -X POST https://yourdomain.com/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<token>" \
  -d '{"courseId": "test-course", "courseSlug": "test"}'

# Test admin API
curl https://yourdomain.com/api/admin/students \
  -H "X-API-Key: <key>" \
  -H "X-Signature: <signature>" \
  -H "X-Timestamp: <timestamp>"
```

### 5. Stripe Testing

1. Use test mode first
2. Create test purchase
3. Verify webhook received
4. Check enrollment created
5. Switch to live mode

### 6. Performance Testing

```bash
# Run Lighthouse audit
npx lighthouse https://yourdomain.com --view

# Check Core Web Vitals
# Visit https://pagespeed.web.dev/
```

---

## Production Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Auth0 configured with production URLs
- [ ] Stripe webhooks configured
- [ ] API keys generated and stored securely
- [ ] Custom domains configured
- [ ] SSL certificates provisioned
- [ ] All tests passing
- [ ] Type checking passing
- [ ] Linting passing
- [ ] Build successful

### Security

- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] API keys are secure and not committed to git
- [ ] Database credentials are secure
- [ ] Stripe keys are in live mode
- [ ] Auth0 callback URLs are production URLs only
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

### Database

- [ ] Connection pooling enabled
- [ ] Backup strategy in place
- [ ] Migration rollback plan documented
- [ ] Database indexes optimized
- [ ] Query performance tested

### Monitoring

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up
- [ ] Alert notifications configured

### Documentation

- [ ] API documentation published
- [ ] User guides available
- [ ] Admin guides available
- [ ] Troubleshooting guide available
- [ ] Runbook for common issues

### Post-Deployment

- [ ] Health checks passing
- [ ] Authentication working
- [ ] Enrollment flow tested
- [ ] Payment flow tested
- [ ] Admin panel accessible
- [ ] API endpoints responding
- [ ] Webhooks receiving events
- [ ] Performance metrics acceptable
- [ ] No console errors
- [ ] Mobile responsiveness verified

### Ongoing Maintenance

- [ ] Weekly security updates
- [ ] Monthly dependency updates
- [ ] Quarterly API key rotation
- [ ] Regular database backups
- [ ] Performance monitoring reviews
- [ ] User feedback collection
- [ ] Analytics review

---

## Rollback Procedure

### If Deployment Fails

1. **Immediate Rollback**:
   ```bash
   # Vercel automatic rollback
   vercel rollback
   ```

2. **Database Rollback**:
   ```bash
   # Rollback last migration
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

3. **Verify Rollback**:
   - Check health endpoints
   - Test critical user flows
   - Monitor error rates

### If Issues Discovered Post-Deployment

1. **Assess Impact**:
   - Check error rates
   - Review user reports
   - Analyze logs

2. **Hotfix or Rollback**:
   - If critical: Rollback immediately
   - If minor: Deploy hotfix

3. **Communication**:
   - Notify users if needed
   - Update status page
   - Document incident

---

## Support and Resources

### Documentation

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Auth0 Documentation](https://auth0.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

### Monitoring

- Vercel Dashboard: https://vercel.com/dashboard
- Auth0 Dashboard: https://manage.auth0.com
- Stripe Dashboard: https://dashboard.stripe.com
- Database Dashboard: (Supabase/Neon/Railway)

### Emergency Contacts

- DevOps Team: devops@yourdomain.com
- Database Admin: dba@yourdomain.com
- Security Team: security@yourdomain.com

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify DATABASE_URL is correct
   - Check connection pooling settings
   - Verify database is accessible from Vercel

2. **Authentication Failures**:
   - Verify Auth0 callback URLs
   - Check NEXTAUTH_URL matches domain
   - Verify NEXTAUTH_SECRET is set

3. **Stripe Webhook Failures**:
   - Verify webhook URL is correct
   - Check STRIPE_WEBHOOK_SECRET
   - Review Stripe dashboard logs

4. **API Key Authentication Failures**:
   - Verify API_KEY and API_SECRET match
   - Check signature generation
   - Verify timestamp is recent

5. **Build Failures**:
   - Check TypeScript errors
   - Verify all dependencies installed
   - Review build logs in Vercel

---

## Conclusion

This deployment guide covers all aspects of deploying the Anywheredoor platform to production. Follow each step carefully and use the checklist to ensure nothing is missed.

For additional support, refer to the troubleshooting guide or contact the development team.
