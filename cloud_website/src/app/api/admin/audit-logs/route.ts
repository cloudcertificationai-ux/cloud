// src/app/api/admin/audit-logs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryAuditLogs } from '@/lib/audit-logger'
import prisma from '@/lib/db'

/**
 * GET /api/admin/audit-logs
 * Retrieve audit logs with filtering
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user and verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action') || undefined
    const userId = searchParams.get('userId') || undefined
    const resourceType = searchParams.get('resource') || undefined
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined

    // Calculate offset
    const offset = (page - 1) * limit

    // Query audit logs
    const result = await queryAuditLogs({
      userId,
      action,
      resourceType,
      startDate,
      endDate,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
