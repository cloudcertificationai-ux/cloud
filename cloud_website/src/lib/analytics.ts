// Google Analytics and GTM configuration for Next.js
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

// Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'GA_MEASUREMENT_ID';
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM_CONTAINER_ID';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date() as any);
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title || document.title,
    page_location: url,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track course enrollment conversions
export const trackCourseEnrollment = (courseId: string, courseName: string, price: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Enhanced Ecommerce tracking
  window.gtag('event', 'purchase', {
    transaction_id: `enrollment_${courseId}_${Date.now()}`,
    value: price,
    currency: 'USD',
    items: [
      {
        item_id: courseId,
        item_name: courseName,
        category: 'Course',
        quantity: 1,
        price: price,
      },
    ],
  });

  // Custom conversion event
  window.gtag('event', 'course_enrollment', {
    event_category: 'Engagement',
    event_label: courseName,
    value: price,
    course_id: courseId,
  });
};
// Track course interactions
export const trackCourseInteraction = (action: string, courseId: string, courseName: string) => {
  trackEvent(action, 'Course Interaction', courseName, undefined);
  
  // Send to custom analytics API
  if (typeof window !== 'undefined') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'course_interaction',
        data: { action, courseId, courseName, timestamp: new Date().toISOString() }
      })
    }).catch(console.error);
  }
};

// Track search queries
export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('search', 'Site Search', query, resultsCount);
};

// Track filter usage
export const trackFilter = (filterType: string, filterValue: string) => {
  trackEvent('filter_applied', 'Course Filtering', `${filterType}: ${filterValue}`);
};

// Track user engagement
export const trackEngagement = (action: string, element: string) => {
  trackEvent(action, 'User Engagement', element);
};

// GTM helper functions
export const pushToDataLayer = (data: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.dataLayer) return;
  
  window.dataLayer.push({
    event: 'custom_event',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean) => {
  trackEvent(
    success ? 'form_submit_success' : 'form_submit_error',
    'Form Interaction',
    formName
  );
  
  pushToDataLayer({
    form_name: formName,
    form_success: success,
  });
};

// Track video interactions (for course previews)
export const trackVideoInteraction = (action: string, videoId: string, progress?: number) => {
  trackEvent(action, 'Video Interaction', videoId, progress);
  
  pushToDataLayer({
    video_id: videoId,
    video_action: action,
    video_progress: progress,
  });
};