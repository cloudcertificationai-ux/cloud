'use client';

import { StudentTestimonial } from '@/types';
import { TestimonialCard } from './TestimonialCard';
import { SuccessStoryCarousel } from './SuccessStoryCarousel';
import { responsiveSpacing, responsiveTypography, responsiveGrid } from '@/lib/responsive-utils';

interface TestimonialsSectionProps {
  testimonials: StudentTestimonial[];
  title?: string;
  subtitle?: string;
  displayMode?: 'carousel' | 'grid';
  showViewAll?: boolean;
  className?: string;
}

export function TestimonialsSection({
  testimonials,
  title = "Real Stories, Incredible Journeys",
  subtitle = "Discover how our learners transformed their careers and achieved their professional goals",
  displayMode = 'carousel',
  showViewAll = true,
  className = '',
}: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className={`${responsiveSpacing.sectionSpacing} bg-gray-50 ${className}`}>
      <div className={`max-w-7xl mx-auto ${responsiveSpacing.containerPadding}`}>
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h2 className={`${responsiveTypography.heading.h2} font-bold text-gray-900 mb-4`}>
            {title}
          </h2>
          <p className={`${responsiveTypography.body.large} text-gray-600 max-w-3xl mx-auto`}>
            {subtitle}
          </p>
        </div>

        {/* Testimonials Display */}
        {displayMode === 'carousel' ? (
          <div className="max-w-4xl mx-auto">
            <SuccessStoryCarousel 
              testimonials={testimonials}
              autoPlay={true}
              autoPlayInterval={6000}
            />
          </div>
        ) : (
          <div className={`grid ${responsiveGrid.columns['1-2-3']} ${responsiveSpacing.gridGap}`}>
            {testimonials.slice(0, 6).map((testimonial) => (
              <TestimonialCard 
                key={testimonial.id} 
                testimonial={testimonial}
                className="h-full"
              />
            ))}
          </div>
        )}

        {/* View All Link */}
        {showViewAll && testimonials.length > (displayMode === 'carousel' ? 1 : 6) && (
          <div className="text-center mt-8 lg:mt-12">
            <a
              href="/testimonials"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-300"
            >
              View All Success Stories
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        )}

        {/* Success Metrics Summary */}
        <div className={`mt-12 lg:mt-16 grid ${responsiveGrid.columns['2-4']} ${responsiveSpacing.gridGap}`}>
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">
              {testimonials.length}+
            </div>
            <div className="text-sm text-gray-600">Success Stories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-2">
              {Math.round(testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length * 10) / 10}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-2">
              {testimonials.filter(t => t.careerOutcome.salaryIncrease).length}
            </div>
            <div className="text-sm text-gray-600">Career Advances</div>
          </div>
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold text-orange-600 mb-2">
              {new Set(testimonials.map(t => t.careerOutcome.companyName)).size}+
            </div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
        </div>
      </div>
    </section>
  );
}