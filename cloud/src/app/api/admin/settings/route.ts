// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError } from '@/lib/api-errors'
import { getAllSettings, updateSettings, SettingKey } from '@/lib/settings'
import { ensureDatabaseTables } from '@/lib/db-init'

// Bust payment-config cache on the website after settings are saved
async function bustWebsitePaymentCache() {
  const websiteUrl = process.env.MAIN_WEBSITE_URL || process.env.WEBSITE_REVALIDATION_URL || 'http://localhost:3000'
  const secret = process.env.REVALIDATION_SECRET
  if (!secret) return
  fetch(`${websiteUrl}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ tag: 'payment-config' }),
  }).catch(() => {/* non-fatal */})
}

/**
 * GET /api/admin/settings
 * Fetch all site settings
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    await ensureDatabaseTables()
    const settings = await getAllSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/admin/settings
 * Update site settings
 */
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json()

    // Validate and extract settings
    const allowedKeys: SettingKey[] = [
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
      'site_name',
      'site_description',
      'contact_email',
      'support_email',
      'maintenance_mode',
      'allow_registration',
      'email_notifications',
      'sms_notifications',
    ]

    const updates: Partial<Record<SettingKey, string>> = {}
    for (const key of allowedKeys) {
      if (key in body) {
        // Convert boolean values to string
        const val = body[key]
        updates[key] = typeof val === 'boolean' ? String(val) : String(val ?? '')
      }
    }

    await updateSettings(updates)

    // If payment-related keys changed, bust the website's payment config cache
    const paymentKeys: SettingKey[] = [
      'stripe_enabled', 'stripe_publishable_key', 'stripe_secret_key',
      'paypal_enabled', 'paypal_client_id', 'paypal_mode',
      'razorpay_enabled', 'razorpay_key_id',
    ]
    const hasPaymentChanges = paymentKeys.some((k) => k in updates)
    if (hasPaymentChanges) {
      bustWebsitePaymentCache()
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
