'use client';

import Image from 'next/image';

const logos = [
  { name: 'Google',      src: '/partners/google-logo.svg' },
  { name: 'Microsoft',   src: '/partners/microsoft-logo.svg' },
  { name: 'Amazon',      src: '/partners/amazon-logo.svg' },
  { name: 'Meta',        src: '/partners/meta-logo.svg' },
  { name: 'Netflix',     src: '/partners/netflix-logo.svg' },
  { name: 'Spotify',     src: '/partners/spotify-logo.svg' },
  { name: 'Airbnb',      src: '/partners/airbnb-logo.svg' },
  { name: 'Uber',        src: '/partners/uber-logo.svg' },
];

// Duplicate for seamless infinite loop
const items = [...logos, ...logos];

export default function LearningPathsMarquee() {
  return (
    <section className="py-10 bg-white" style={{ overflowX: 'clip' }}>
      {/* Heading */}
      <div className="text-center mb-8 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Career-Focused Learning Paths
        </h2>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
          Master skills that top employers are hiring for — designed with industry leaders.
        </p>
      </div>

      {/* Marquee strip */}
      <div className="relative w-full flex items-center">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-20 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-20 z-10 bg-gradient-to-l from-white to-transparent" />

        <div
          className="flex items-center gap-12 animate-marquee-rtl"
          style={{ width: 'max-content' }}
        >
          {items.map((logo, idx) => (
            <div
              key={`${logo.name}-${idx}`}
              className="flex-shrink-0 flex items-center justify-center"
              style={{ height: '80px', width: '180px' }}
            >
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                width={180}
                height={80}
                className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                style={{ maxHeight: '80px', width: 'auto' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
