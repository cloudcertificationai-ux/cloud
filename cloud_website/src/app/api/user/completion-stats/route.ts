// src/app/api/user/completion-stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { getUserCompletionStats } from '@/lib/course-completion'

/**
 * GET /api/user/completion-stats
 * Get completion statistics for the authenticated user
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const stats = await getUserCompletionStats(user.id)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching completion stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch completion stats' },
      { status: 500 }
    )
  }
}
