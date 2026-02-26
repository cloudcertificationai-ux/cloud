// src/app/auth/signin/page.tsx
'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AuthenticationErrorMessage } from '@/components/ErrorMessage'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('User authenticated, redirecting to:', callbackUrl)
      router.push(callbackUrl)
      router.refresh() // Force a refresh to ensure session is loaded
    }
  }, [status, session, callbackUrl, router])

  const handleSignIn = async (provider: string, connection?: string) => {
    const loadingKey = connection || provider
    setIsLoading(loadingKey)
    try {
      // If connection is specified, pass it as a parameter to Auth0
      const options: any = { callbackUrl }
      if (connection) {
        options.connection = connection
      }
      await signIn(provider, options)
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(null)
    }
  }

  const handleRetry = () => {
    // Clear error from URL and allow user to try again
    window.location.href = `/auth/signin${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Get Started with AnyWhereDoor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in or create a new account - we'll handle it automatically
          </p>
        </div>

        {error && (
          <AuthenticationErrorMessage
            error={error}
            onRetry={handleRetry}
            callbackUrl={callbackUrl}
          />
        )}

        {!error && (
          <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  New to AnyWhereDoor? No worries! When you click continue, we'll automatically create your account if you don't have one yet.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {/* Google Sign In - via Auth0 Social Connection */}
          <button
            onClick={() => handleSignIn('auth0', 'google-oauth2')}
            disabled={isLoading !== null}
            className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </span>
            {isLoading === 'google-oauth2' ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Apple Sign In - via Auth0 Social Connection */}
          <button
            onClick={() => handleSignIn('auth0', 'apple')}
            disabled={isLoading !== null}
            className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </span>
            {isLoading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Auth0 Sign In - Shows all configured options */}
          <button
            onClick={() => handleSignIn('auth0')}
            disabled={isLoading !== null}
            className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.98 7.448L19.62 0H4.347L2.02 7.448c-1.352 4.312.03 9.206 3.815 12.015L12.007 24l6.157-4.537c3.785-2.808 5.167-7.703 3.815-12.015zm-6.672 12.166l-3.29 2.432-3.29-2.432c-2.715-2.01-3.701-5.518-2.736-8.61l.84-2.686h10.373l.84 2.686c.965 3.092-.02 6.6-2.737 8.61z" />
              </svg>
            </span>
            {isLoading === 'auth0' ? 'Please wait...' : 'More sign in options'}
          </button>
        </div>

        <div className="mt-6">
          <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-700 text-center">
              🔒 Secure authentication powered by Auth0 and NextAuth
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
