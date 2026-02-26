import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton component for loading states
 * Provides consistent loading placeholders across the application
 */
export default function Skeleton({
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'rounded-md',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could be enhanced with custom wave animation
    none: '',
  };
  
  const combinedStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={combinedStyle}
      {...props}
    />
  );
}

/**
 * Course Card Skeleton
 */
export function CourseCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Image skeleton */}
      <Skeleton height={192} className="w-full" />
      
      {/* Content skeleton */}
      <div className="p-4 sm:p-6">
        {/* Category and level */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton width={80} height={20} className="rounded-full" />
          <Skeleton width={60} height={20} />
        </div>
        
        {/* Title */}
        <Skeleton height={24} className="mb-2" />
        <Skeleton height={20} width="75%" className="mb-4" />
        
        {/* Description */}
        <Skeleton height={16} className="mb-2" />
        <Skeleton height={16} width="90%" className="mb-4" />
        
        {/* Instructor */}
        <Skeleton height={14} width="60%" className="mb-4" />
        
        {/* Meta info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Skeleton width={60} height={14} />
            <Skeleton width={50} height={14} />
          </div>
          <Skeleton width={80} height={14} />
        </div>
        
        {/* Enrollment count */}
        <Skeleton height={14} width="50%" className="mb-4" />
        
        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <Skeleton width={60} height={28} />
          <Skeleton width={100} height={36} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Instructor Card Skeleton
 */
export function InstructorCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        {/* Profile image and basic info */}
        <div className="text-center mb-6">
          <Skeleton variant="circular" width={120} height={120} className="mx-auto mb-4" />
          <Skeleton height={24} width="60%" className="mx-auto mb-1" />
          <Skeleton height={18} width="80%" className="mx-auto mb-2" />
          <Skeleton height={14} width="50%" className="mx-auto" />
        </div>

        {/* Bio */}
        <div className="mb-6">
          <Skeleton height={16} className="mb-2" />
          <Skeleton height={16} className="mb-2" />
          <Skeleton height={16} width="75%" />
        </div>

        {/* Experience */}
        <div className="mb-6">
          <Skeleton height={18} width="30%" className="mb-2" />
          <Skeleton height={14} width="60%" className="mb-2" />
          <div className="flex flex-wrap gap-1">
            <Skeleton width={60} height={24} className="rounded" />
            <Skeleton width={80} height={24} className="rounded" />
            <Skeleton width={70} height={24} className="rounded" />
          </div>
        </div>

        {/* Expertise */}
        <div className="mb-6">
          <Skeleton height={18} width="25%" className="mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton width={70} height={24} className="rounded-full" />
            <Skeleton width={90} height={24} className="rounded-full" />
            <Skeleton width={60} height={24} className="rounded-full" />
            <Skeleton width={80} height={24} className="rounded-full" />
          </div>
        </div>

        {/* Social links */}
        <div className="border-t pt-4">
          <div className="flex justify-center space-x-4">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="circular" width={20} height={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Course Hero Skeleton
 */
export function CourseHeroSkeleton() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Information */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <div className="mb-6">
                <Skeleton height={14} width="60%" />
              </div>

              {/* Course Title and Description */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Skeleton width={100} height={24} className="rounded-full" />
                  <Skeleton width={80} height={24} className="rounded-full" />
                  <Skeleton width={60} height={24} className="rounded-full" />
                </div>

                <Skeleton height={36} className="mb-4" />
                <Skeleton height={32} width="80%" className="mb-6" />
                
                <Skeleton height={20} className="mb-2" />
                <Skeleton height={20} width="90%" className="mb-6" />

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-6">
                  <Skeleton width={120} height={16} />
                  <Skeleton width={100} height={16} />
                  <Skeleton width={140} height={16} />
                  <Skeleton width={110} height={16} />
                </div>
              </div>

              {/* Instructor Preview */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <Skeleton height={20} width="30%" className="mb-4" />
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div>
                    <Skeleton height={18} width={120} className="mb-1" />
                    <Skeleton height={14} width={100} className="mb-1" />
                    <Skeleton height={12} width={80} />
                  </div>
                </div>
              </div>
            </div>

            {/* Course Thumbnail */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <Skeleton height={200} className="w-full" />
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <Skeleton height={32} width="40%" className="mb-2" />
                      <Skeleton height={16} width="60%" />
                    </div>

                    <Skeleton height={48} className="w-full mb-3 rounded-lg" />
                    <Skeleton height={48} className="w-full mb-6 rounded-lg" />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Skeleton width={60} height={14} />
                        <Skeleton width={50} height={14} />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton width={70} height={14} />
                        <Skeleton width={60} height={14} />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton width={40} height={14} />
                        <Skeleton width={80} height={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Page Header Skeleton
 */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton height={32} width="40%" className="mb-4" />
      <Skeleton height={20} width="70%" />
    </div>
  );
}