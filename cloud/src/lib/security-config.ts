// Security Configuration for Cloud Certification Admin Panel
// This file contains all security-related configuration

export const SECURITY_CONFIG = {
  // Authentication Configuration
  AUTH: {
    SESSION_MAX_AGE: 24 * 60 * 60, // 24 hours
    SESSION_UPDATE_AGE: 60 * 60, // 1 hour
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
    PASSWORD_MIN_LENGTH: 12,
    JWT_ALGORITHM: 'HS256',
  },

  // API Security Configuration
  API: {
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100,
      SKIP_SUCCESSFUL_REQUESTS: false,
      SKIP_FAILED_REQUESTS: false,
    },
    REQUEST_TIMEOUT: 30000, // 30 seconds
    MAX_REQUEST_SIZE: '10mb',
    SIGNATURE_TOLERANCE: 300, // 5 minutes
  },

  // CORS Configuration
  CORS: {
    ALLOWED_ORIGINS: [
      'http://localhost:3000', // Main website (development)
      'http://localhost:3001', // Admin panel (development)
      'https://cloudcertification.com', // Main website (production)
      'https://admin.cloudcertification.com', // Admin panel (production)
    ],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Signature',
      'X-Timestamp',
      'X-Requested-With',
    ],
    CREDENTIALS: true,
    MAX_AGE: 86400, // 24 hours
  },

  // Encryption Configuration
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
    SALT_ROUNDS: 12, // For bcrypt
  },

  // Security Headers
  HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.cloudcertification.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },

  // Audit Logging Configuration
  AUDIT: {
    RETENTION_DAYS: 90,
    LOG_LEVELS: ['info', 'warn', 'error'],
    SENSITIVE_FIELDS: ['password', 'token', 'secret', 'key'],
    MAX_LOG_SIZE: 1000, // characters
  },

  // Role-Based Access Control
  RBAC: {
    ROLES: {
      SUPER_ADMIN: 'super_admin',
      ADMIN: 'admin',
      CONTENT_MANAGER: 'content_manager',
      INSTRUCTOR_MANAGER: 'instructor_manager',
      ANALYTICS_VIEWER: 'analytics_viewer',
    },
    PERMISSIONS: {
      // Super Admin - Full access
      super_admin: [
        'dashboard:read',
        'courses:*',
        'instructors:*',
        'students:*',
        'analytics:*',
        'security:*',
        'settings:*',
        'users:*',
        'audit:*',
      ],
      // Admin - Platform management
      admin: [
        'dashboard:read',
        'courses:*',
        'instructors:*',
        'students:read',
        'students:update',
        'analytics:read',
        'security:read',
        'settings:read',
        'settings:update',
      ],
      // Content Manager - Course and content management
      content_manager: [
        'dashboard:read',
        'courses:*',
        'instructors:read',
        'students:read',
        'analytics:read',
      ],
      // Instructor Manager - Instructor oversight
      instructor_manager: [
        'dashboard:read',
        'instructors:*',
        'courses:read',
        'students:read',
        'analytics:read',
      ],
      // Analytics Viewer - Read-only analytics
      analytics_viewer: [
        'dashboard:read',
        'courses:read',
        'instructors:read',
        'students:read',
        'analytics:read',
      ],
    },
  },

  // Input Validation
  VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_ARRAY_LENGTH: 100,
    MAX_OBJECT_DEPTH: 5,
    ALLOWED_FILE_TYPES: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
    ],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },

  // Monitoring and Alerting
  MONITORING: {
    FAILED_LOGIN_THRESHOLD: 10, // Alert after 10 failed logins in window
    FAILED_LOGIN_WINDOW: 60 * 60 * 1000, // 1 hour
    SUSPICIOUS_IP_THRESHOLD: 50, // Alert after 50 requests from same IP
    API_ERROR_THRESHOLD: 20, // Alert after 20 API errors in window
    ALERT_COOLDOWN: 30 * 60 * 1000, // 30 minutes between alerts
  },

  // Environment-specific settings
  ENVIRONMENT: {
    DEVELOPMENT: {
      DEBUG: true,
      VERBOSE_LOGGING: true,
      DISABLE_RATE_LIMITING: false, // Keep rate limiting even in dev
      ALLOW_HTTP: true,
    },
    PRODUCTION: {
      DEBUG: false,
      VERBOSE_LOGGING: false,
      DISABLE_RATE_LIMITING: false,
      ALLOW_HTTP: false,
      REQUIRE_HTTPS: true,
    },
  },
}

// Helper functions for security configuration
export function getSecurityConfig(environment: 'development' | 'production' = 'development') {
  return {
    ...SECURITY_CONFIG,
    ...SECURITY_CONFIG.ENVIRONMENT[environment.toUpperCase() as keyof typeof SECURITY_CONFIG.ENVIRONMENT],
  }
}

export function hasPermission(userRole: string, permission: string): boolean {
  const rolePermissions = SECURITY_CONFIG.RBAC.PERMISSIONS[userRole as keyof typeof SECURITY_CONFIG.RBAC.PERMISSIONS]
  if (!rolePermissions) return false

  // Check for wildcard permissions
  if (rolePermissions.includes('*')) return true

  // Check for exact permission match
  if (rolePermissions.includes(permission)) return true

  // Check for resource wildcard (e.g., 'courses:*' matches 'courses:read')
  const [resource] = permission.split(':')
  if (rolePermissions.includes(`${resource}:*`)) return true

  return false
}

export function validateRole(role: string): boolean {
  return Object.values(SECURITY_CONFIG.RBAC.ROLES).includes(role)
}

export function isSecureEnvironment(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function getCSPHeader(): string {
  return SECURITY_CONFIG.HEADERS['Content-Security-Policy']
}

export function getAllowedOrigins(): string[] {
  return SECURITY_CONFIG.CORS.ALLOWED_ORIGINS
}

export default SECURITY_CONFIG