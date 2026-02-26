// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { handleCorsPreflightRequest, applyCorsHeaders, DEFAULT_CORS_CONFIG, ADMIN_API_CORS_CONFIG } from './lib/cors'
import { getToken } from 'next-auth/jwt'

/**
 * API routes that require CORS
 */
const API_ROUTES = [
  '/api',
]

/**
 * Admin API routes that require stricter CORS
 */
const ADMIN_API_ROUTES = [
  '/api/admin',
]

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
]

/**
 * Auth routes that should redirect if already authenticated
 */
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signout',
]

/**
 * Proxy middleware to handle CORS for API routes and authentication
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle CORS preflight requests for API routes
  const isApiRoute = API_ROUTES.some(route => pathname.startsWith(route))
  const isAdminApiRoute = ADMIN_API_ROUTES.some(route => pathname.startsWith(route))

  if (request.method === 'OPTIONS') {
    if (isAdminApiRoute) {
      return handleCorsPreflightRequest(request, ADMIN_API_CORS_CONFIG)
    } else if (isApiRoute) {
      return handleCorsPreflightRequest(request, DEFAULT_CORS_CONFIG)
    }
  }

  // Apply CORS headers to API responses
  if (isApiRoute) {
    const response = NextResponse.next()
    const corsConfig = isAdminApiRoute ? ADMIN_API_CORS_CONFIG : DEFAULT_CORS_CONFIG
    return applyCorsHeaders(request, response, corsConfig)
  }

  // Check authentication for protected and auth routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

  if (isProtectedRoute || isAuthRoute) {
    // Get the token using next-auth/jwt
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Redirect to signin if accessing protected route without authentication
    if (isProtectedRoute && !token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Redirect to home if accessing auth routes while authenticated
    if (isAuthRoute && token && pathname === '/auth/signin') {
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/'
      return NextResponse.redirect(new URL(callbackUrl, request.url))
    }
  }

  // For all other routes, just continue
  return NextResponse.next()
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
