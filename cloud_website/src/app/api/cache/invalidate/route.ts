import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/cache-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/cache/invalidate - Invalidate cache by tags (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tags } = body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Tags array is required' },
        { status: 400 }
      );
    }

    // Invalidate cache by tags
    const invalidatedCount = invalidateCache(tags);

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for tags: ${tags.join(', ')}`,
      invalidatedCount,
      tags,
    });

  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to invalidate cache'
      },
      { status: 500 }
    );
  }
}
