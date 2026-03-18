import { NextRequest, NextResponse } from 'next/server';
import { createId } from '@paralleldrive/cuid2';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const instructor = await prisma.instructor.create({
      data: { id: createId(), name: name.trim() },
      select: { id: true, name: true },
    });

    return NextResponse.json(instructor, { status: 201 });
  } catch (error) {
    console.error('Error creating instructor:', error);
    return NextResponse.json(
      { error: 'Failed to create instructor' },
      { status: 500 }
    );
  }
}
