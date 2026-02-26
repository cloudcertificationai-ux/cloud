// src/lib/validations/course.ts
/**
 * Validation schemas for course management
 * Uses Zod for type-safe validation
 */

import { z } from 'zod'

/**
 * Slug validation regex: lowercase alphanumeric with hyphens
 */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Course creation schema
 */
export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must be at most 200 characters')
    .regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  summary: z.string().max(500, 'Summary must be at most 500 characters').optional().nullable(),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional().nullable(),
  priceCents: z.number().int('Price must be an integer').min(0, 'Price must be non-negative'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('INR'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional().nullable(),
  durationMin: z.number().int('Duration must be an integer').positive('Duration must be positive').optional().nullable(),
  thumbnailUrl: z.string().url('Thumbnail must be a valid URL').optional().nullable().or(z.literal('')),
  categoryId: z.string().optional().nullable(),
  instructorId: z.string().optional().nullable(),
})

/**
 * Course update schema (allows partial updates)
 */
export const updateCourseSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().min(3).max(200).regex(slugRegex).optional(),
  summary: z.string().max(500).optional().nullable().or(z.literal('')),
  description: z.string().max(5000).optional().nullable().or(z.literal('')),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional().nullable().or(z.literal('')),
  durationMin: z.number().int().positive().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable().or(z.literal('')),
  categoryId: z.string().optional().nullable().or(z.literal('')),
  instructorId: z.string().optional().nullable().or(z.literal('')),
})

/**
 * Type inference from schemas
 */
export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
