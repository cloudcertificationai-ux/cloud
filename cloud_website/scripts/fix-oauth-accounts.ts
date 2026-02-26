#!/usr/bin/env tsx
/**
 * Fix OAuth Account Linking Issues
 * 
 * This script cleans up duplicate or broken OAuth account records
 * that cause the "OAuthAccountNotLinked" error.
 * 
 * Usage:
 *   npx tsx scripts/fix-oauth-accounts.ts
 */

import prisma from '../src/lib/db'

async function main() {
  console.log('🔍 Checking for OAuth account issues...\n')

  // Find all users with their accounts
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
    },
  })

  console.log(`Found ${users.length} users\n`)

  let fixedCount = 0
  let issuesFound = 0

  for (const user of users) {
    if (user.accounts.length === 0) {
      console.log(`⚠️  User ${user.email} has no linked accounts`)
      issuesFound++
      continue
    }

    // Check for duplicate provider accounts
    const providerCounts = new Map<string, number>()
    for (const account of user.accounts) {
      const key = `${account.provider}-${account.providerAccountId}`
      providerCounts.set(key, (providerCounts.get(key) || 0) + 1)
    }

    // Find duplicates
    const duplicates = Array.from(providerCounts.entries()).filter(([_, count]) => count > 1)
    
    if (duplicates.length > 0) {
      console.log(`❌ User ${user.email} has duplicate accounts:`)
      for (const [key, count] of duplicates) {
        console.log(`   - ${key}: ${count} duplicates`)
      }
      issuesFound++

      // Keep only the most recent account for each provider
      for (const [key] of duplicates) {
        const [provider, providerAccountId] = key.split('-')
        const accounts = user.accounts.filter(
          a => a.provider === provider && a.providerAccountId === providerAccountId
        )

        // Sort by ID (newer accounts have later IDs)
        accounts.sort((a, b) => a.id.localeCompare(b.id))

        // Delete all but the last one
        const toDelete = accounts.slice(0, -1)
        for (const account of toDelete) {
          await prisma.account.delete({
            where: { id: account.id },
          })
          console.log(`   ✅ Deleted duplicate account ${account.id}`)
          fixedCount++
        }
      }
    }
  }

  // Check for orphaned accounts (accounts without users)
  const allAccounts = await prisma.account.findMany({
    include: {
      user: true
    }
  })
  
  const orphanedAccounts = allAccounts.filter(account => !account.user)

  if (orphanedAccounts.length > 0) {
    console.log(`\n⚠️  Found ${orphanedAccounts.length} orphaned accounts`)
    for (const account of orphanedAccounts) {
      await prisma.account.delete({
        where: { id: account.id },
      })
      console.log(`   ✅ Deleted orphaned account ${account.id}`)
      fixedCount++
    }
    issuesFound += orphanedAccounts.length
  }

  console.log('\n' + '='.repeat(50))
  console.log(`\n📊 Summary:`)
  console.log(`   - Total users: ${users.length}`)
  console.log(`   - Issues found: ${issuesFound}`)
  console.log(`   - Accounts fixed: ${fixedCount}`)
  
  if (issuesFound === 0) {
    console.log('\n✅ No issues found! Your OAuth accounts are clean.')
  } else if (fixedCount > 0) {
    console.log('\n✅ All issues have been fixed!')
    console.log('   Users should now be able to sign in without errors.')
  } else {
    console.log('\n⚠️  Issues found but could not be automatically fixed.')
    console.log('   Please check the logs above and fix manually.')
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
