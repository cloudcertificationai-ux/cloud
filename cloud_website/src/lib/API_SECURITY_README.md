# API Security Infrastructure

This document explains how to use the API security infrastructure implemented for the anywheredoor application.

## Overview

The API security infrastructure provides:

1. **API Key Management** - Generate, verify, and rotate API keys
2. **Request Signing** - HMAC-based request signing to prevent tampering
3. **Rate Limiting** - Redis-based rate limiting to prevent abuse
4. **CORS Policies** - Cross-Origin Resource Sharing configuration

## Components

### 1. API Key Management (`api-keys.ts`)

Generate and manage API keys for external applications (like the admin panel).

#### Creating an API Key

```typescript
import { createApiKey } from '@/lib/api-keys'

// Create a new API key
const { apiKey, apiSecret, record } = await createApiKey(
  'Admin Panel Production',
  365 // Expires in 365 days (optional)
)

console.log('API Key:', apiKey) // Save this securely!
console.log('API Secret:', apiSecret) // Save this securely!
```

**Important:** The API key and secret are only shown once during creation. Store them securely!

#### Verifying an API Key

```typescript
import { verifyApiKey } from '@/lib/api-keys'

const keyRecord = await verifyApiKey(apiKey)
if (keyRecord) {
  console.log('Valid API key:', keyRecord.keyName)
} else {
  console.log('Invalid or expired API key')
}
```

#### Rotating an API Key

```typescript
import { rotateApiKey } from '@/lib/api-keys'

const newKey = await rotateApiKey(
  oldApiKey,
  'Admin Panel Production (Rotated)',
  365
)

if (newKey) {
  console.log('New API Key:', newKey.apiKey)
  console.log('New API Secret:', newKey.apiSecret)
}
```

### 2. Request Signing (`api-security.ts`)

Sign requests using HMAC-SHA256 to ensure integrity and authenticity.

#### Client-Side: Signing Requests

```typescript
import { signRequest } from '@/lib/api-security'

// Sign a GET request
const { headers } = signRequest(
  'GET',
  '/api/admin/students',
  apiKey,
  apiSecret
)

// Make the request
const response = await fetch('https://api.example.com/api/admin/students', {
  method: 'GET',
  headers: {
    ...headers,
    'Content-Type': 'application/json',
  },
})

// Sign a POST request with body
const body = { name: 'John Doe', email: 'john@example.com' }
const { headers: postHeaders } = signRequest(
  'POST',
  '/api/admin/students',
  apiKey,
  apiSecret,
  body
)

const postResponse = await fetch('https://api.example.com/api/admin/students', {
  method: 'POST',
  headers: {
    ...postHeaders,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})
```

#### Server-Side: Verifying Requests

```typescript
import { withApiAuth } from '@/lib/api-security'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return withApiAuth(request, async (req, apiKey) => {
    // Request is authenticated and verified
    console.log('Request from:', apiKey.keyName)
    
    // Your handler logic here
    return NextResponse.json({ message: 'Success' })
  })
}
```

### 3. Rate Limiting (`rate-limiter.ts`)

Protect API endpoints from abuse using Redis-based rate limiting.

#### Configuration

Set up Redis connection in `.env`:

```env
REDIS_URL=redis://localhost:6379
# Or for production:
REDIS_URL=redis://username:password@redis-host:6379
```

#### Using Rate Limiting

```typescript
import { withRateLimit } from '@/lib/rate-limiter'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    // Your handler logic here
    return NextResponse.json({ message: 'Success' })
  })
}
```

#### Custom Rate Limits

Edit `RATE_LIMIT_CONFIGS` in `rate-limiter.ts`:

```typescript
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/admin/students': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  // Add more endpoints...
}
```

#### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000000
```

### 4. CORS Policies (`cors.ts`)

Configure Cross-Origin Resource Sharing for API endpoints.

#### Configuration

Set allowed origins in `.env`:

```env
NEXT_PUBLIC_APP_URL=https://app.example.com
ADMIN_PANEL_URL=https://admin.example.com
ALLOWED_ORIGINS=https://partner1.com,https://partner2.com
```

#### Using CORS

```typescript
import { withCors, ADMIN_API_CORS_CONFIG } from '@/lib/cors'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return withCors(
    async (req) => {
      // Your handler logic here
      return NextResponse.json({ message: 'Success' })
    },
    ADMIN_API_CORS_CONFIG // Use appropriate config
  )(request)
}
```

#### CORS Configurations

- `DEFAULT_CORS_CONFIG` - Default configuration for all API routes
- `ADMIN_API_CORS_CONFIG` - Restrictive config for admin routes
- `PUBLIC_API_CORS_CONFIG` - Permissive config for public routes

## Complete Example

Here's a complete example combining all security features:

```typescript
// src/app/api/admin/students/route.ts
import { NextRequest } from 'next/server'
import { withApiAuth, apiSuccessResponse, apiErrorResponse } from '@/lib/api-security'
import { withRateLimit } from '@/lib/rate-limiter'
import { withCors, ADMIN_API_CORS_CONFIG } from '@/lib/cors'
import { prisma } from '@/lib/db'

async function handleGetStudents(request: NextRequest) {
  try {
    const students = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return apiSuccessResponse({ students })
  } catch (error) {
    return apiErrorResponse('Failed to fetch students', 500)
  }
}

export async function GET(request: NextRequest) {
  // Apply middleware: CORS -> Rate Limiting -> API Auth -> Handler
  return withCors(
    async (req) =>
      withRateLimit(req, async (req) =>
        withApiAuth(req, async (req, apiKey) => {
          return handleGetStudents(req)
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}
```

## Security Best Practices

1. **Store API Keys Securely**
   - Never commit API keys to version control
   - Use environment variables or secret management services
   - Rotate keys regularly (every 90-365 days)

2. **Use HTTPS**
   - Always use HTTPS in production
   - API keys and signatures are not secure over HTTP

3. **Monitor Rate Limits**
   - Set up alerts for rate limit violations
   - Adjust limits based on usage patterns

4. **Validate Input**
   - Always validate request parameters
   - Use schema validation libraries (e.g., Zod)

5. **Log Security Events**
   - Log all authentication failures
   - Monitor for suspicious patterns
   - Use the audit log system

## Troubleshooting

### Redis Connection Issues

If rate limiting fails, the system "fails open" (allows requests). Check:

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check Redis logs
docker logs redis-container
```

### Signature Verification Failures

Common causes:
- Clock skew between client and server (check timestamps)
- Body modification after signing
- Incorrect API secret
- URL encoding issues

### CORS Errors

Check:
- Origin is in `ALLOWED_ORIGINS` environment variable
- Preflight requests (OPTIONS) are handled
- Credentials are configured correctly

## Environment Variables

Required environment variables:

```env
# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379

# CORS
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_PANEL_URL=http://localhost:3001
ALLOWED_ORIGINS=https://example.com,https://partner.com

# Admin-specific origins
ADMIN_ALLOWED_ORIGINS=https://admin.example.com
```

## Testing

### Generate Test API Key

```typescript
// scripts/generate-api-key.ts
import { createApiKey } from '@/lib/api-keys'

async function main() {
  const { apiKey, apiSecret } = await createApiKey('Test Key', 30)
  console.log('API Key:', apiKey)
  console.log('API Secret:', apiSecret)
}

main()
```

### Test Request Signing

```typescript
// scripts/test-api-request.ts
import { signRequest } from '@/lib/api-security'

const { headers } = signRequest(
  'GET',
  '/api/admin/students',
  process.env.TEST_API_KEY!,
  process.env.TEST_API_SECRET!
)

console.log('Headers:', headers)
```

## Migration Guide

### For Existing API Routes

1. Add security middleware to your route:

```typescript
// Before
export async function GET(request: NextRequest) {
  // Your logic
}

// After
export async function GET(request: NextRequest) {
  return withCors(
    async (req) =>
      withRateLimit(req, async (req) =>
        withApiAuth(req, async (req, apiKey) => {
          // Your logic
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}
```

2. Update client code to sign requests
3. Generate and distribute API keys
4. Test thoroughly before deploying

## Support

For issues or questions:
- Check the troubleshooting section
- Review the implementation in `src/lib/`
- Consult the design document
