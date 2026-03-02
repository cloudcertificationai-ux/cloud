import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const demoRequestSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  course: z.string().min(1, 'Please select a course'),
  whatsappConsent: z.boolean().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = demoRequestSchema.parse(body);
    
    // Combine country code and phone number
    const fullPhoneNumber = `${validatedData.countryCode} ${validatedData.phoneNumber}`;
    
    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: validatedData.fullName,
        email: validatedData.email,
        phone: fullPhoneNumber,
        countryCode: validatedData.countryCode,
        subject: 'Free Demo Request',
        message: `Course Interest: ${validatedData.course}\nWhatsApp Consent: ${validatedData.whatsappConsent ? 'Yes' : 'No'}`,
        interestedCourse: validatedData.course,
        status: 'NEW',
      },
    });

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user
    // TODO: If whatsappConsent is true, add to WhatsApp list

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you! We will contact you shortly to schedule your free demo.',
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

    console.error('Demo request submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit your request. Please try again later.' 
      },
      { status: 500 }
    );
  }
}
