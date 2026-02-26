import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// Set runtime to edge for faster cold starts
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Anywheredoor - Online Learning Platform';
    const type = searchParams.get('type') || 'page';
    const subtitle = searchParams.get('subtitle') || 'Transform your career with expert-led online courses';

    // Define colors and styling based on type
    const getTypeConfig = (type: string) => {
      switch (type) {
        case 'course':
          return {
            bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            accentColor: '#4f46e5',
            icon: '📚',
          };
        case 'instructor':
          return {
            bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            accentColor: '#ec4899',
            icon: '👨‍🏫',
          };
        default:
          return {
            bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            accentColor: '#4f46e5',
            icon: '🚀',
          };
      }
    };

    const config = getTypeConfig(type);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: config.bgGradient,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            }}
          />
          
          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            {/* Icon */}
            <div
              style={{
                fontSize: '80px',
                marginBottom: '40px',
              }}
            >
              {config.icon}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: title.length > 50 ? '48px' : '64px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '24px',
                lineHeight: 1.2,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                maxWidth: '900px',
              }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '24px',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '40px',
                maxWidth: '700px',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>

            {/* Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 32px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                🚪
              </div>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                Anywheredoor
              </span>
            </div>
          </div>

          {/* Bottom Accent */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: config.accentColor,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}