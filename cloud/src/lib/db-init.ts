// src/lib/db-init.ts
// Auto-creates SiteSetting table if not present. Called on first API request.

import prisma from '@/lib/db'

let initialized = false

export async function ensureDatabaseTables(): Promise<void> {
  if (initialized) return
  initialized = true

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
    console.log('[db-init] SiteSetting table ready')
  } catch (err) {
    // Non-critical: table likely already exists
    const msg = (err as Error).message?.substring(0, 80)
    if (!msg?.includes('already exists')) {
      console.warn('[db-init]', msg)
    }
  }
}
