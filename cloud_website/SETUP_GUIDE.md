# Anywheredoor Setup Guide

## Complete Setup Instructions

This guide will help you set up the Anywheredoor learning platform from scratch.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Neon account)
- Stripe account for payments
- Auth0 account for authentication

## 1. Environment Setup

Copy the `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Required Environment Variables:

#### Database
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

#### NextAuth
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

Generate a secret:
```bash
openssl rand -base64 32
```

#### Auth0
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application (Regular Web Application)
3. Configure Allowed Callback URLs: `http://localhost:3000/api/auth/callback/auth0`
4. Configure Allowed Logout URLs: `http://localhost:3000`
5. Copy your credentials:

```env
AUTH0_DOMAIN="your-tenant.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
AUTH0_ISSUER="https://your-tenant.auth0.com"
```

#### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from Developers > API keys
3. Set up a webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Copy the webhook secret

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Database Setup

### Run Migrations
```bash
npx prisma migrate deploy
```

### Seed Database with Sample Data
```bash
npm run db:seed
```

This will create:
- 4 course categories
- 2 instructors
- 3 courses (2 paid, 1 free)
- Course modules and lessons

### Generate Prisma Client
```bash
npx prisma generate
```

## 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 5. Testing Authentication

1. Click "Sign In" in the header
2. You'll be redirected to Auth0
3. Create an account or sign in
4. You'll be redirected back to the application

## 6. Testing Enrollment Flow

### Free Course:
1. Browse to a free course
2. Click "Enroll Now"
3. If not logged in, you'll be prompted to sign in
4. After signing in, enrollment is automatic
5. Course appears in your dashboard

### Paid Course:
1. Browse to a paid course
2. Click "Enroll Now"
3. If not logged in, sign in first
4. You'll be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. After payment, enrollment is created via webhook
7. Course appears in your dashboard

## 7. Stripe Webhook Testing (Local Development)

Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

Login to Stripe:
```bash
stripe login
```

Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret and update your `.env`:
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 8. Common Issues & Solutions

### Issue: Login not working
**Solution**: 
- Check Auth0 credentials in `.env`
- Verify callback URLs in Auth0 dashboard
- Check browser console for errors
- Ensure `NEXTAUTH_SECRET` is set

### Issue: Payment not completing
**Solution**:
- Verify Stripe webhook is configured
- Check webhook secret matches
- Use Stripe CLI for local testing
- Check Stripe dashboard for webhook delivery

### Issue: Database connection errors
**Solution**:
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Run `npx prisma migrate deploy`
- Check Prisma logs

### Issue: Courses not showing
**Solution**:
- Run `npm run db:seed` to populate database
- Check database has courses with `published: true`
- Verify database connection

## 9. Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Update Auth0 callback URLs to production domain
5. Update Stripe webhook URL to production domain
6. Deploy

### Environment Variables for Production:
- Update `NEXTAUTH_URL` to production URL
- Use production Stripe keys
- Use production database URL
- Keep Auth0 credentials same (or create production app)

## 10. Database Management

### View Database:
```bash
npx prisma studio
```

### Reset Database (Development Only):
```bash
npm run db:reset
```

### Create New Migration:
```bash
npx prisma migrate dev --name your_migration_name
```

## 11. Features Implemented

✅ Authentication with Auth0
✅ Course browsing and filtering
✅ Free course enrollment
✅ Paid course enrollment with Stripe
✅ Payment webhook handling
✅ User dashboard
✅ Course progress tracking
✅ Responsive design
✅ SEO optimization
✅ Error handling
✅ Audit logging

## 12. Next Steps

- Add more courses via Prisma Studio or admin panel
- Customize course content
- Add course completion certificates
- Implement course reviews
- Add email notifications
- Create admin dashboard
- Add analytics tracking

## Support

For issues or questions:
1. Check this guide
2. Review error logs
3. Check browser console
4. Review Stripe/Auth0 dashboards
5. Check database with Prisma Studio

## Security Notes

- Never commit `.env` file
- Use strong `NEXTAUTH_SECRET`
- Keep API keys secure
- Use HTTPS in production
- Regularly update dependencies
- Monitor webhook deliveries
- Review audit logs regularly
