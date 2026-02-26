import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    // Validate required fields
    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Log analytics event (in production, you might send to external service)
    console.log('Analytics Event:', {
      event,
      data,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    });

    // In production, you might forward to Google Analytics Measurement Protocol
    // or other analytics services here

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle conversion tracking
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversionType, courseId, value } = body;

    // Validate conversion data
    if (!conversionType) {
      return NextResponse.json(
        { error: 'Conversion type is required' },
        { status: 400 }
      );
    }

    // Log conversion event
    console.log('Conversion Event:', {
      conversionType,
      courseId,
      value,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    });

    // In production, send to Google Analytics Enhanced Ecommerce
    // or other conversion tracking services

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}