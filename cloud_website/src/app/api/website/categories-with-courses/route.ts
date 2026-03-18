import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { CategoryWithCourses } from '@/types/categories';

export const revalidate = 900;

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        Course: {
          where: { published: true },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            durationMin: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result: CategoryWithCourses[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      courses: cat.Course,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('categories-with-courses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
