// src/lib/api-keys.ts
import { randomBytes, createHash } from 'crypto'
import { prisma } from './db'

/**
 * Generate a cryptographically secure API key
 * Format: ak_live_<32 random hex characters>
 */
export function generateApiKey(): string {
  const randomPart = randomBytes(32).toString('hex')
  return `ak_live_${randomPart}`
}

/**
 * Generate a cryptographically secure API secret
 * Format: sk_live_<64 random hex characters>
 */
export function generateApiSecret(): string {
  const randomPart = randomBytes(64).toString('hex')
  return `sk_live_${randomPart}`
}

/**
 * Hash an API key for secure storage
 * Uses SHA-256 for one-way hashing
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex')
}

/**
 * Create a new API key with associated secret
 * @param keyName - Descriptive name for the API key (e.g., "Admin Panel Production")
 * @param expiresInDays - Optional expiration in days (null for no expiration)
 * @returns Object containing the API key, secret, and database record
 */
export async function createApiKey(
  keyName: string,
  expiresInDays?: number | null
): Promise<{
  apiKey: string
  apiSecret: string
  record: {
    id: string
    keyName: string
    apiKey: string
    createdAt: Date
    expiresAt: Date | null
  }
}> {
  const apiKey = generateApiKey()
  const apiSecret = generateApiSecret()
  const hashedKey = hashApiKey(apiKey)

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null

  const record = await prisma.apiKey.create({
    data: {
      keyName,
      apiKey: hashedKey,
      apiSecret,
      expiresAt,
      isActive: true,
    },
    select: {
      id: true,
      keyName: true,
      apiKey: true,
      createdAt: true,
      expiresAt: true,
    },
  })

  // Return the unhashed key to the caller (only time it's visible)
  return {
    apiKey, // Original unhashed key
    apiSecret,
    record: {
      ...record,
      apiKey: hashedKey, // Hashed version in record
    },
  }
}

/**
 * Verify an API key against the database
 * @param apiKey - The API key to verify
 * @returns The API key record if valid, null otherwise
 */
export async function verifyApiKey(apiKey: string): Promise<{
  id: string
  keyName: string
  apiSecret: string
  expiresAt: Date | null
} | null> {
  const hashedKey = hashApiKey(apiKey)

  const record = await prisma.apiKey.findUnique({
    where: {
      apiKey: hashedKey,
    },
    select: {
      id: true,
      keyName: true,
      apiSecret: true,
      expiresAt: true,
      isActive: true,
    },
  })

  if (!record) {
    return null
  }

  // Check if key is active
  if (!record.isActive) {
    return null
  }

  // Check if key is expired
  if (record.expiresAt && record.expiresAt < new Date()) {
    return null
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: {
      apiKey: hashedKey,
    },
    data: {
      lastUsedAt: new Date(),
    },
  })

  return {
    id: record.id,
    keyName: record.keyName,
    apiSecret: record.apiSecret,
    expiresAt: record.expiresAt,
  }
}

/**
 * Rotate an API key (create new key, deactivate old one)
 * @param oldApiKey - The API key to rotate
 * @param keyName - Name for the new key
 * @param expiresInDays - Optional expiration for new key
 * @returns New API key and secret
 */
export async function rotateApiKey(
  oldApiKey: string,
  keyName: string,
  expiresInDays?: number | null
): Promise<{
  apiKey: string
  apiSecret: string
  record: {
    id: string
    keyName: string
    apiKey: string
    createdAt: Date
    expiresAt: Date | null
  }
} | null> {
  // Verify the old key exists
  const oldKeyRecord = await verifyApiKey(oldApiKey)
  if (!oldKeyRecord) {
    return null
  }

  // Create new key
  const newKey = await createApiKey(keyName, expiresInDays)

  // Deactivate old key
  const hashedOldKey = hashApiKey(oldApiKey)
  await prisma.apiKey.update({
    where: {
      apiKey: hashedOldKey,
    },
    data: {
      isActive: false,
    },
  })

  return newKey
}

/**
 * Revoke an API key (deactivate it)
 * @param apiKey - The API key to revoke
 * @returns True if revoked successfully, false otherwise
 */
export async function revokeApiKey(apiKey: string): Promise<boolean> {
  const hashedKey = hashApiKey(apiKey)

  try {
    await prisma.apiKey.update({
      where: {
        apiKey: hashedKey,
      },
      data: {
        isActive: false,
      },
    })
    return true
  } catch (error) {
    return false
  }
}

/**
 * List all API keys (without secrets)
 * @returns Array of API key records
 */
export async function listApiKeys(): Promise<
  Array<{
    id: string
    keyName: string
    createdAt: Date
    expiresAt: Date | null
    lastUsedAt: Date | null
    isActive: boolean
  }>
> {
  return prisma.apiKey.findMany({
    select: {
      id: true,
      keyName: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Get API key details by ID (without secret)
 * @param id - The API key ID
 * @returns API key record or null
 */
export async function getApiKeyById(id: string): Promise<{
  id: string
  keyName: string
  createdAt: Date
  expiresAt: Date | null
  lastUsedAt: Date | null
  isActive: boolean
} | null> {
  return prisma.apiKey.findUnique({
    where: { id },
    select: {
      id: true,
      keyName: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
      isActive: true,
    },
  })
}
