import { generateRequestSignature } from './security'

interface ApiClientConfig {
  baseUrl: string
  apiKey?: string
  timeout?: number
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  requiresAuth?: boolean
  requiresSignature?: boolean
}

class SecureApiClient {
  private baseUrl: string
  private apiKey?: string
  private timeout: number

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = config.apiKey
    this.timeout = config.timeout || 30000 // 30 seconds default
  }

  private async makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = false,
      requiresSignature = false,
    } = options

    const url = `${this.baseUrl}${endpoint}`
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'CloudCertification-Admin/1.0',
      ...headers,
    }

    // Add API key if available
    if (this.apiKey) {
      requestHeaders['X-API-Key'] = this.apiKey
    }

    // Add authentication token if required
    if (requiresAuth) {
      const token = await this.getAuthToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    // Prepare request body
    let requestBody: string | undefined
    if (body && method !== 'GET') {
      requestBody = JSON.stringify(body)
    }

    // Add request signature for sensitive operations
    if (requiresSignature && requestBody && this.apiKey) {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const signature = generateRequestSignature(requestBody, timestamp, this.apiKey)
      
      requestHeaders['X-Timestamp'] = timestamp
      requestHeaders['X-Signature'] = signature
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
        credentials: 'include', // Include cookies for session management
      })

      clearTimeout(timeoutId)

      // Check for rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds`)
      }

      // Check for authentication errors
      if (response.status === 401) {
        // Clear stored auth token
        this.clearAuthToken()
        throw new Error('Authentication required')
      }

      // Check for authorization errors
      if (response.status === 403) {
        throw new Error('Insufficient permissions')
      }

      // Parse response
      const contentType = response.headers.get('content-type')
      let responseData: any

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return responseData
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        throw error
      }
      
      throw new Error('Unknown error occurred')
    }
  }

  private async getAuthToken(): Promise<string | null> {
    // In a real implementation, this would get the token from NextAuth session
    // For now, we'll return null as authentication is handled by NextAuth middleware
    return null
  }

  private clearAuthToken(): void {
    // Clear any stored authentication tokens
    // This would typically clear localStorage or sessionStorage
  }

  // Public API methods

  // Courses API
  async getCourses(params?: {
    page?: number
    limit?: number
    category?: string
    level?: string
  }): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.category) searchParams.set('category', params.category)
    if (params?.level) searchParams.set('level', params.level)

    const endpoint = `/api/external/courses${searchParams.toString() ? `?${searchParams}` : ''}`
    return this.makeRequest(endpoint)
  }

  async createCourse(courseData: any): Promise<any> {
    return this.makeRequest('/api/external/courses', {
      method: 'POST',
      body: courseData,
      requiresSignature: true,
    })
  }

  async updateCourse(courseId: string, courseData: any): Promise<any> {
    return this.makeRequest(`/api/external/courses/${courseId}`, {
      method: 'PUT',
      body: courseData,
      requiresSignature: true,
    })
  }

  async deleteCourse(courseId: string): Promise<any> {
    return this.makeRequest(`/api/external/courses/${courseId}`, {
      method: 'DELETE',
      requiresSignature: true,
    })
  }

  // Students API
  async getStudents(params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder)

    const endpoint = `/api/admin/students${searchParams.toString() ? `?${searchParams}` : ''}`
    return this.makeRequest(endpoint, { requiresAuth: true })
  }

  async getStudentDetail(studentId: string): Promise<any> {
    return this.makeRequest(`/api/admin/students/${studentId}`, { requiresAuth: true })
  }

  async createEnrollment(studentId: string, courseId: string): Promise<any> {
    return this.makeRequest('/api/admin/enrollments', {
      method: 'POST',
      body: { studentId, courseId },
      requiresAuth: true,
      requiresSignature: true,
    })
  }

  async deleteEnrollment(enrollmentId: string): Promise<any> {
    return this.makeRequest(`/api/admin/enrollments/${enrollmentId}`, {
      method: 'DELETE',
      requiresAuth: true,
      requiresSignature: true,
    })
  }

  async getEnrollmentStats(params?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month' | 'year'
  }): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)
    if (params?.groupBy) searchParams.set('groupBy', params.groupBy)

    const endpoint = `/api/admin/analytics/enrollments${searchParams.toString() ? `?${searchParams}` : ''}`
    return this.makeRequest(endpoint, { requiresAuth: true })
  }

  async getStudentAnalytics(params?: {
    startDate?: string
    endDate?: string
  }): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)

    const endpoint = `/api/admin/analytics/students${searchParams.toString() ? `?${searchParams}` : ''}`
    return this.makeRequest(endpoint, { requiresAuth: true })
  }

  async getProgressAnalytics(params?: {
    courseId?: string
  }): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (params?.courseId) searchParams.set('courseId', params.courseId)

    const endpoint = `/api/admin/analytics/progress${searchParams.toString() ? `?${searchParams}` : ''}`
    return this.makeRequest(endpoint, { requiresAuth: true })
  }

  // Audit Logs API
  async getAuditLogs(params?: {
    page?: number
    limit?: number
    action?: string
    userId?: string
    resource?: string
    success?: boolean
    startDate?: string
    endDate?: string
  }): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.action) searchParams.set('action', params.action)
    if (params?.userId) searchParams.set('userId', params.userId)
    if (params?.resource) searchParams.set('resource', params.resource)
    if (params?.success !== undefined) searchParams.set('success', params.success.toString())
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)

    const endpoint = `/api/admin/audit-logs${searchParams.toString() ? `?${searchParams}` : ''}`
    return this.makeRequest(endpoint, { requiresAuth: true })
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.makeRequest('/api/health')
  }
}

// Create API client instances
export const mainWebsiteApi = new SecureApiClient({
  baseUrl: process.env.NEXT_PUBLIC_MAIN_WEBSITE_URL || 'http://localhost:3000',
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  timeout: 30000,
})

export const adminApi = new SecureApiClient({
  baseUrl: process.env.NEXT_PUBLIC_ADMIN_PANEL_URL || 'http://localhost:3001',
  timeout: 30000,
})

// Utility functions for secure communication
export function createSecureHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache',
    ...additionalHeaders,
  }
}

export function validateResponse(response: any): boolean {
  // Basic response validation
  if (!response || typeof response !== 'object') {
    return false
  }

  // Check for required fields
  if (!response.timestamp) {
    return false
  }

  // Validate timestamp is recent (within 5 minutes)
  const responseTime = new Date(response.timestamp).getTime()
  const now = Date.now()
  const timeDiff = Math.abs(now - responseTime)
  
  if (timeDiff > 5 * 60 * 1000) { // 5 minutes
    return false
  }

  return true
}

export { SecureApiClient }