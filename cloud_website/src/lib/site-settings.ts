// src/lib/site-settings.ts
// Read site settings from the shared database using raw SQL
// (SiteSetting model uses raw queries until prisma generate is run with updated schema)

import prisma from '@/lib/db'

export type SettingKey =
  | 'stripe_enabled'
  | 'stripe_publishable_key'
  | 'stripe_secret_key'
  | 'stripe_webhook_secret'
  | 'paypal_enabled'
  | 'paypal_client_id'
  | 'paypal_client_secret'
  | 'paypal_mode'
  | 'razorpay_enabled'
  | 'razorpay_key_id'
  | 'razorpay_key_secret'
  | 'razorpay_webhook_secret'
  | 'site_name'
  | 'site_description'
  | 'maintenance_mode'
  | 'allow_registration'
  | 'email_notifications'
  | 'sms_notifications'

const DEFAULT_SETTINGS: Record<SettingKey, string> = {
  stripe_enabled: 'false',
  stripe_publishable_key: '',
  stripe_secret_key: '',
  stripe_webhook_secret: '',
  paypal_enabled: 'false',
  paypal_client_id: '',
  paypal_client_secret: '',
  paypal_mode: 'sandbox',
  razorpay_enabled: 'false',
  razorpay_key_id: '',
  razorpay_key_secret: '',
  razorpay_webhook_secret: '',
  site_name: 'Cloud Certification',
  site_description: 'Learn anywhere, anytime',
  maintenance_mode: 'false',
  allow_registration: 'true',
  email_notifications: 'true',
  sms_notifications: 'false',
}

interface RawSetting {
  key: string;
  value: string | null;
}

/**
 * Get a single setting value (server-side only)
 */
export async function getSetting(key: SettingKey): Promise<string> {
  try {
    const rows = await prisma.$queryRawUnsafe<RawSetting[]>(
      `SELECT key, value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
      key
    )
    return rows[0]?.value ?? DEFAULT_SETTINGS[key] ?? ''
  } catch {
    return DEFAULT_SETTINGS[key] ?? ''
  }
}

/**
 * Get multiple settings at once
 */
export async function getSettings(keys: SettingKey[]): Promise<Record<SettingKey, string>> {
  const result: Record<string, string> = { ...DEFAULT_SETTINGS }
  try {
    if (keys.length === 0) return result as Record<SettingKey, string>

    // Build parameterized query
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
    const rows = await prisma.$queryRawUnsafe<RawSetting[]>(
      `SELECT key, value FROM "SiteSetting" WHERE key IN (${placeholders})`,
      ...keys
    )
    for (const row of rows) {
      result[row.key] = row.value ?? ''
    }
  } catch {
    // Return defaults if DB not available
  }
  return result as Record<SettingKey, string>
}

/**
 * Get payment gateway config (server-side only, includes secrets)
 */
export async function getPaymentConfig() {
  const settings = await getSettings([
    'stripe_enabled',
    'stripe_publishable_key',
    'stripe_secret_key',
    'stripe_webhook_secret',
    'paypal_enabled',
    'paypal_client_id',
    'paypal_client_secret',
    'paypal_mode',
    'razorpay_enabled',
    'razorpay_key_id',
    'razorpay_key_secret',
    'razorpay_webhook_secret',
  ])

  return {
    stripe: {
      enabled: settings.stripe_enabled === 'true',
      publishableKey: settings.stripe_publishable_key || process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      secretKey: settings.stripe_secret_key || process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: settings.stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    paypal: {
      enabled: settings.paypal_enabled === 'true',
      clientId: settings.paypal_client_id || process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: settings.paypal_client_secret || process.env.PAYPAL_CLIENT_SECRET || '',
      mode: (settings.paypal_mode as 'sandbox' | 'live') || (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox',
    },
    razorpay: {
      enabled: settings.razorpay_enabled === 'true',
      keyId: settings.razorpay_key_id || process.env.RAZORPAY_KEY_ID || '',
      keySecret: settings.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: settings.razorpay_webhook_secret || process.env.RAZORPAY_WEBHOOK_SECRET || '',
    },
  }
}

/**
 * Get public payment config (safe for client — no secrets)
 */
export async function getPublicPaymentConfig() {
  const config = await getPaymentConfig()
  return {
    stripe: {
      enabled: config.stripe.enabled,
      publishableKey: config.stripe.publishableKey,
    },
    paypal: {
      enabled: config.paypal.enabled,
      clientId: config.paypal.clientId,
      mode: config.paypal.mode,
    },
    razorpay: {
      enabled: config.razorpay.enabled,
      keyId: config.razorpay.keyId,
    },
  }
}
