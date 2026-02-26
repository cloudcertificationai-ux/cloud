import { useState, useCallback } from 'react'

export interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error, rollbackData: T) => void
  showToast?: boolean
}

/**
 * Hook for optimistic UI updates with automatic rollback on error
 */
export function useOptimisticUpdate<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData)
  const [isUpdating, setIsUpdating] = useState(false)

  const update = useCallback(
    async (
      optimisticData: T,
      asyncUpdate: () => Promise<T>,
      options: OptimisticUpdateOptions<T> = {}
    ) => {
      const previousData = data
      
      // Apply optimistic update immediately
      setData(optimisticData)
      setIsUpdating(true)

      try {
        // Perform actual update
        const result = await asyncUpdate()
        
        // Update with server response
        setData(result)
        
        options.onSuccess?.(result)
        
        return result
      } catch (error) {
        // Rollback on error
        setData(previousData)
        
        const err = error instanceof Error ? error : new Error('Update failed')
        options.onError?.(err, previousData)
        
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [data]
  )

  return {
    data,
    isUpdating,
    update,
    setData,
  }
}

/**
 * Hook for optimistic list updates (reordering, adding, removing items)
 */
export function useOptimisticList<T extends { id: string }>(initialList: T[]) {
  const [list, setList] = useState<T[]>(initialList)
  const [isUpdating, setIsUpdating] = useState(false)

  const reorder = useCallback(
    async (
      newOrder: T[],
      asyncUpdate: () => Promise<T[]>,
      options: OptimisticUpdateOptions<T[]> = {}
    ) => {
      const previousList = list

      // Apply optimistic reorder
      setList(newOrder)
      setIsUpdating(true)

      try {
        const result = await asyncUpdate()
        setList(result)
        options.onSuccess?.(result)
        return result
      } catch (error) {
        // Rollback
        setList(previousList)
        const err = error instanceof Error ? error : new Error('Reorder failed')
        options.onError?.(err, previousList)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [list]
  )

  const add = useCallback(
    async (
      item: T,
      asyncAdd: () => Promise<T>,
      options: OptimisticUpdateOptions<T> = {}
    ) => {
      const previousList = list

      // Add optimistically
      setList([...list, item])
      setIsUpdating(true)

      try {
        const result = await asyncAdd()
        // Replace temporary item with server response
        setList((current) =>
          current.map((i) => (i.id === item.id ? result : i))
        )
        options.onSuccess?.(result)
        return result
      } catch (error) {
        // Rollback
        setList(previousList)
        const err = error instanceof Error ? error : new Error('Add failed')
        options.onError?.(err, item)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [list]
  )

  const remove = useCallback(
    async (
      id: string,
      asyncRemove: () => Promise<void>,
      options: OptimisticUpdateOptions<void> = {}
    ) => {
      const previousList = list
      const removedItem = list.find((item) => item.id === id)

      // Remove optimistically
      setList(list.filter((item) => item.id !== id))
      setIsUpdating(true)

      try {
        await asyncRemove()
        options.onSuccess?.()
      } catch (error) {
        // Rollback
        setList(previousList)
        const err = error instanceof Error ? error : new Error('Remove failed')
        options.onError?.(err, undefined as any)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [list]
  )

  const update = useCallback(
    async (
      id: string,
      updates: Partial<T>,
      asyncUpdate: () => Promise<T>,
      options: OptimisticUpdateOptions<T> = {}
    ) => {
      const previousList = list

      // Update optimistically
      setList(
        list.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      )
      setIsUpdating(true)

      try {
        const result = await asyncUpdate()
        setList((current) =>
          current.map((item) => (item.id === id ? result : item))
        )
        options.onSuccess?.(result)
        return result
      } catch (error) {
        // Rollback
        setList(previousList)
        const err = error instanceof Error ? error : new Error('Update failed')
        options.onError?.(err, updates as T)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [list]
  )

  return {
    list,
    isUpdating,
    reorder,
    add,
    remove,
    update,
    setList,
  }
}
