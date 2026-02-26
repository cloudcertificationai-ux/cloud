import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  interestedCourse: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = contactSchema.parse(body);
    
    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject,
        message: validatedData.message,
        interestedCourse: validatedData.interestedCourse || null,
        status: 'NEW',
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been received. We will get back to you soon!',
        id: submission.id 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error', 
          errors: error.issues 
        },
        { status: 400 }
      );
    }

    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit your message. Please try again later.' 
      },
      { status: 500 }
    );
  }
}
