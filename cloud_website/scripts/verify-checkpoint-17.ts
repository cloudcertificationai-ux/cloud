#!/usr/bin/env tsx
/**
 * Checkpoint 17 Verification Script
 * 
 * This script manually verifies:
 * 1. Admin API endpoints exist and are properly structured
 * 2. Data synchronization mechanisms are in place
 * 3. Audit logging is implemented
 * 4. API security measures are configured
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface CheckResult {
  name: string
  passed: boolean
  details: string
}

const results: CheckResult[] = []

function check(name: string, condition: boolean, details: string) {
  results.push({ name, passed: condition, details })
  const status = condition ? '✅' : '❌'
  console.log(`${status} ${name}`)
  if (!condition) {
    console.log(`   ${details}`)
  }
}

function fileExists(path: string): boolean {
  return existsSync(join(process.cwd(), path))
}

function fileContains(path: string, searchString: string): boolean {
  try {
    const content = readFileSync(join(process.cwd(), path), 'utf-8')
    return content.includes(searchString)
  } catch {
    return false
  }
}

console.log('\n🔍 Checkpoint 17: API and Synchronization Verification\n')
console.log('=' .repeat(60))

// 1. Admin API Endpoints
console.log('\n📡 1. Admin API Endpoints')
console.log('-'.repeat(60))

check(
  'Students API endpoint exists',
  fileExists('src/app/api/admin/students/route.ts'),
  'File src/app/api/admin/students/route.ts not found'
)

check(
  'Students API has GET handler',
  fileContains('src/app/api/admin/students/route.ts', 'export async function GET'),
  'GET handler not found in students API'
)

check(
  'Students API has pagination',
  fileContains('src/app/api/admin/students/route.ts', 'page') &&
  fileContains('src/app/api/admin/students/route.ts', 'limit'),
  'Pagination parameters not found'
)

check(
  'Students API has search functionality',
  fileContains('src/app/api/admin/students/route.ts', 'search'),
  'Search functionality not found'
)

check(
  'Enrollments API endpoint exists',
  fileExists('src/app/api/admin/enrollments/route.ts'),
  'File src/app/api/admin/enrollments/route.ts not found'
)

check(
  'Enrollments API has GET handler',
  fileContains('src/app/api/admin/enrollments/route.ts', 'export async function GET'),
  'GET handler not found in enrollments API'
)

check(
  'Enrollments API has POST handler',
  fileContains('src/app/api/admin/enrollments/route.ts', 'export async function POST'),
  'POST handler not found in enrollments API'
)

check(
  'Enrollments API has filtering',
  fileContains('src/app/api/admin/enrollments/route.ts', 'userId') &&
  fileContains('src/app/api/admin/enrollments/route.ts', 'courseId'),
  'Filtering parameters not found'
)

check(
  'Analytics enrollment endpoint exists',
  fileExists('src/app/api/admin/analytics/enrollments/route.ts'),
  'File src/app/api/admin/analytics/enrollments/route.ts not found'
)

check(
  'Analytics students endpoint exists',
  fileExists('src/app/api/admin/analytics/students/route.ts'),
  'File src/app/api/admin/analytics/students/route.ts not found'
)

check(
  'Analytics has aggregation logic',
  fileContains('src/app/api/admin/analytics/enrollments/route.ts', 'groupBy') ||
  fileContains('src/app/api/admin/analytics/enrollments/route.ts', '_count'),
  'Aggregation logic not found in analytics'
)

// 2. Data Synchronization
console.log('\n🔄 2. Data Synchronization')
console.log('-'.repeat(60))

check(
  'Sync service exists',
  fileExists('src/lib/sync-service.ts'),
  'File src/lib/sync-service.ts not found'
)

check(
  'Sync service has SyncService class',
  fileContains('src/lib/sync-service.ts', 'export class SyncService'),
  'SyncService class not found'
)

check(
  'Sync service has enrollment event emission',
  fileContains('src/lib/sync-service.ts', 'emitEnrollmentEvent'),
  'emitEnrollmentEvent method not found'
)

check(
  'Sync service has profile event emission',
  fileContains('src/lib/sync-service.ts', 'emitProfileEvent'),
  'emitProfileEvent method not found'
)

check(
  'Sync service has progress event emission',
  fileContains('src/lib/sync-service.ts', 'emitProgressEvent'),
  'emitProgressEvent method not found'
)

check(
  'Sync service has queue processing',
  fileContains('src/lib/sync-service.ts', 'processQueue'),
  'processQueue method not found'
)

check(
  'Sync service has retry logic',
  fileContains('src/lib/sync-service.ts', 'retry') ||
  fileContains('src/lib/sync-service.ts', 'attempts'),
  'Retry logic not found'
)

check(
  'Sync service has immediate sync methods',
  fileContains('src/lib/sync-service.ts', 'syncEnrollmentNow') &&
  fileContains('src/lib/sync-service.ts', 'syncProfileNow'),
  'Immediate sync methods not found'
)

check(
  'Webhook endpoints exist',
  fileExists('src/app/api/webhooks/enrollment-changed/route.ts') ||
  fileExists('src/app/api/webhooks/profile-updated/route.ts'),
  'Webhook endpoints not found'
)

// 3. Audit Logging
console.log('\n📝 3. Audit Logging')
console.log('-'.repeat(60))

check(
  'Audit logger exists',
  fileExists('src/lib/audit-logger.ts'),
  'File src/lib/audit-logger.ts not found'
)

check(
  'Audit logger has logAuditEvent function',
  fileContains('src/lib/audit-logger.ts', 'logAuditEvent') ||
  fileContains('src/lib/audit-logger.ts', 'createAuditLog'),
  'logAuditEvent function not found'
)

check(
  'Audit logger has query function',
  fileContains('src/lib/audit-logger.ts', 'queryAuditLogs') ||
  fileContains('src/lib/audit-logger.ts', 'getAuditLogs'),
  'queryAuditLogs function not found'
)

check(
  'Audit logs API endpoint exists',
  fileExists('src/app/api/admin/audit-logs/route.ts'),
  'File src/app/api/admin/audit-logs/route.ts not found'
)

check(
  'Audit logs API has filtering',
  fileContains('src/app/api/admin/audit-logs/route.ts', 'action') &&
  fileContains('src/app/api/admin/audit-logs/route.ts', 'userId'),
  'Filtering parameters not found in audit logs API'
)

check(
  'Audit logs API has date range filtering',
  fileContains('src/app/api/admin/audit-logs/route.ts', 'startDate') ||
  fileContains('src/app/api/admin/audit-logs/route.ts', 'endDate'),
  'Date range filtering not found'
)

check(
  'Enrollment API logs audit events',
  fileContains('src/app/api/admin/enrollments/route.ts', 'auditLog') ||
  fileContains('src/app/api/admin/enrollments/route.ts', 'logAuditEvent'),
  'Audit logging not found in enrollment API'
)

// 4. API Security Measures
console.log('\n🔒 4. API Security Measures')
console.log('-'.repeat(60))

check(
  'API security module exists',
  fileExists('src/lib/api-security.ts'),
  'File src/lib/api-security.ts not found'
)

check(
  'API security has signature generation',
  fileContains('src/lib/api-security.ts', 'generateSignature'),
  'generateSignature function not found'
)

check(
  'API security has signature verification',
  fileContains('src/lib/api-security.ts', 'verifySignature'),
  'verifySignature function not found'
)

check(
  'API security has timestamp validation',
  fileContains('src/lib/api-security.ts', 'verifyTimestamp'),
  'verifyTimestamp function not found'
)

check(
  'API security has HMAC implementation',
  fileContains('src/lib/api-security.ts', 'hmac') ||
  fileContains('src/lib/api-security.ts', 'createHmac'),
  'HMAC implementation not found'
)

check(
  'API security has withApiAuth middleware',
  fileContains('src/lib/api-security.ts', 'withApiAuth'),
  'withApiAuth middleware not found'
)

check(
  'Rate limiter exists',
  fileExists('src/lib/rate-limiter.ts'),
  'File src/lib/rate-limiter.ts not found'
)

check(
  'Rate limiter has RateLimiter class',
  fileContains('src/lib/rate-limiter.ts', 'class RateLimiter') ||
  fileContains('src/lib/rate-limiter.ts', 'export class RateLimiter'),
  'RateLimiter class not found'
)

check(
  'Rate limiter has checkRateLimit method',
  fileContains('src/lib/rate-limiter.ts', 'checkRateLimit'),
  'checkRateLimit method not found'
)

check(
  'Rate limiter has withRateLimit middleware',
  fileContains('src/lib/rate-limiter.ts', 'withRateLimit'),
  'withRateLimit middleware not found'
)

check(
  'Rate limiter uses Redis',
  fileContains('src/lib/rate-limiter.ts', 'Redis') ||
  fileContains('src/lib/rate-limiter.ts', 'redis'),
  'Redis integration not found'
)

check(
  'CORS module exists',
  fileExists('src/lib/cors.ts'),
  'File src/lib/cors.ts not found'
)

check(
  'CORS has configuration',
  fileContains('src/lib/cors.ts', 'CorsConfig') ||
  fileContains('src/lib/cors.ts', 'CORS_CONFIG'),
  'CORS configuration not found'
)

check(
  'CORS has origin validation',
  fileContains('src/lib/cors.ts', 'isOriginAllowed') ||
  fileContains('src/lib/cors.ts', 'allowedOrigins'),
  'Origin validation not found'
)

check(
  'CORS has withCors middleware',
  fileContains('src/lib/cors.ts', 'withCors'),
  'withCors middleware not found'
)

check(
  'CORS has preflight handling',
  fileContains('src/lib/cors.ts', 'OPTIONS') ||
  fileContains('src/lib/cors.ts', 'preflight'),
  'Preflight handling not found'
)

check(
  'API keys module exists',
  fileExists('src/lib/api-keys.ts'),
  'File src/lib/api-keys.ts not found'
)

check(
  'API keys has verification function',
  fileContains('src/lib/api-keys.ts', 'verifyApiKey') ||
  fileContains('src/lib/api-keys.ts', 'validateApiKey'),
  'API key verification function not found'
)

check(
  'Admin API uses security middleware',
  fileContains('src/app/api/admin/students/route.ts', 'withApiAuth') &&
  fileContains('src/app/api/admin/students/route.ts', 'withRateLimit') &&
  fileContains('src/app/api/admin/students/route.ts', 'withCors'),
  'Security middleware not applied to admin API'
)

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 Summary')
console.log('='.repeat(60))

const passed = results.filter(r => r.passed).length
const failed = results.filter(r => !r.passed).length
const total = results.length

console.log(`\nTotal checks: ${total}`)
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`Success rate: ${Math.round((passed / total) * 100)}%`)

if (failed > 0) {
  console.log('\n⚠️  Some checks failed. Please review the details above.')
  process.exit(1)
} else {
  console.log('\n✨ All checks passed! Checkpoint 17 verification complete.')
  process.exit(0)
}
