'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { 
  AcademicCapIcon, 
  TrophyIcon, 
  UserGroupIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/solid';
import { responsiveSpacing, responsiveTypography, touchUtils } from '@/lib/responsive-utils';
import { usePreloadOnHover, usePerformanceMonitor } from '@/hooks/useLazyLoading';

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
  secondaryCTA,
  successMetrics,
  backgroundImage
}: HeroSectionProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { handleMouseEnter } = usePreloadOnHover();
  const { measureOperation } = usePerformanceMonitor('HeroSection');

  // Preload critical resources
  useEffect(() => {
    measureOperation('preload-resources', async () => {
      // Only preload resources in the browser
      if (typeof window !== 'undefined') {
        // Preload next likely page
        if (primaryCTA.href) {
          const jsLink = document.createElement('link');
          jsLink.rel = 'modulepreload';
          jsLink.href = primaryCTA.href;
          document.head.appendChild(jsLink);
        }
      }
    });
  }, [primaryCTA.href, measureOperation]);

  const handleVideoModalOpen = () => {
    measureOperation('video-modal-open', () => {
      setIsVideoModalOpen(true);
    });
  };

  const handleVideoModalClose = () => {
    measureOperation('video-modal-close', () => {
      setIsVideoModalOpen(false);
    });
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
      {/* Background Pattern - CSS gradient pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.2) 2%, transparent 0%)',
        backgroundSize: '100px 100px'
      }}></div>
      
      {/* Background Image Overlay - Progressive loading */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      <div className={`relative max-w-7xl mx-auto ${responsiveSpacing.containerPadding} ${responsiveSpacing.sectionSpacing}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Section */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Main Headline */}
            <div className="space-y-4 lg:space-y-6">
              <h1 className={`${responsiveTypography.heading.h1} font-bold ${responsiveTypography.lineHeight.tight}`}>
                {headline}
              </h1>
              
              <p className={`${responsiveTypography.body.large} text-white ${responsiveTypography.lineHeight.normal} max-w-2xl mx-auto lg:mx-0`}>
                {subheadline}
              </p>
            </div>

            {/* CTA Buttons with preloading */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
              <Link
                href={primaryCTA.href}
                onMouseEnter={handleMouseEnter(primaryCTA.href, 'page')}
                className={`${touchUtils.getTapTargetClasses('lg')} ${touchUtils.getTouchClasses('group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl touch-feedback')}`}
              >
                {primaryCTA.text}
                <ChevronRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <button
                onClick={handleVideoModalOpen}
                className={`${touchUtils.getTapTargetClasses('lg')} ${touchUtils.getTouchClasses('group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/30 hover:border-white text-white font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 touch-feedback')}`}
              >
                <PlayIcon className="mr-2 w-5 h-5" />
                {secondaryCTA.text}
              </button>
            </div>

            {/* Trust Indicators Preview */}
            <div className="pt-6 lg:pt-8 border-t border-white/20">
              <p className="text-white text-sm mb-4 text-center lg:text-left">Graduates now lead teams at:</p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6">
                {['Google', 'Microsoft', 'Amazon', 'Netflix'].map((company) => (
                  <div key={company} className="text-white font-medium text-sm">
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Success Metrics Section - Optimized rendering */}
          <div className="space-y-6 order-first lg:order-last">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20">
              <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-center">
                Career Success Metrics
              </h3>
              
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  {successMetrics.map((metric) => {
                    const IconComponent = {
                      users: UserGroupIcon,
                      trophy: TrophyIcon,
                      chart: ChartBarIcon,
                      academic: AcademicCapIcon
                    }[metric.iconName];
                    
                    return (
                      <div key={metric.id} className="text-center">
                        <div className="flex justify-center mb-2 lg:mb-3">
                          <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                            <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-orange-400" />
                          </div>
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                          {metric.value}
                        </div>
                        <div className="text-white text-xs lg:text-sm font-medium">
                          {metric.label}
                        </div>
                        <div className="text-white/90 text-xs mt-1 hidden sm:block">
                          {metric.description}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Additional CTA with preloading */}
            <div className="text-center">
              <Link
                href="/testimonials"
                onMouseEnter={handleMouseEnter('/testimonials', 'page')}
                className="inline-flex items-center text-white hover:text-white/80 transition-colors duration-300 text-sm lg:text-base"
              >
                View all success stories
                <ChevronRightIcon className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal - Lazy loaded */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={handleVideoModalClose}
              className={`${touchUtils.getTapTargetClasses('md')} ${touchUtils.getTouchClasses('absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors touch-feedback')}`}
              aria-label="Close video"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Platform Overview Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

