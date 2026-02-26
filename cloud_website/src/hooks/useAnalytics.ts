'use client';

import { useCallback } from 'react';
import {
  trackEvent,
  trackCourseEnrollment,
  trackCourseInteraction,
  trackSearch,
  trackFilter,
  trackEngagement,
  trackFormSubmission,
  trackVideoInteraction,
} from '@/lib/analytics';

export function useAnalytics() {
  const trackCourseView = useCallback((courseId: string, courseName: string) => {
    trackCourseInteraction('view_course', courseId, courseName);
  }, []);

  const trackCourseEnroll = useCallback((courseId: string, courseName: string, price: number) => {
    trackCourseEnrollment(courseId, courseName, price);
    
    // Also send to custom API for server-side tracking
    fetch('/api/analytics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversionType: 'course_enrollment',
        courseId,
        value: price,
      }),
    }).catch(console.error);
  }, []);

  const trackSearchQuery = useCallback((query: string, resultsCount: number) => {
    trackSearch(query, resultsCount);
  }, []);

  const trackFilterApplied = useCallback((filterType: string, filterValue: string) => {
    trackFilter(filterType, filterValue);
  }, []);

  const trackButtonClick = useCallback((buttonName: string, location: string) => {
    trackEngagement('click', `${buttonName} - ${location}`);
  }, []);

  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    trackFormSubmission(formName, success);
  }, []);

  const trackVideoPlay = useCallback((videoId: string) => {
    trackVideoInteraction('play', videoId);
  }, []);

  const trackVideoProgress = useCallback((videoId: string, progress: number) => {
    trackVideoInteraction('progress', videoId, progress);
  }, []);

  const trackCustomEvent = useCallback((action: string, category: string, label?: string, value?: number) => {
    trackEvent(action, category, label, value);
  }, []);

  return {
    trackCourseView,
    trackCourseEnroll,
    trackSearchQuery,
    trackFilterApplied,
    trackButtonClick,
    trackFormSubmit,
    trackVideoPlay,
    trackVideoProgress,
    trackCustomEvent,
  };
}