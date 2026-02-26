'use client';

import { useState, useEffect } from 'react';
import { StudentTestimonial } from '@/types';
import { TestimonialCard } from './TestimonialCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SuccessStoryCarouselProps {
  testimonials: StudentTestimonial[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function SuccessStoryCarousel({
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  className = '',
}: SuccessStoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (testimonials.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No success stories available</p>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel container */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows - Enhanced design */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-700 hover:text-blue-600" aria-hidden="true" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 z-10"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-700 hover:text-blue-600" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Dots indicator - Enhanced design */}
      {testimonials.length > 1 && (
        <div className="flex justify-center mt-8 space-x-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-600 scale-110'
                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-105'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress indicator */}
      {autoPlay && testimonials.length > 1 && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-100 ease-linear"
            style={{ 
              width: `${((currentIndex + 1) / testimonials.length) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
}