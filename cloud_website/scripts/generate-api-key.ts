#!/usr/bin/env tsx
// scripts/generate-api-key.ts
/**
 * Script to generate API keys for external applications
 * 
 * Usage:
 *   npx tsx scripts/generate-api-key.ts "Admin Panel Production" 365
 *   npx tsx scripts/generate-api-key.ts "Test Key" 30
 *   npx tsx scripts/generate-api-key.ts "Partner API"
 */

import { createApiKey, listApiKeys } from '../src/lib/api-keys'

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: npx tsx scripts/generate-api-key.ts <key-name> [expiry-days]')
    console.log('')
    console.log('Examples:')
    console.log('  npx tsx scripts/generate-api-key.ts "Admin Panel Production" 365')
    console.log('  npx tsx scripts/generate-api-key.ts "Test Key" 30')
    console.log('  npx tsx scripts/generate-api-key.ts "Partner API"')
    console.log('')
    console.log('Listing existing API keys...')
    console.log('')
    
    const keys = await listApiKeys()
    if (keys.length === 0) {
      console.log('No API keys found.')
    } else {
      console.table(keys.map(key => ({
        Name: key.keyName,
        Created: key.createdAt.toISOString(),
        Expires: key.expiresAt ? key.expiresAt.toISOString() : 'Never',
        'Last Used': key.lastUsedAt ? key.lastUsedAt.toISOString() : 'Never',
        Active: key.isActive ? '✓' : '✗',
      })))
    }
    
    process.exit(0)
  }

  const keyName = args[0]
  const expiryDays = args[1] ? parseInt(args[1], 10) : null

  if (expiryDays !== null && (isNaN(expiryDays) || expiryDays < 1)) {
    console.error('Error: Expiry days must be a positive number')
    process.exit(1)
  }

  console.log('Generating API key...')
  console.log(`Name: ${keyName}`)
  console.log(`Expires: ${expiryDays ? `${expiryDays} days` : 'Never'}`)
  console.log('')

  try {
    const { apiKey, apiSecret, record } = await createApiKey(keyName, expiryDays)

    console.log('✓ API Key generated successfully!')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  IMPORTANT: Save these credentials securely!')
    console.log('   They will not be shown again.')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('API Key:')
    console.log(apiKey)
    console.log('')
    console.log('API Secret:')
    console.log(apiSecret)
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('Add these to your .env file:')
    console.log('')
    console.log(`API_KEY=${apiKey}`)
    console.log(`API_SECRET=${apiSecret}`)
    console.log('')
    console.log('Key Details:')
    console.log(`  ID: ${record.id}`)
    console.log(`  Name: ${record.keyName}`)
    console.log(`  Created: ${record.createdAt.toISOString()}`)
    console.log(`  Expires: ${record.expiresAt ? record.expiresAt.toISOString() : 'Never'}`)
    console.log('')

  } catch (error) {
    console.error('Error generating API key:', error)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
