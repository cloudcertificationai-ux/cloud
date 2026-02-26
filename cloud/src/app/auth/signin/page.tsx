'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import { useState, FormEvent } from 'react'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setFormError(result.error)
        setIsLoading(false)
      } else if (result?.ok) {
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setFormError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-teal-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-glow">
            <LockClosedIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Admin Access
          </h2>
          <p className="text-teal-200 text-lg">
            Sign in to <span className="text-gradient-secondary font-semibold">Cloud Certification Admin Panel</span>
          </p>
        </div>

        {/* Error message */}
        {(error || formError) && (
          <div className="animate-fade-in-up animation-delay-100">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-red-200 text-sm text-center">
                {formError || (error === 'CredentialsSignin' 
                  ? 'Invalid email or password. Please try again.'
                  : 'Authentication failed. Please try again.')}
              </p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 animate-fade-in-up animation-delay-200">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-teal-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="appearance-none relative block w-full px-4 py-3 border border-white/20 placeholder-gray-400 text-white bg-white/10 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-teal-200 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="appearance-none relative block w-full px-4 py-3 border border-white/20 placeholder-gray-400 text-white bg-white/10 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex items-center justify-center py-4 px-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-glow active:scale-95"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="loading-spinner w-5 h-5"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl animate-fade-in-up animation-delay-400">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
            <div className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></div>
            Admin Access Only
          </h3>
          <p className="text-sm text-teal-200">
            Only users with admin privileges can access this panel. If you don't have admin access, please contact your system administrator.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center animate-fade-in-up animation-delay-500">
          <p className="text-sm text-teal-200/80">
            Powered by <span className="font-semibold text-white">Cloud Certification</span>
          </p>
        </div>
      </div>
    </div>
  )
}