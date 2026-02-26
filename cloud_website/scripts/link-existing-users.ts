#!/usr/bin/env tsx
/**
 * Link Existing Users to Auth0 Accounts
 * 
 * This script creates Account records for users who authenticated
 * but don't have linked accounts (the root cause of the login loop).
 * 
 * Usage:
 *   npx tsx scripts/link-existing-users.ts
 */

import prisma from '../src/lib/db'

async function main() {
  console.log('🔗 Linking existing users to Auth0 accounts...\n')

  // Find all users without accounts
  const usersWithoutAccounts = await prisma.user.findMany({
    where: {
      accounts: {
        none: {}
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
    }
  })

  if (usersWithoutAccounts.length === 0) {
    console.log('✅ All users already have linked accounts!')
    return
  }

  console.log(`Found ${usersWithoutAccounts.length} users without linked accounts:\n`)
  
  for (const user of usersWithoutAccounts) {
    console.log(`  - ${user.email} (${user.name})`)
  }

  console.log('\n⚠️  WARNING: This script will create Auth0 account links for these users.')
  console.log('⚠️  The providerAccountId will be set to their user ID.')
  console.log('⚠️  They will need to sign in with Auth0/Google again to update it.\n')

  // Create account records for each user
  let linkedCount = 0
  
  for (const user of usersWithoutAccounts) {
    try {
      // Create an Auth0 account link
      // Note: The providerAccountId should ideally come from Auth0, but we'll use
      // the user ID as a placeholder. When they sign in again, it will be updated.
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'auth0',
          providerAccountId: user.id, // Temporary - will be updated on next login
          access_token: null,
          expires_at: null,
          token_type: 'Bearer',
          scope: 'openid profile email',
          id_token: null,
          session_state: null,
        }
      })
      
      console.log(`✅ Linked account for ${user.email}`)
      linkedCount++
    } catch (error: any) {
      console.error(`❌ Failed to link account for ${user.email}:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`\n📊 Summary:`)
  console.log(`   - Users found: ${usersWithoutAccounts.length}`)
  console.log(`   - Accounts linked: ${linkedCount}`)
  
  if (linkedCount > 0) {
    console.log('\n✅ Accounts linked successfully!')
    console.log('\n⚠️  IMPORTANT: Users should sign in again to update their account links.')
    console.log('   This will update the providerAccountId with the correct Auth0 ID.')
  }
  
  console.log('\n' + '='.repeat(50) + '\n')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
