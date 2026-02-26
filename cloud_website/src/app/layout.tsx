import type { Metadata } from 'next';
import { Inter, Roboto, JetBrains_Mono } from 'next/font/google';
import Header from '@/components/Header';
import SkipLink from '@/components/SkipLink';
import { DataProvider } from '@/contexts/DataContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ClientProviders from '@/components/ClientProviders';
import SessionProvider from '@/components/SessionProvider';
import dynamic from 'next/dynamic';

// Dynamically import client components
const Footer = dynamic(() => import('@/components/Footer'));
import { generateOGImageUrl } from '@/lib/seo';
import './globals.css';

// Font optimization with next/font
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const roboto = Roboto({
  variable: '--font-roboto',
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

// Global SEO metadata
export const metadata: Metadata = {
  title: {
    default: 'Cloud Certification - Industry-Certified Tech Courses for Career Leadership',
    template: '%s | Cloud Certification'
  },
  description: 'Advance to senior roles at Fortune 500 companies with industry-recognized certifications in programming, data science, and cybersecurity. Join 50K+ professionals who achieved 75% average salary increases.',
  keywords: [
    'career advancement',
    'industry certification',
    'senior developer roles',
    'Fortune 500 careers',
    'tech leadership training',
    'programming bootcamp',
    'data science certification',
    'cybersecurity leadership',
    'job-ready skills',
    'salary increase'
  ],
  authors: [{ name: 'Cloud Certification' }],
  creator: 'Cloud Certification',
  publisher: 'Cloud Certification',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cloudcertification.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cloudcertification.com',
    title: 'Cloud Certification - Industry-Certified Tech Leadership Training',
    description: 'Advance to senior roles at Fortune 500 companies with job-ready skills and industry-recognized certifications. 92% of graduates achieve leadership positions within 6 months.',
    siteName: 'Cloud Certification',
    images: [
      {
        url: generateOGImageUrl(
          'Anywheredoor',
          'page',
          'Transform your career with expert-led online courses'
        ),
        width: 1200,
        height: 630,
        alt: 'Cloud Certification - Online Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cloud Certification - Industry-Certified Tech Leadership',
    description: 'Advance to senior roles at Fortune 500 companies with industry-recognized certifications and job-ready skills training.',
    images: [generateOGImageUrl(
      'Anywheredoor',
      'page',
      'Transform your career with expert-led online courses'
    )],
    creator: '@cloudcertification',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0db5a6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cloud Certification" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//vercel.live" />
      </head>
      <body className="font-roboto antialiased bg-white text-gray-900 min-h-screen">
        <ErrorBoundary>
          <SessionProvider>
            <DataProvider>
              <SkipLink href="#main-content">Skip to main content</SkipLink>
              <SkipLink href="#navigation">Skip to navigation</SkipLink>
              <Header />
              <main id="main-content" tabIndex={-1} className="min-h-screen">
                {children}
              </main>
              <Footer />
            </DataProvider>
          </SessionProvider>
        </ErrorBoundary>
        
        {/* Client-side components */}
        <ClientProviders />
        
        {/* Performance monitoring initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Report Web Vitals
              if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
                try {
                  const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                      if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                      }
                      if (entry.entryType === 'first-input') {
                        console.log('FID:', entry.processingStart - entry.startTime);
                      }
                    });
                  });
                  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
                } catch (e) {
                  console.warn('Performance monitoring not supported');
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
