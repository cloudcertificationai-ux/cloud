#!/usr/bin/env node
// scripts/setup-db-settings.mjs
// Run this to create the SiteSetting table and seed default values
// Usage: node scripts/setup-db-settings.mjs

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load env
const fs = await import('fs');
const path = await import('path');

// Read .env file manually
const envPath = new URL('../.env', import.meta.url);
if (fs.default.existsSync(envPath)) {
  const envContent = fs.default.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

console.log('Setting up SiteSetting table...');
console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 40) + '...');

// Use Prisma to run the migration
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setup() {
  try {
    // Create SiteSetting table
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
    `);
    console.log('✓ SiteSetting table created/verified');

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SiteSetting_key_idx" ON "SiteSetting"("key")
    `);
    console.log('✓ Indexes created/verified');

    // Seed default settings
    const defaults = [
      ['stripe_enabled', 'false', 'Enable Stripe payment gateway'],
      ['stripe_publishable_key', '', 'Stripe publishable key (pk_...)'],
      ['stripe_secret_key', '', 'Stripe secret key (sk_...)'],
      ['stripe_webhook_secret', '', 'Stripe webhook signing secret'],
      ['paypal_enabled', 'false', 'Enable PayPal payment gateway'],
      ['paypal_client_id', '', 'PayPal client ID'],
      ['paypal_client_secret', '', 'PayPal client secret'],
      ['paypal_mode', 'sandbox', 'PayPal mode: sandbox or live'],
      ['razorpay_enabled', 'false', 'Enable Razorpay payment gateway'],
      ['razorpay_key_id', '', 'Razorpay Key ID'],
      ['razorpay_key_secret', '', 'Razorpay Key Secret'],
      ['razorpay_webhook_secret', '', 'Razorpay Webhook Secret'],
      ['site_name', 'Cloud Certification', 'Site name'],
      ['site_description', 'Learn anywhere, anytime', 'Site description'],
      ['contact_email', 'contact@cloudcertification.com', 'Contact email'],
      ['support_email', 'support@cloudcertification.com', 'Support email'],
      ['maintenance_mode', 'false', 'Enable maintenance mode'],
      ['allow_registration', 'true', 'Allow new user registration'],
      ['email_notifications', 'true', 'Send email notifications'],
      ['sms_notifications', 'false', 'Send SMS notifications'],
    ];

    let inserted = 0;
    for (const [key, value, description] of defaults) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "SiteSetting" (id, key, value, description, "createdAt", "updatedAt")
          VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW())
          ON CONFLICT (key) DO NOTHING
        `, key, value, description);
        inserted++;
      } catch (e) {
        console.warn(`  Warning for key "${key}":`, e.message);
      }
    }
    console.log(`✓ Seeded ${inserted} default settings`);

    // Verify
    const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "SiteSetting"`);
    console.log(`✓ Total settings in DB: ${count[0].count}`);

    console.log('\n✅ Setup complete! Open the admin panel → Settings to configure payment gateways.');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

setup();
