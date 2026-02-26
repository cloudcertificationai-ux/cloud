import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const instructors = await prisma.user.findMany({
      where: {
        role: 'INSTRUCTOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Map to match the expected interface
    const formattedInstructors = instructors.map((instructor) => ({
      id: instructor.id,
      name: instructor.name || instructor.email || 'Unknown',
      avatar: instructor.image || undefined,
    }));

    return NextResponse.json(formattedInstructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructors' },
      { status: 500 }
    );
  }
}
