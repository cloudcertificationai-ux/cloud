// src/lib/validations/reorder.ts
/**
 * Validation schemas for curriculum reordering operations
 * Uses Zod for type-safe validation
 */

import { z } from 'zod'

/**
 * Single reorder operation schema
 */
export const reorderOperationSchema = z.object({
  type: z.enum(['module', 'lesson'], {
    errorMap: () => ({ message: 'Type must be either "module" or "lesson"' }),
  }),
  id: z.string().min(1, 'ID is required'),
  order: z.number().int('Order must be an integer').min(0, 'Order must be non-negative'),
  moduleId: z.string().optional(), // Required for lessons, especially when moved between modules
})

/**
 * Reorder request schema
 */
export const reorderRequestSchema = z.object({
  operations: z
    .array(reorderOperationSchema)
    .min(1, 'At least one reorder operation is required')
    .refine(
      (operations) => {
        // Validate that lesson operations have moduleId
        const lessonOps = operations.filter((op) => op.type === 'lesson')
        return lessonOps.every((op) => op.moduleId)
      },
      {
        message: 'All lesson operations must include moduleId',
      }
    ),
})

/**
 * Type inference from schemas
 */
export type ReorderOperation = z.infer<typeof reorderOperationSchema>
export type ReorderRequest = z.infer<typeof reorderRequestSchema>
