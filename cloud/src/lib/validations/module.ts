// src/lib/validations/module.ts
/**
 * Validation schemas for module management
 * Uses Zod for type-safe validation
 */

import { z } from 'zod'

/**
 * Module creation schema
 */
export const createModuleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
})

/**
 * Module update schema
 */
export const updateModuleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
})

/**
 * Type inference from schemas
 */
export type CreateModuleInput = z.infer<typeof createModuleSchema>
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>
