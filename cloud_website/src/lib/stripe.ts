import Stripe from 'stripe'

const STRIPE_API_VERSION = '2026-01-28.clover' as const

function isConfiguredSecret(value: string | undefined): value is string {
  return Boolean(value && !value.includes('...'))
}

export function isStripeConfigured(): boolean {
  return isConfiguredSecret(process.env.STRIPE_SECRET_KEY)
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!isConfiguredSecret(key)) {
    throw new Error('Stripe is not configured')
  }

  return new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
  })
}
