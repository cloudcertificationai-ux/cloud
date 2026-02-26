import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    const existingCourse = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingCourse,
      slug,
    });
  } catch (error) {
    console.error('Error validating slug:', error);
    return NextResponse.json(
      { error: 'Failed to validate slug' },
      { status: 500 }
    );
  }
}
