# Stripe Payment Integration Testing Guide

This guide provides step-by-step instructions for testing the Stripe payment integration for course enrollments.

## Prerequisites

1. **Stripe Account**: Create a free Stripe account at https://stripe.com
2. **Stripe CLI**: Install the Stripe CLI for webhook testing
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Other platforms: https://stripe.com/docs/stripe-cli
   ```
3. **Test Mode Keys**: Obtain your test mode keys from the Stripe Dashboard
   - Navigate to: Developers → API keys
   - Copy the "Publishable key" (starts with `pk_test_`)
   - Copy the "Secret key" (starts with `sk_test_`)

## Environment Setup

Update your `.env` file with Stripe test keys:

```env
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

## Test Scenarios

### 1. Test Successful Payment Flow

**Steps:**
1. Start the development server: `npm run dev`
2. Navigate to a paid course page (e.g., `/courses/web-development`)
3. Click the "Enroll Now" button
4. If not authenticated, sign in with Google/Apple/Auth0
5. In the enrollment modal, click "Pay $[amount]"
6. You'll be redirected to Stripe Checkout
7. Use the test card number: `4242 4242 4242 4242`
8. Enter any future expiry date (e.g., `12/34`)
9. Enter any 3-digit CVC (e.g., `123`)
10. Enter any billing details
11. Click "Pay"

**Expected Results:**
- Payment succeeds
- Redirected to `/dashboard?payment=success`
- Enrollment record created in database
- Course appears in student dashboard
- Purchase status is `COMPLETED`

### 2. Test Cancelled Payment

**Steps:**
1. Navigate to a paid course page
2. Click "Enroll Now"
3. In Stripe Checkout, click the "Back" button or close the window
4. You'll be redirected back to the course page

**Expected Results:**
- No enrollment created
- Purchase status remains `PENDING`
- User can retry enrollment
- URL shows `?payment=cancelled`

### 3. Test Failed Payment

**Steps:**
1. Navigate to a paid course page
2. Click "Enroll Now"
3. Use a test card that will be declined: `4000 0000 0000 0002`
4. Complete the checkout form

**Expected Results:**
- Payment is declined
- Error message displayed
- No enrollment created
- User can retry with different card

### 4. Test Webhook Handler

**Setup:**
1. Open a new terminal window
2. Login to Stripe CLI: `stripe login`
3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`)
5. Update `STRIPE_WEBHOOK_SECRET` in `.env`
6. Restart your development server

**Test:**
1. Complete a test payment (follow steps from Test 1)
2. Watch the Stripe CLI terminal for webhook events

**Expected Results:**
- Webhook receives `checkout.session.completed` event
- Enrollment is created in database
- Purchase status updated to `COMPLETED`
- Console logs show: "Payment completed for purchase [id]"

### 5. Test Free Course Enrollment

**Steps:**
1. Navigate to a free course (price = 0 or no price)
2. Click "Enroll Now"
3. If not authenticated, sign in

**Expected Results:**
- No payment required
- Immediate enrollment
- Redirected to dashboard
- No Stripe Checkout shown
- Enrollment source is `free`

### 6. Test Unauthenticated Enrollment

**Steps:**
1. Sign out if currently authenticated
2. Navigate to any course page
3. Click "Enroll Now"

**Expected Results:**
- Enrollment intent stored in sessionStorage
- Redirected to `/auth/signin`
- After authentication, enrollment completes automatically
- User redirected to dashboard with enrolled course

## Test Card Numbers

Stripe provides various test cards for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC |

More test cards: https://stripe.com/docs/testing

## Verification Checklist

After testing, verify the following:

### Database Checks
- [ ] Purchase record created with correct amount
- [ ] Purchase status transitions: `PENDING` → `COMPLETED`
- [ ] Enrollment record created with correct user and course IDs
- [ ] Enrollment source is `purchase`
- [ ] Enrollment status is `ACTIVE`
- [ ] Purchase and enrollment are linked via `purchaseId`

### API Checks
- [ ] `/api/enrollments` POST returns `requiresPayment: true` for paid courses
- [ ] `/api/enrollments` POST returns `purchaseId` for paid courses
- [ ] `/api/payments/stripe/checkout` POST creates Stripe session
- [ ] `/api/payments/stripe/checkout` POST returns `sessionId` and `url`
- [ ] `/api/webhooks/stripe` POST handles `checkout.session.completed`
- [ ] Webhook signature verification works

### UI Checks
- [ ] Enrollment modal shows correct price
- [ ] Loading states display during processing
- [ ] Error messages display for failed payments
- [ ] Success message displays after enrollment
- [ ] Dashboard shows enrolled course
- [ ] Course progress tracking works

## Troubleshooting

### Webhook Not Receiving Events

**Problem:** Webhook handler not receiving events from Stripe

**Solutions:**
1. Verify Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Check `STRIPE_WEBHOOK_SECRET` matches the CLI output
3. Restart development server after updating `.env`
4. Check firewall/network settings

### Payment Succeeds But No Enrollment

**Problem:** Payment completes but enrollment not created

**Solutions:**
1. Check webhook handler logs for errors
2. Verify database connection is working
3. Check Prisma schema includes all required models
4. Verify `purchaseId` in webhook metadata matches database

### Stripe Checkout Not Loading

**Problem:** Redirect to Stripe fails or shows error

**Solutions:**
1. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
2. Check browser console for errors
3. Verify Stripe SDK is installed: `npm list stripe @stripe/stripe-js`
4. Check network tab for failed API calls

### Type Errors in TypeScript

**Problem:** TypeScript errors in Stripe integration code

**Solutions:**
1. Verify Stripe types are installed: `npm list @types/stripe`
2. Update Stripe SDK: `npm update stripe @stripe/stripe-js`
3. Check Stripe API version matches SDK version

## Production Deployment

Before deploying to production:

1. **Switch to Live Mode Keys**
   - Replace test keys with live keys from Stripe Dashboard
   - Live keys start with `pk_live_` and `sk_live_`

2. **Configure Production Webhook**
   - In Stripe Dashboard, go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy webhook signing secret to production environment

3. **Test in Production**
   - Use real card for small amount test
   - Verify webhook receives events
   - Check enrollment creation
   - Test refund process

4. **Security Checklist**
   - [ ] All Stripe keys in environment variables (not in code)
   - [ ] Webhook signature verification enabled
   - [ ] HTTPS enabled for all endpoints
   - [ ] Rate limiting configured
   - [ ] Error logging configured
   - [ ] PCI compliance reviewed

## Additional Resources

- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Support

If you encounter issues not covered in this guide:

1. Check Stripe Dashboard logs for payment details
2. Review application logs for errors
3. Check Stripe CLI output for webhook events
4. Consult Stripe documentation
5. Contact Stripe support if needed
