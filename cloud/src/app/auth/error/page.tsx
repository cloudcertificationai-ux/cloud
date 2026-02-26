'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return {
          title: 'Configuration Error',
          message: 'There is a problem with the server configuration. Please contact the administrator.',
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access the admin panel. Only users with admin privileges can sign in.',
        }
      case 'Verification':
        return {
          title: 'Verification Failed',
          message: 'The verification token has expired or has already been used.',
        }
      case 'OAuthSignin':
        return {
          title: 'OAuth Sign In Error',
          message: 'There was an error signing in with the OAuth provider.',
        }
      case 'OAuthCallback':
        return {
          title: 'OAuth Callback Error',
          message: 'There was an error during the OAuth callback process.',
        }
      case 'OAuthCreateAccount':
        return {
          title: 'Account Creation Error',
          message: 'Could not create an account with the OAuth provider.',
        }
      case 'EmailCreateAccount':
        return {
          title: 'Email Account Error',
          message: 'Could not create an account with the email provider.',
        }
      case 'Callback':
        return {
          title: 'Callback Error',
          message: 'There was an error during the authentication callback.',
        }
      case 'OAuthAccountNotLinked':
        return {
          title: 'Account Not Linked',
          message: 'This account is already associated with another sign-in method. Please use your original sign-in method.',
        }
      case 'EmailSignin':
        return {
          title: 'Email Sign In Error',
          message: 'There was an error sending the email verification.',
        }
      case 'CredentialsSignin':
        return {
          title: 'Invalid Credentials',
          message: 'The credentials you provided are incorrect.',
        }
      case 'SessionRequired':
        return {
          title: 'Session Required',
          message: 'You must be signed in to access this page.',
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'An unexpected error occurred during authentication. Please try again.',
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-teal-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Error Icon */}
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-glow">
            <ExclamationTriangleIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            {errorInfo.title}
          </h2>
          <p className="text-red-200 text-lg">
            {errorInfo.message}
          </p>
        </div>

        {/* Error Details */}
        {error && (
          <div className="animate-fade-in-up animation-delay-200">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-sm text-white/60 mb-2">Error Code:</p>
              <p className="text-white font-mono text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4 animate-fade-in-up animation-delay-300">
          <Link
            href="/auth/signin"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-glow active:scale-95"
          >
            Try Again
          </Link>

          <Link
            href="/"
            className="group relative w-full flex justify-center py-4 px-4 border border-white/20 text-lg font-semibold rounded-xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
          >
            Go to Homepage
          </Link>
        </div>

        {/* Help Text */}
        <div className="text-center animate-fade-in-up animation-delay-400">
          <p className="text-sm text-teal-200/80">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  )
}
