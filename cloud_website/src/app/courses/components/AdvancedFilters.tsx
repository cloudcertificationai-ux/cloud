'use client';

import { useState } from 'react';
import { CourseCategory } from '@/types';
import { useFilterState } from '@/hooks/useFilterState';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface AdvancedFiltersProps {
  categories: CourseCategory[];
  priceRange: { min: number; max: number };
  durationRange: { min: number; max: number };
}

export default function AdvancedFilters({
  categories,
  priceRange,
  durationRange,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    level: true,
    mode: true,
    price: false,
    duration: false,
  });
  const [localPriceRange, setLocalPriceRange] = useState({
    min: priceRange.min,
    max: priceRange.max,
  });
  const [localDurationRange, setLocalDurationRange] = useState({
    min: durationRange.min,
    max: durationRange.max,
  });

  const {
    filters,
    hasActiveFilters,
    setFilters,
    clearFilters,
  } = useFilterState();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    if (checked) {
      setFilters({ category: [categorySlug] });
    } else {
      setFilters({ category: undefined });
    }
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    if (checked) {
      setFilters({ level: [level] });
    } else {
      setFilters({ level: undefined });
    }
  };

  const handleModeChange = (mode: string, checked: boolean) => {
    if (checked) {
      setFilters({ mode: [mode] });
    } else {
      setFilters({ mode: undefined });
    }
  };

  const handlePriceRangeChange = () => {
    if (localPriceRange.min !== priceRange.min || localPriceRange.max !== priceRange.max) {
      setFilters({
        priceRange: {
          min: localPriceRange.min,
          max: localPriceRange.max,
        }
      });
    } else {
      setFilters({ priceRange: undefined });
    }
  };

  const handleDurationRangeChange = () => {
    if (localDurationRange.min !== durationRange.min || localDurationRange.max !== durationRange.max) {
      setFilters({
        duration: {
          min: localDurationRange.min,
          max: localDurationRange.max,
        }
      });
    } else {
      setFilters({ duration: undefined });
    }
  };

  const resetPriceRange = () => {
    setLocalPriceRange({ min: priceRange.min, max: priceRange.max });
    setFilters({ priceRange: undefined });
  };

  const resetDurationRange = () => {
    setLocalDurationRange({ min: durationRange.min, max: durationRange.max });
    setFilters({ duration: undefined });
  };

  // Collapsible section component
  const FilterSection = ({ 
    id, 
    title, 
    icon, 
    iconColor, 
    children, 
    count 
  }: { 
    id: keyof typeof expandedSections; 
    title: string; 
    icon: React.ReactNode; 
    iconColor: string; 
    children: React.ReactNode;
    count?: number;
  }) => {
    const isExpanded = expandedSections[id];
    
    return (
      <div className="border-b border-gray-100 last:border-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className={`${iconColor} p-2 rounded-lg bg-opacity-10`}>
              {icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                {title}
              </h4>
              {count !== undefined && count > 0 && (
                <span className="text-xs text-gray-500">{count} selected</span>
              )}
            </div>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-[500px] pb-4' : 'max-h-0'}`}>
          <div className="px-2">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="sticky top-24 h-fit overflow-hidden" padding="none">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Filters</h3>
              {hasActiveFilters && (
                <p className="text-blue-100 text-sm">
                  {Object.values(filters).filter(Boolean).length} active
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden text-white hover:bg-white/20"
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </Button>
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={clearFilters}
            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All Filters
          </Button>
        )}
      </div>

      <div className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>
        <div className="p-6 space-y-2">
          {/* Category Filter */}
          <FilterSection
            id="category"
            title="Category"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
            iconColor="text-blue-600"
            count={filters.category?.length}
          >
            <div className="space-y-2">
              {categories.map((category) => {
                const isChecked = filters.category?.includes(category.slug) || filters.category?.includes(category.id);
                return (
                  <label 
                    key={category.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isChecked 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.slug}
                      checked={isChecked || false}
                      onChange={(e) => handleCategoryChange(category.slug, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className={`text-sm font-medium flex-1 ${isChecked ? 'text-blue-900' : 'text-gray-700'}`}>
                      {category.name}
                    </span>
                    {isChecked && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                );
              })}
            </div>
          </FilterSection>

          {/* Level Filter */}
          <FilterSection
            id="level"
            title="Skill Level"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            iconColor="text-green-600"
            count={filters.level?.length}
          >
            <div className="space-y-2">
              {[
                { value: 'Beginner', icon: '🌱', description: 'New to the field', color: 'green' },
                { value: 'Intermediate', icon: '🚀', description: 'Some experience', color: 'yellow' },
                { value: 'Advanced', icon: '⭐', description: 'Expert level', color: 'purple' }
              ].map((level) => {
                const isChecked = filters.level?.includes(level.value);
                return (
                  <label 
                    key={level.value} 
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isChecked 
                        ? `bg-${level.color}-50 border-2 border-${level.color}-200` 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={level.value}
                      checked={isChecked || false}
                      onChange={(e) => handleLevelChange(level.value, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{level.icon}</span>
                        <span className={`text-sm font-semibold ${isChecked ? 'text-gray-900' : 'text-gray-700'}`}>
                          {level.value}
                        </span>
                        {isChecked && (
                          <svg className="w-4 h-4 text-green-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{level.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          {/* Mode Filter */}
          <FilterSection
            id="mode"
            title="Learning Mode"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            iconColor="text-purple-600"
            count={filters.mode?.length}
          >
            <div className="space-y-2">
              {[
                { value: 'Live', label: 'Live Classes', icon: '🔴', description: 'Real-time instruction', gradient: 'from-red-50 to-pink-50' },
                { value: 'Self-Paced', label: 'Self-Paced', icon: '🟢', description: 'Learn at your pace', gradient: 'from-green-50 to-emerald-50' },
                { value: 'Hybrid', label: 'Hybrid', icon: '🟡', description: 'Mix of both', gradient: 'from-yellow-50 to-amber-50' }
              ].map((mode) => {
                const isChecked = filters.mode?.includes(mode.value);
                return (
                  <label 
                    key={mode.value} 
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isChecked 
                        ? `bg-gradient-to-r ${mode.gradient} border-2 border-gray-300` 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={mode.value}
                      checked={isChecked || false}
                      onChange={(e) => handleModeChange(mode.value, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mode.icon}</span>
                        <span className={`text-sm font-semibold ${isChecked ? 'text-gray-900' : 'text-gray-700'}`}>
                          {mode.label}
                        </span>
                        {isChecked && (
                          <svg className="w-4 h-4 text-purple-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{mode.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          {/* Price Range Filter */}
          <FilterSection
            id="price"
            title="Price Range"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            iconColor="text-yellow-600"
            count={filters.priceRange ? 1 : 0}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Min Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={localPriceRange.min}
                      onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || priceRange.min }))}
                      onBlur={handlePriceRangeChange}
                      className="w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Max Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={localPriceRange.max}
                      onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || priceRange.max }))}
                      onBlur={handlePriceRangeChange}
                      className="w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="999"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Range: ${priceRange.min} - ${priceRange.max}
                </span>
                {filters.priceRange && (
                  <Button variant="ghost" color="error" size="sm" onClick={resetPriceRange} className="text-xs">
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </FilterSection>

          {/* Duration Filter */}
          <FilterSection
            id="duration"
            title="Duration"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="text-indigo-600"
            count={filters.duration ? 1 : 0}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Min Hours</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={durationRange.min}
                      max={durationRange.max}
                      value={localDurationRange.min}
                      onChange={(e) => setLocalDurationRange(prev => ({ ...prev, min: parseInt(e.target.value) || durationRange.min }))}
                      onBlur={handleDurationRangeChange}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">hrs</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Max Hours</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={durationRange.min}
                      max={durationRange.max}
                      value={localDurationRange.max}
                      onChange={(e) => setLocalDurationRange(prev => ({ ...prev, max: parseInt(e.target.value) || durationRange.max }))}
                      onBlur={handleDurationRangeChange}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="200"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">hrs</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Range: {durationRange.min} - {durationRange.max} hours
                </span>
                {filters.duration && (
                  <Button variant="ghost" color="error" size="sm" onClick={resetDurationRange} className="text-xs">
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-900">Active Filters</h5>
              <Badge variant="filled" color="primary" size="sm" rounded>
                {Object.values(filters).filter(Boolean).length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.category?.map(cat => (
                <Badge
                  key={cat}
                  variant="filled"
                  color="primary"
                  size="sm"
                  removable
                  onRemove={() => setFilters({ category: undefined })}
                  rounded
                >
                  {categories.find(c => c.slug === cat || c.id === cat)?.name || cat}
                </Badge>
              ))}
              {filters.level?.map(level => (
                <Badge
                  key={level}
                  variant="filled"
                  color="success"
                  size="sm"
                  removable
                  onRemove={() => setFilters({ level: undefined })}
                  rounded
                >
                  {level}
                </Badge>
              ))}
              {filters.mode?.map(mode => (
                <Badge
                  key={mode}
                  variant="filled"
                  color="accent"
                  size="sm"
                  removable
                  onRemove={() => setFilters({ mode: undefined })}
                  rounded
                >
                  {mode}
                </Badge>
              ))}
              {filters.priceRange && (
                <Badge
                  variant="filled"
                  color="warning"
                  size="sm"
                  removable
                  onRemove={() => setFilters({ priceRange: undefined })}
                  rounded
                >
                  ${filters.priceRange.min} - ${filters.priceRange.max}
                </Badge>
              )}
              {filters.duration && (
                <Badge
                  variant="filled"
                  color="neutral"
                  size="sm"
                  removable
                  onRemove={() => setFilters({ duration: undefined })}
                  rounded
                >
                  {filters.duration.min}h - {filters.duration.max}h
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
