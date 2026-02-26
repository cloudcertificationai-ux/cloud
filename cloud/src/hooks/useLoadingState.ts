import { useState, useCallback } from 'react'

export interface LoadingState {
  isLoading: boolean
  error: Error | null
  data: any | null
}

export function useLoadingState<T = any>(initialData: T | null = null) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(initialData)

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await asyncFn()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(initialData)
  }, [initialData])

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
    setData,
  }
}
