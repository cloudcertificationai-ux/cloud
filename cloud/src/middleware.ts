import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simplified security headers for Edge Runtime compatibility
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

// Simple rate limiting for Edge Runtime
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function simpleRateLimit(ip: string): boolean {
  // Disable rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 1000 // Increased from 100 to 1000 for production
  
  const record = rateLimitStore.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

// Enhanced middleware with Edge Runtime compatibility
export default withAuth(
  async function middleware(req) {
    const response = NextResponse.next()
    
    // Add basic security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                    req.headers.get('x-real-ip') || 
                    'unknown'
    
    // Simple rate limiting
    if (!simpleRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`)
      return new NextResponse('Too Many Requests', { status: 429 })
    }
    
    // CORS for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const origin = req.headers.get('origin')
      
      // Allow specific origins
      const allowedOrigins = [
        process.env.MAIN_WEBSITE_URL,
        process.env.ADMIN_PANEL_URL,
        'http://localhost:3000',
        'http://localhost:3001',
      ].filter(Boolean)
      
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
      }
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, { status: 200, headers: response.headers })
      }
      
      // Simple API key validation for external routes
      if (req.nextUrl.pathname.startsWith('/api/external/')) {
        const apiKey = req.headers.get('x-api-key')
        const expectedKey = process.env.API_SECRET
        
        if (!apiKey || !expectedKey || apiKey !== expectedKey) {
          console.warn(`Invalid API key from IP: ${clientIP}`)
          return new NextResponse('Unauthorized', { status: 401 })
        }
      }
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Require token and ADMIN role for admin routes
        if (req.nextUrl.pathname.startsWith('/admin/')) {
          if (!token) {
            return false
          }
          
          // Check if user has ADMIN role
          const userRole = token.role as string
          if (userRole !== 'ADMIN') {
            console.warn(`Non-admin user attempted to access admin panel: ${token.email}`)
            return false
          }
          
          return true
        }
        
        // Allow API routes (they have their own validation)
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return true
        }
        
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/auth/:path*'
  ],
  runtime: 'nodejs'
}