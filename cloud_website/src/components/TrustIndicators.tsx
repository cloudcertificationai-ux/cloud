'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { 
  ShieldCheckIcon, 
  AcademicCapIcon, 
  BuildingOfficeIcon,
  TrophyIcon,
  UserGroupIcon 
} from '@heroicons/react/24/solid';

interface PartnerLogo {
  id: string;
  name: string;
  logoUrl: string;
  description?: string;
  category: 'university' | 'enterprise' | 'industry';
  isActive: boolean;
}

interface Certification {
  id: string;
  name: string;
  description: string;
  badgeUrl: string;
  issuer: string;
  category: 'accreditation' | 'quality' | 'industry' | 'placement';
}

interface Recognition {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  value?: string;
}

interface TrustIndicatorsProps {
  partnerLogos?: PartnerLogo[];
  certifications?: Certification[];
  industryRecognitions?: Recognition[];
  displayStyle?: 'carousel' | 'grid' | 'inline';
  showCategories?: boolean;
  autoRotate?: boolean;
  // Legacy interface support for existing tests
  metrics?: {
    totalStudents: number;
    averageSalaryIncrease: string;
    jobPlacementRate: number;
    courseCompletionRate: number;
    averageRating: number;
    industryPartners: string[];
  };
  showPartnerLogos?: boolean;
  showCertifications?: boolean;
  showStatistics?: boolean;
}

export default function TrustIndicators({
  partnerLogos = [],
  certifications = [],
  industryRecognitions = [],
  displayStyle = 'carousel',
  showCategories = true,
  autoRotate = true,
  // Legacy props for backward compatibility
  metrics,
  showPartnerLogos = true,
  showCertifications = true,
  showStatistics = true
}: TrustIndicatorsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'university' | 'enterprise' | 'industry'>('all');

  // Handle legacy metrics interface for backward compatibility
  let effectivePartnerLogos = partnerLogos;
  let effectiveCertifications = certifications;
  let effectiveRecognitions = industryRecognitions;

  if (metrics) {
    // Convert legacy metrics to new format
    effectivePartnerLogos = metrics.industryPartners.map((partner, index) => ({
      id: `legacy-${index}`,
      name: partner,
      logoUrl: `/partners/${partner.toLowerCase()}-logo.svg`,
      category: 'enterprise' as const,
      isActive: true
    }));

    // Provide default certifications for legacy interface
    effectiveCertifications = [
      {
        id: 'iso',
        name: 'ISO Certified',
        description: 'Quality Management System',
        badgeUrl: '/certifications/iso-certification.svg',
        issuer: 'ISO 9001:2015',
        category: 'quality' as const
      },
      {
        id: 'accredited',
        name: 'Accredited',
        description: 'Training Provider',
        badgeUrl: '/certifications/accredited-badge.svg',
        issuer: 'Education Board',
        category: 'accreditation' as const
      },
      {
        id: 'industry',
        name: 'Industry Recognized',
        description: 'Professional Certificates',
        badgeUrl: '/certifications/industry-recognized.svg',
        issuer: 'Industry Council',
        category: 'industry' as const
      },
      {
        id: 'placement',
        name: 'Placement Guarantee',
        description: 'Career Support',
        badgeUrl: '/certifications/placement-guarantee.svg',
        issuer: 'Career Services',
        category: 'placement' as const
      }
    ];

    effectiveRecognitions = [
      {
        id: 'students',
        title: 'Students Trained',
        description: 'Active learners worldwide',
        icon: UserGroupIcon,
        value: metrics.totalStudents.toLocaleString()
      },
      {
        id: 'placement',
        title: 'Job Placement Rate',
        description: 'Within 6 months',
        icon: TrophyIcon,
        value: `${metrics.jobPlacementRate}%`
      },
      {
        id: 'completion',
        title: 'Course Completion',
        description: 'Students who finish',
        icon: AcademicCapIcon,
        value: `${metrics.courseCompletionRate}%`
      },
      {
        id: 'rating',
        title: 'Average Rating',
        description: 'Student reviews',
        icon: BuildingOfficeIcon,
        value: metrics.averageRating.toString()
      }
    ];
  }

  // Auto-rotate carousel
  useEffect(() => {
    if (autoRotate && displayStyle === 'carousel') {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(partnerLogos.length / 4));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [autoRotate, displayStyle, partnerLogos.length]);

  // Filter partners by category
  const filteredPartners = activeCategory === 'all' 
    ? effectivePartnerLogos 
    : effectivePartnerLogos.filter(partner => partner.category === activeCategory);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(filteredPartners.length / 4));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(filteredPartners.length / 4)) % Math.ceil(filteredPartners.length / 4));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our graduates work at top companies worldwide. Join thousands of successful 
            professionals who've transformed their careers with industry-recognized certifications.
          </p>
        </div>

        {/* Category Filters */}
        {showCategories && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border">
              {[
                { key: 'all', label: 'All Partners' },
                { key: 'university', label: 'Universities' },
                { key: 'enterprise', label: 'Enterprises' },
                { key: 'industry', label: 'Industry Bodies' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    activeCategory === key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Partner Logos Section */}
        {showPartnerLogos && effectivePartnerLogos.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Our Graduates Work At
              </h3>
            </div>
          {displayStyle === 'carousel' ? (
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(filteredPartners.length / 4) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {filteredPartners
                          .slice(slideIndex * 4, (slideIndex + 1) * 4)
                          .map((partner) => (
                            <div
                              key={partner.id}
                              className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group"
                            >
                              <Image
                                src={partner.logoUrl}
                                alt={`${partner.name} logo`}
                                width={120}
                                height={60}
                                className="h-12 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                                loading="lazy"
                                sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 120px"
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Controls */}
              {Math.ceil(filteredPartners.length / 4) > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300"
                    aria-label="Previous partners"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300"
                    aria-label="Next partners"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}

              {/* Carousel Indicators */}
              {Math.ceil(filteredPartners.length / 4) > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {Array.from({ length: Math.ceil(filteredPartners.length / 4) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentSlide === index ? 'bg-blue-600 w-8' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <Image
                    src={partner.logoUrl}
                    alt={`${partner.name} logo`}
                    width={100}
                    height={50}
                    className="h-10 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    loading="lazy"
                    sizes="(max-width: 640px) 60px, (max-width: 768px) 80px, 100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Certifications and Badges */}
        {showCertifications && effectiveCertifications.length > 0 && (
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Certifications & Accreditations
            </h3>
            <p className="text-gray-600">
              Accredited programs with globally recognized certifications
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {effectiveCertifications.map((cert) => (
              <div
                key={cert.id}
                className="text-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="mb-4">
                  <Image
                    src={cert.badgeUrl}
                    alt={`${cert.name} certification`}
                    width={80}
                    height={80}
                    className="mx-auto"
                    loading="lazy"
                    sizes="(max-width: 640px) 60px, 80px"
                  />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{cert.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                <p className="text-xs text-blue-600 font-medium">{cert.issuer}</p>
              </div>
            ))}
          </div>

          {/* Trust badges for legacy compatibility */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">Verified Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">Industry Certified</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">Money-Back Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">24/7 Support</div>
            </div>
          </div>
        </div>
        )}

        {/* Industry Recognition Stats */}
        {showStatistics && effectiveRecognitions.length > 0 && (
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Real-Time Success Metrics
            </h3>
            <p className="text-gray-600">
              Updated daily with the latest student achievements and career outcomes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {effectiveRecognitions.map((recognition) => (
              <div key={recognition.id} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <recognition.icon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                {recognition.value && (
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {recognition.value}
                  </div>
                )}
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {recognition.title}
                </div>
                <div className="text-sm text-gray-600">
                  {recognition.description}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}

