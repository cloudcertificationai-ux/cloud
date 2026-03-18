// src/lib/__tests__/auth.test.ts
import { authOptions } from '../auth'

describe('NextAuth Configuration', () => {
  it('should have correct providers configured', () => {
    expect(authOptions.providers).toBeDefined()
    expect(authOptions.providers.length).toBeGreaterThanOrEqual(1)
    
    // Check provider names - Auth0 is the primary provider
    const providerIds = authOptions.providers.map((p: any) => p.id)
    expect(providerIds).toContain('auth0')
  })

  it('should have Prisma adapter configured', () => {
    expect(authOptions.adapter).toBeDefined()
  })

  it('should have session strategy configured', () => {
    // Session strategy can be 'jwt' or 'database'
    expect(authOptions.session?.strategy).toBeDefined()
    expect(['jwt', 'database']).toContain(authOptions.session?.strategy)
  })

  it('should have 24-hour session maxAge', () => {
    const expectedMaxAge = 24 * 60 * 60 // 24 hours in seconds
    expect(authOptions.session?.maxAge).toBe(expectedMaxAge)
  })

  it('should have custom pages configured', () => {
    expect(authOptions.pages?.signIn).toBe('/auth/signin')
    expect(authOptions.pages?.error).toBe('/auth/error')
  })

  it('should have session callback defined', () => {
    expect(authOptions.callbacks?.session).toBeDefined()
    expect(typeof authOptions.callbacks?.session).toBe('function')
  })

  it('should have signIn callback defined', () => {
    expect(authOptions.callbacks?.signIn).toBeDefined()
    expect(typeof authOptions.callbacks?.signIn).toBe('function')
  })

  it('should have secret configured', () => {
    expect(authOptions.secret).toBeDefined()
  })
})
