'use client';

import { useState } from 'react';
import { CourseCategory, CourseFilters as CourseFiltersType } from '@/types';

interface CourseFiltersProps {
  categories: CourseCategory[];
  priceRange: { min: number; max: number };
  durationRange: { min: number; max: number };
  currentFilters: CourseFiltersType;
  currentQuery: string;
  currentSort: { sortBy: string; sortOrder: string };
}

export default function CourseFilters({
  categories,
  priceRange,
  durationRange,
  currentFilters,
  currentQuery,
  currentSort,
}: CourseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateURL = (newFilters: Partial<CourseFiltersType>) => {
    const url = new URL(window.location.href);
    
    // Clear existing filter params
    url.searchParams.delete('category');
    url.searchParams.delete('level');
    url.searchParams.delete('mode');
    url.searchParams.delete('minPrice');
    url.searchParams.delete('maxPrice');
    url.searchParams.delete('minDuration');
    url.searchParams.delete('maxDuration');
    
    // Set new filter params
    if (newFilters.category && newFilters.category.length > 0) {
      url.searchParams.set('category', newFilters.category[0]);
    }
    if (newFilters.level && newFilters.level.length > 0) {
      url.searchParams.set('level', newFilters.level[0]);
    }
    if (newFilters.mode && newFilters.mode.length > 0) {
      url.searchParams.set('mode', newFilters.mode[0]);
    }
    if (newFilters.priceRange) {
      url.searchParams.set('minPrice', newFilters.priceRange.min.toString());
      url.searchParams.set('maxPrice', newFilters.priceRange.max.toString());
    }
    if (newFilters.duration) {
      url.searchParams.set('minDuration', newFilters.duration.min.toString());
      url.searchParams.set('maxDuration', newFilters.duration.max.toString());
    }
    
    // Reset to first page when filters change
    url.searchParams.set('page', '1');
    
    window.location.href = url.toString();
  };

  const clearFilters = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('category');
    url.searchParams.delete('level');
    url.searchParams.delete('mode');
    url.searchParams.delete('minPrice');
    url.searchParams.delete('maxPrice');
    url.searchParams.delete('minDuration');
    url.searchParams.delete('maxDuration');
    url.searchParams.set('page', '1');
    window.location.href = url.toString();
  };

  const hasActiveFilters = 
    currentFilters.category?.length ||
    currentFilters.level?.length ||
    currentFilters.mode?.length ||
    currentFilters.priceRange ||
    currentFilters.duration;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md border border-blue-200 hover:border-blue-300 transition-colors touch-manipulation"
          aria-expanded={isExpanded}
          aria-controls="filter-content"
        >
          <span className="flex items-center space-x-2">
            <span>{isExpanded ? 'Hide' : 'Show'} Filters</span>
            <svg 
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>

      <div 
        id="filter-content"
        className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'} transition-all duration-300 ease-in-out`}
      >
        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded touch-manipulation"
          >
            Clear all filters
          </button>
        )}

        {/* Category Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Category</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  checked={currentFilters.category?.includes(category.slug) || currentFilters.category?.includes(category.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateURL({ ...currentFilters, category: [category.slug] });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 touch-manipulation"
                />
                <span className="ml-2 text-sm text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Level Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Level</h4>
          <div className="space-y-2">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <label key={level} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                <input
                  type="radio"
                  name="level"
                  value={level}
                  checked={currentFilters.level?.includes(level)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateURL({ ...currentFilters, level: [level] });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 touch-manipulation"
                />
                <span className="ml-2 text-sm text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mode Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Mode</h4>
          <div className="space-y-2">
            {['Live', 'Self-Paced', 'Hybrid'].map((mode) => (
              <label key={mode} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                <input
                  type="radio"
                  name="mode"
                  value={mode}
                  checked={currentFilters.mode?.includes(mode)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateURL({ ...currentFilters, mode: [mode] });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 touch-manipulation"
                />
                <span className="ml-2 text-sm text-gray-700">{mode}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="number"
                placeholder="Min"
                min={priceRange.min}
                max={priceRange.max}
                value={currentFilters.priceRange?.min || ''}
                onChange={(e) => {
                  const min = parseInt(e.target.value) || priceRange.min;
                  const max = currentFilters.priceRange?.max || priceRange.max;
                  updateURL({ ...currentFilters, priceRange: { min, max } });
                }}
                className="w-full sm:w-20 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
              />
              <span className="text-gray-500 hidden sm:block">to</span>
              <input
                type="number"
                placeholder="Max"
                min={priceRange.min}
                max={priceRange.max}
                value={currentFilters.priceRange?.max || ''}
                onChange={(e) => {
                  const max = parseInt(e.target.value) || priceRange.max;
                  const min = currentFilters.priceRange?.min || priceRange.min;
                  updateURL({ ...currentFilters, priceRange: { min, max } });
                }}
                className="w-full sm:w-20 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
              />
            </div>
            <div className="text-xs text-gray-500">
              Range: ${priceRange.min} - ${priceRange.max}
            </div>
          </div>
        </div>

        {/* Duration Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Duration (Hours)</h4>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="number"
                placeholder="Min"
                min={durationRange.min}
                max={durationRange.max}
                value={currentFilters.duration?.min || ''}
                onChange={(e) => {
                  const min = parseInt(e.target.value) || durationRange.min;
                  const max = currentFilters.duration?.max || durationRange.max;
                  updateURL({ ...currentFilters, duration: { min, max } });
                }}
                className="w-full sm:w-20 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
              />
              <span className="text-gray-500 hidden sm:block">to</span>
              <input
                type="number"
                placeholder="Max"
                min={durationRange.min}
                max={durationRange.max}
                value={currentFilters.duration?.max || ''}
                onChange={(e) => {
                  const max = parseInt(e.target.value) || durationRange.max;
                  const min = currentFilters.duration?.min || durationRange.min;
                  updateURL({ ...currentFilters, duration: { min, max } });
                }}
                className="w-full sm:w-20 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
              />
            </div>
            <div className="text-xs text-gray-500">
              Range: {durationRange.min} - {durationRange.max} hours
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}