// src/lib/api-response.ts
import { NextResponse } from 'next/server'

/**
 * Metadata for API responses
 */
export interface ApiMetadata {
  timestamp: string
  requestId?: string
  version?: string
}

/**
 * Standard API response with metadata
 */
export interface ApiResponseWithMetadata<T> {
  data: T
  metadata: ApiMetadata
}

/**
 * Add timestamp metadata to response data
 */
export function withTimestamp<T>(data: T, requestId?: string): ApiResponseWithMetadata<T> {
  return {
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
      version: '1.0',
    },
  }
}

/**
 * Create API response with timestamp metadata
 */
export function createApiResponse<T>(
  data: T,
  status: number = 200,
  requestId?: string
): NextResponse {
  return NextResponse.json(withTimestamp(data, requestId), { status })
}

/**
 * Add last_updated_at to data objects
 */
export function addLastUpdatedAt<T extends Record<string, any>>(
  data: T,
  updatedAtField: keyof T = 'updatedAt' as keyof T
): T & { last_updated_at: string } {
  const updatedAt = data[updatedAtField]
  let lastUpdatedAt: string
  
  if (updatedAt && typeof updatedAt === 'object' && 'toISOString' in updatedAt) {
    lastUpdatedAt = (updatedAt as Date).toISOString()
  } else if (typeof updatedAt === 'string') {
    lastUpdatedAt = updatedAt
  } else {
    lastUpdatedAt = new Date().toISOString()
  }

  return {
    ...data,
    last_updated_at: lastUpdatedAt,
  }
}

/**
 * Add last_updated_at to array of data objects
 */
export function addLastUpdatedAtToArray<T extends Record<string, any>>(
  data: T[],
  updatedAtField: keyof T = 'updatedAt' as keyof T
): Array<T & { last_updated_at: string }> {
  return data.map((item) => addLastUpdatedAt(item, updatedAtField))
}

/**
 * Add sync metadata to data objects
 */
export interface SyncMetadata {
  last_updated_at: string
  last_synced_at?: string
  sync_status?: 'synced' | 'pending' | 'failed'
}

export function addSyncMetadata<T extends Record<string, any>>(
  data: T,
  syncStatus?: 'synced' | 'pending' | 'failed'
): T & SyncMetadata {
  const updatedAt = data.updatedAt instanceof Date 
    ? data.updatedAt.toISOString() 
    : typeof data.updatedAt === 'string' 
    ? data.updatedAt 
    : new Date().toISOString()

  return {
    ...data,
    last_updated_at: updatedAt,
    last_synced_at: new Date().toISOString(),
    sync_status: syncStatus || 'synced',
  }
}

/**
 * Format enrollment data with timestamps
 */
export function formatEnrollmentWithTimestamps(enrollment: any) {
  return {
    ...enrollment,
    last_updated_at: enrollment.lastAccessedAt 
      ? new Date(enrollment.lastAccessedAt).toISOString()
      : new Date(enrollment.enrolledAt).toISOString(),
    enrolled_at: new Date(enrollment.enrolledAt).toISOString(),
    last_accessed_at: enrollment.lastAccessedAt 
      ? new Date(enrollment.lastAccessedAt).toISOString() 
      : null,
  }
}

/**
 * Format user profile data with timestamps
 */
export function formatProfileWithTimestamps(user: any) {
  return {
    ...user,
    last_updated_at: user.updatedAt 
      ? new Date(user.updatedAt).toISOString()
      : new Date(user.createdAt).toISOString(),
    created_at: new Date(user.createdAt).toISOString(),
    updated_at: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
    last_login_at: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
  }
}

/**
 * Format course progress data with timestamps
 */
export function formatProgressWithTimestamps(progress: any) {
  return {
    ...progress,
    last_updated_at: new Date(progress.timestamp).toISOString(),
    timestamp: new Date(progress.timestamp).toISOString(),
  }
}

/**
 * Add pagination metadata
 */
export interface PaginationMetadata {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  requestId?: string
) {
  const totalPages = Math.ceil(total / limit)
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
      version: '1.0',
    },
  }
}
