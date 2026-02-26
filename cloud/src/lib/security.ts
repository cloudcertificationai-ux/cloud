import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Security configuration
export const SECURITY_CONFIG = {
  JWT_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
  API_SECRET: process.env.API_SECRET || 'admin-api-secret-key',
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
  },
  CORS: {
    allowedOrigins: [
      'http://localhost:3000', // Main website
      'http://localhost:3001', // Admin panel
      process.env.MAIN_WEBSITE_URL || 'https://cloudcertification.com',
      process.env.ADMIN_PANEL_URL || 'https://admin.cloudcertification.com',
    ],
  },
  ENCRYPTION: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
  },
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// API Key validation
export function validateApiKey(apiKey: string): boolean {
  const expectedKey = process.env.API_SECRET
  if (!expectedKey || !apiKey) return false
  
  // Simple comparison for Edge Runtime compatibility
  return apiKey === expectedKey
}

// Generate secure API key
export function generateApiKey(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  // Fallback for environments without crypto
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
}

// Encrypt sensitive data (simplified for Edge Runtime)
export function encryptData(data: string, key?: string): { encrypted: string; iv: string; tag: string } {
  // Simplified encryption for Edge Runtime compatibility
  // In production, use a proper encryption service
  const encoded = btoa(data)
  return {
    encrypted: encoded,
    iv: 'edge-runtime-iv',
    tag: 'edge-runtime-tag',
  }
}

// Decrypt sensitive data (simplified for Edge Runtime)
export function decryptData(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): string {
  // Simplified decryption for Edge Runtime compatibility
  try {
    return atob(encryptedData.encrypted)
  } catch {
    throw new Error('Decryption failed')
  }
}

// Rate limiting middleware
export function rateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowMs = SECURITY_CONFIG.RATE_LIMIT.windowMs
  const maxRequests = SECURITY_CONFIG.RATE_LIMIT.maxRequests
  
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    // New window or expired window
    const resetTime = now + windowMs
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  record.count++
  rateLimitStore.set(identifier, record)
  
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime }
}

// CORS validation
export function validateCORS(origin: string | null): boolean {
  if (!origin) return false
  return SECURITY_CONFIG.CORS.allowedOrigins.includes(origin)
}

// Request signature validation (simplified for Edge Runtime)
export function generateRequestSignature(payload: string, timestamp: string, secret: string): string {
  // Simplified signature generation for Edge Runtime
  const message = `${timestamp}.${payload}.${secret}`
  return btoa(message).substring(0, 32)
}

export function validateRequestSignature(
  payload: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateRequestSignature(payload, timestamp, secret)
  
  // Check timestamp (prevent replay attacks)
  const now = Math.floor(Date.now() / 1000)
  const requestTime = parseInt(timestamp)
  const timeDiff = Math.abs(now - requestTime)
  
  if (timeDiff > 300) { // 5 minutes tolerance
    return false
  }
  
  // Simple comparison for Edge Runtime
  return signature === expectedSignature
}

// JWT token validation
export async function validateJWTToken(request: NextRequest): Promise<{ valid: boolean; user?: any }> {
  try {
    const token = await getToken({ 
      req: request, 
      secret: SECURITY_CONFIG.JWT_SECRET 
    })
    
    if (!token) {
      return { valid: false }
    }
    
    // Additional token validation
    if (!token.role || !['super_admin', 'admin', 'content_manager', 'instructor_manager', 'analytics_viewer'].includes(token.role as string)) {
      return { valid: false }
    }
    
    return { valid: true, user: token }
  } catch (error) {
    console.error('JWT validation error:', error)
    return { valid: false }
  }
}

// Input sanitization
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// SQL injection prevention
export function escapeSQLInput(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, '\\;').replace(/--/g, '\\--')
}

// Generate CSRF token
export function generateCSRFToken(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  // Fallback
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
}

// Validate CSRF token
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false
  
  // Simple comparison for Edge Runtime
  return token === sessionToken
}

// IP whitelist validation
export function validateIPWhitelist(ip: string): boolean {
  const whitelist = process.env.IP_WHITELIST?.split(',') || []
  if (whitelist.length === 0) return true // No whitelist configured
  
  return whitelist.includes(ip)
}

// Audit logging
export interface AuditLogEntry {
  userId: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: Date
  success: boolean
  errorMessage?: string
}

export function createAuditLog(entry: Omit<AuditLogEntry, 'timestamp'>): AuditLogEntry {
  return {
    ...entry,
    timestamp: new Date(),
  }
}

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://api.cloudcertification.com;
    frame-ancestors 'none';
  `.replace(/\s+/g, ' ').trim(),
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  // Check for common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /admin/i,
    /qwerty/i,
    /(.)\1{3,}/, // Repeated characters
  ]
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns and is not secure')
      break
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Hash password securely
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}