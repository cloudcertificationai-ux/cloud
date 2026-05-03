// src/middleware.ts — cloud_website (student app)
// Runs on every request in Edge Runtime.
// Responsibilities:
//   1. Protect auth-required routes (/dashboard, /profile, /courses/*/learn)
//   2. Add security headers to every response
//   3. Block preflight CORS for locked-down API routes
//   4. Redirect already-authenticated users away from /auth/signin

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── Security headers added to every response ─────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// ─── Routes that require an authenticated session ─────────────────────────────
// These are checked in the `authorized` callback — unauthenticated users are
// redirected to /auth/signin?callbackUrl=<original-url>
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/courses/',   // /courses/[slug]/learn — course learning player
]

// Sub-paths under /courses/ that specifically need auth
const PROTECTED_COURSE_PATTERNS = ['/learn', '/access-restricted']

function isProtectedRoute(pathname: string): boolean {
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
    return true
  }
  // Only the /learn and certain sub-pages of a course need auth
  if (pathname.startsWith('/courses/')) {
    return PROTECTED_COURSE_PATTERNS.some((sub) => pathname.includes(sub))
  }
  return false
}

export default withAuth(
  async function middleware(req: NextRequest) {
    const response = NextResponse.next()

    // ── Security headers ────────────────────────────────────────────────────
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    const { pathname } = req.nextUrl

    // ── CORS for API routes ─────────────────────────────────────────────────
    if (pathname.startsWith('/api/')) {
      const origin = req.headers.get('origin')
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        process.env.ADMIN_PANEL_URL || 'http://localhost:3001',
      ]

      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Requested-With')
      }

      // Handle OPTIONS preflight
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204, headers: response.headers })
      }
    }

    // ── Redirect signed-in users away from /auth/signin ─────────────────────
    const token = (req as any).nextauth?.token
    if (pathname === '/auth/signin' && token) {
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') || '/dashboard'
      return NextResponse.redirect(new URL(callbackUrl, req.url))
    }

    return response
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl

        // Auth pages are always accessible (even unauthenticated)
        if (pathname.startsWith('/auth/')) return true

        // API routes handle their own auth
        if (pathname.startsWith('/api/')) return true

        // Public pages
        if (!isProtectedRoute(pathname)) return true

        // Protected routes require a valid session token
        return !!token
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
  }
)

export const config = {
  // Run middleware on all paths EXCEPT Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)).*)',
  ],
}
