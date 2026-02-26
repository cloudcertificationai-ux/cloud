// src/hooks/useAuth.ts
'use client'

import { useSession as useNextAuthSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

/**
 * Custom hook for authentication operations
 * Provides convenient methods for sign in, sign out, and authentication state
 */
export function useAuth() {
  const { data: session, status } = useNextAuthSession()
  const router = useRouter()

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const user = session?.user

  /**
   * Sign in with a provider
   * @param provider - The authentication provider (google, apple, auth0)
   * @param callbackUrl - Optional URL to redirect after sign in
   */
  const login = async (provider: string, callbackUrl?: string) => {
    await signIn(provider, { callbackUrl: callbackUrl || '/' })
  }

  /**
   * Sign out the current user
   * @param callbackUrl - Optional URL to redirect after sign out
   */
  const logout = async (callbackUrl?: string) => {
    await signOut({ callbackUrl: callbackUrl || '/' })
  }

  /**
   * Redirect to sign in page with callback URL
   * @param callbackUrl - URL to return to after authentication
   */
  const redirectToSignIn = (callbackUrl?: string) => {
    const url = callbackUrl || window.location.pathname
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(url)}`)
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    redirectToSignIn,
    session,
    status,
  }
}

/**
 * Custom hook to get the current user
 * Returns null if not authenticated
 */
export function useUser() {
  const { data: session } = useNextAuthSession()
  return session?.user || null
}

/**
 * Custom hook to get the current session
 * Wrapper around next-auth's useSession for consistency
 */
export function useSession() {
  return useNextAuthSession()
}
