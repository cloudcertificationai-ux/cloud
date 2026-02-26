// src/hooks/useEnrollmentIntent.ts
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface EnrollmentIntentResult {
  success: boolean
  requiresPayment?: boolean
  alreadyEnrolled?: boolean
  redirectTo?: string
  enrollment?: any
  purchaseId?: string
  amount?: number
  currency?: string
}

/**
 * Hook to automatically complete enrollment intent after user authentication
 * Should be used in the main layout or dashboard to check for pending enrollments
 */
export function useEnrollmentIntent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only process if user is authenticated and not already processing
    if (status !== 'authenticated' || isProcessing) {
      return
    }

    const completeEnrollmentIntent = async () => {
      setIsProcessing(true)
      setError(null)

      try {
        // Check if there's a pending intent
        const checkResponse = await fetch('/api/enrollments/complete-intent')
        const checkData = await checkResponse.json()

        if (!checkData.hasPendingIntent) {
          setIsProcessing(false)
          return
        }

        // Complete the enrollment intent
        const response = await fetch('/api/enrollments/complete-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to complete enrollment')
        }

        const result: EnrollmentIntentResult = await response.json()

        if (result.success && result.redirectTo) {
          // Show success message if enrolled
          if (result.enrollment && !result.requiresPayment) {
            // Could show a toast notification here
            console.log('Successfully enrolled in course!')
          }
          
          // Redirect to the appropriate page
          router.push(result.redirectTo)
        }
      } catch (err) {
        console.error('Error completing enrollment intent:', err)
        setError('Failed to complete enrollment. Please try again.')
      } finally {
        setIsProcessing(false)
      }
    }

    completeEnrollmentIntent()
  }, [status, session, router, isProcessing])

  return {
    isProcessing,
    error,
  }
}
