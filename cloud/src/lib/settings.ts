// src/lib/settings.ts
// Utility functions for reading/writing site settings using raw SQL
// (avoids needing to regenerate Prisma client for new model)

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
  | 'contact_email'
  | 'support_email'
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
  contact_email: 'contact@cloudcertification.com',
  support_email: 'support@cloudcertification.com',
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
 * Ensure SiteSetting table exists
 */
export async function ensureSettingsTable(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SiteSetting" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT,
        "description" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SiteSetting_key_idx" ON "SiteSetting"("key")`)
  } catch {
    // Table already exists or minor error — non-critical
  }
}

/**
 * Get all settings as a key-value map
 */
export async function getAllSettings(): Promise<Record<SettingKey, string>> {
  const result: Record<string, string> = { ...DEFAULT_SETTINGS }
  try {
    await ensureSettingsTable()
    const rows = await prisma.$queryRawUnsafe<RawSetting[]>(`SELECT key, value FROM "SiteSetting"`)
    for (const row of rows) {
      if (row.key in result) {
        result[row.key] = row.value ?? ''
      }
    }
  } catch (err) {
    console.error('Error getting settings:', err)
  }
  return result as Record<SettingKey, string>
}

/**
 * Get a single setting value
 */
export async function getSetting(key: SettingKey): Promise<string> {
  try {
    await ensureSettingsTable()
    const rows = await prisma.$queryRawUnsafe<RawSetting[]>(
      `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`, key
    )
    return rows[0]?.value ?? DEFAULT_SETTINGS[key] ?? ''
  } catch {
    return DEFAULT_SETTINGS[key] ?? ''
  }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(updates: Partial<Record<SettingKey, string>>): Promise<void> {
  await ensureSettingsTable()

  for (const [key, value] of Object.entries(updates)) {
    try {
      const safeValue = value ?? ''
      await prisma.$executeRawUnsafe(`
        INSERT INTO "SiteSetting" (id, key, value, description, "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, $1, NOW(), NOW())
        ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()
      `, key, safeValue)
    } catch (err) {
      console.error(`Error updating setting "${key}":`, err)
    }
  }
}

/**
 * Get public payment config (safe to expose to frontend - no secrets)
 */
export async function getPublicPaymentConfig() {
  const settings = await getAllSettings()

  return {
    stripe: {
      enabled: settings.stripe_enabled === 'true',
      publishableKey: settings.stripe_publishable_key,
    },
    paypal: {
      enabled: settings.paypal_enabled === 'true',
      clientId: settings.paypal_client_id,
      mode: settings.paypal_mode,
    },
    razorpay: {
      enabled: settings.razorpay_enabled === 'true',
      keyId: settings.razorpay_key_id,
    },
  }
}
