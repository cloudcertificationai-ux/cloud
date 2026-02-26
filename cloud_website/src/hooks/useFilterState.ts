'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { CourseFilters } from '@/types';

export interface FilterState {
  query: string;
  filters: CourseFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export function useFilterState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current state from URL
  const currentState = useMemo((): FilterState => {
    const query = searchParams.get('search') || searchParams.get('q') || '';
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const mode = searchParams.get('mode');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minDuration = searchParams.get('minDuration');
    const maxDuration = searchParams.get('maxDuration');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const filters: CourseFilters = {
      category: category ? [category] : undefined,
      level: level ? [level] : undefined,
      mode: mode ? [mode] : undefined,
      priceRange: minPrice && maxPrice ? {
        min: parseInt(minPrice),
        max: parseInt(maxPrice)
      } : undefined,
      duration: minDuration && maxDuration ? {
        min: parseInt(minDuration),
        max: parseInt(maxDuration)
      } : undefined,
    };

    return {
      query,
      filters,
      sortBy,
      sortOrder,
      page,
      limit,
    };
  }, [searchParams]);

  // Update URL with new state
  const updateState = useCallback((newState: Partial<FilterState>) => {
    const url = new URL(window.location.href);
    
    // Clear existing params
    url.searchParams.delete('search');
    url.searchParams.delete('q');
    url.searchParams.delete('category');
    url.searchParams.delete('level');
    url.searchParams.delete('mode');
    url.searchParams.delete('minPrice');
    url.searchParams.delete('maxPrice');
    url.searchParams.delete('minDuration');
    url.searchParams.delete('maxDuration');
    url.searchParams.delete('sortBy');
    url.searchParams.delete('sortOrder');
    url.searchParams.delete('page');
    url.searchParams.delete('limit');

    // Merge with current state
    const updatedState = { ...currentState, ...newState };

    // Set new params
    if (updatedState.query.trim()) {
      url.searchParams.set('search', updatedState.query.trim());
    }

    if (updatedState.filters.category && updatedState.filters.category.length > 0) {
      url.searchParams.set('category', updatedState.filters.category[0]);
    }

    if (updatedState.filters.level && updatedState.filters.level.length > 0) {
      url.searchParams.set('level', updatedState.filters.level[0]);
    }

    if (updatedState.filters.mode && updatedState.filters.mode.length > 0) {
      url.searchParams.set('mode', updatedState.filters.mode[0]);
    }

    if (updatedState.filters.priceRange) {
      url.searchParams.set('minPrice', updatedState.filters.priceRange.min.toString());
      url.searchParams.set('maxPrice', updatedState.filters.priceRange.max.toString());
    }

    if (updatedState.filters.duration) {
      url.searchParams.set('minDuration', updatedState.filters.duration.min.toString());
      url.searchParams.set('maxDuration', updatedState.filters.duration.max.toString());
    }

    if (updatedState.sortBy !== 'relevance') {
      url.searchParams.set('sortBy', updatedState.sortBy);
    }

    if (updatedState.sortOrder !== 'desc') {
      url.searchParams.set('sortOrder', updatedState.sortOrder);
    }

    if (updatedState.page !== 1) {
      url.searchParams.set('page', updatedState.page.toString());
    }

    if (updatedState.limit !== 12) {
      url.searchParams.set('limit', updatedState.limit.toString());
    }

    // Navigate to new URL
    router.push(url.pathname + url.search);
  }, [currentState, router]);

  // Helper functions for common operations
  const setQuery = useCallback((query: string) => {
    updateState({ query, page: 1 }); // Reset to first page when searching
  }, [updateState]);

  const setFilters = useCallback((filters: Partial<CourseFilters>) => {
    updateState({ 
      filters: { ...currentState.filters, ...filters }, 
      page: 1 // Reset to first page when filtering
    });
  }, [currentState.filters, updateState]);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    updateState({ sortBy, sortOrder, page: 1 }); // Reset to first page when sorting
  }, [updateState]);

  const setPage = useCallback((page: number) => {
    updateState({ page });
  }, [updateState]);

  const clearFilters = useCallback(() => {
    updateState({
      filters: {},
      page: 1,
    });
  }, [updateState]);

  const clearAll = useCallback(() => {
    updateState({
      query: '',
      filters: {},
      sortBy: 'relevance',
      sortOrder: 'desc',
      page: 1,
      limit: 12,
    });
  }, [updateState]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      currentState.filters.category?.length ||
      currentState.filters.level?.length ||
      currentState.filters.mode?.length ||
      currentState.filters.priceRange ||
      currentState.filters.duration
    );
  }, [currentState.filters]);

  const hasActiveQuery = useMemo(() => {
    return currentState.query.trim().length > 0;
  }, [currentState.query]);

  return {
    // Current state
    ...currentState,
    
    // State checkers
    hasActiveFilters,
    hasActiveQuery,
    
    // State updaters
    updateState,
    setQuery,
    setFilters,
    setSorting,
    setPage,
    clearFilters,
    clearAll,
  };
}