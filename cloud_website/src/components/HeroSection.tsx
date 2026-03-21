'use client';

import Link from 'next/link';
import Image from 'next/image';

interface SuccessMetric {
  id: string;
  value: string;
  label: string;
  iconName: 'users' | 'trophy' | 'chart' | 'academic';
  description: string;
}

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA: {
    text: string;
    href: string;
  };
  successMetrics: SuccessMetric[];
  backgroundImage?: string;
}

export default function HeroSection({
  headline,
  subheadline,
  primaryCTA,
}: HeroSectionProps) {
  return (
    <section
      className="relative w-full"
      style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #dce8fb 50%, #cfe0f8 100%)', minHeight: '220px', overflow: 'clip' }}
    >
      {/* Hero image — absolute, bottom-right, overflows bottom edge */}
      <div
        className="hidden md:block absolute bottom-0 pointer-events-none select-none"
        style={{ width: '620px', height: '100%', right: '5%' }}
      >
        <Image
          src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.ctfassets.net/wp1lcwdav1p1/DMFk42PH8L9y9MeQ5xc7I/c55cade640bb097b0e5429b780ff7c98/redesigned-hero-image.png?auto=format%2Ccompress&dpr=1&w=679"
          alt="Cloud Certification hero"
          fill
          className="object-contain object-bottom object-right"
          priority
          unoptimized
        />
      </div>

      {/* Content — sits on top of the image */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-16">
        <div className="max-w-lg">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            {/* <span className="text-blue-600 font-bold text-lg tracking-tight">Cloudcertification Online Trainings</span> */}
            {/* <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded">Online Trainning</span> */}
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-gray-900 leading-tight mb-3">
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="text-gray-600 text-sm sm:text-base mb-1">
            {subheadline}
          </p>

          {/* Pricing hint */}
          <p className="text-gray-700 text-sm font-medium mb-6">
            Flexible plans · cancel anytime
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={primaryCTA.href}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-md transition-colors duration-200"
            >
              {primaryCTA.text}
            </Link>
            <Link
              href="/courses?filter=free"
              className="inline-block border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-md transition-colors duration-200"
            >
              Free Courses
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
