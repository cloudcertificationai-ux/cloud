/**
 * User interaction flow management for consistent user experience
 */

import { Course, Instructor } from '@/types';

// User flow tracking interface
export interface UserFlowStep {
  page: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// User journey types
export type UserJourney = 
  | 'discovery' // Homepage -> Courses -> Course Detail
  | 'search' // Search -> Results -> Course Detail
  | 'instructor-led' // Instructors -> Instructor Profile -> Courses
  | 'category-browse' // Categories -> Course List -> Course Detail
  | 'direct-access'; // Direct link to specific page

// Flow state management
class UserFlowManager {
  private flowHistory: UserFlowStep[] = [];
  private currentJourney: UserJourney | null = null;
  private sessionStartTime: Date = new Date();

  /**
   * Track a user action
   */
  trackStep(page: string, action: string, metadata?: Record<string, any>): void {
    const step: UserFlowStep = {
      page,
      action,
      timestamp: new Date(),
      metadata,
    };

    this.flowHistory.push(step);
    this.updateJourney(step);

    // Keep only last 20 steps to prevent memory issues
    if (this.flowHistory.length > 20) {
      this.flowHistory = this.flowHistory.slice(-20);
    }
  }

  /**
   * Determine user journey based on flow history
   */
  private updateJourney(step: UserFlowStep): void {
    const recentSteps = this.flowHistory.slice(-3);
    
    if (recentSteps.length >= 2) {
      const [prev, current] = recentSteps.slice(-2);
      
      if (prev.page === '/' && current.page === '/courses') {
        this.currentJourney = 'discovery';
      } else if (prev.action === 'search' && current.page === '/courses') {
        this.currentJourney = 'search';
      } else if (prev.page === '/instructors' && current.page.startsWith('/instructors/')) {
        this.currentJourney = 'instructor-led';
      } else if (prev.page === '/courses' && current.page.startsWith('/courses/')) {
        this.currentJourney = 'category-browse';
      } else if (this.flowHistory.length === 1) {
        this.currentJourney = 'direct-access';
      }
    }
  }

  /**
   * Get current user journey
   */
  getCurrentJourney(): UserJourney | null {
    return this.currentJourney;
  }

  /**
   * Get flow history
   */
  getFlowHistory(): UserFlowStep[] {
    return [...this.flowHistory];
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime.getTime();
  }

  /**
   * Get recommended next steps based on current flow
   */
  getRecommendedNextSteps(currentPage: string): Array<{
    href: string;
    label: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const recommendations: Array<{
      href: string;
      label: string;
      reason: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    const journey = this.getCurrentJourney();
    const recentPages = this.flowHistory.slice(-3).map(step => step.page);

    switch (currentPage) {
      case '/':
        recommendations.push(
          { href: '/courses', label: 'Browse Courses', reason: 'Start your learning journey', priority: 'high' },
          { href: '/about', label: 'Learn About Us', reason: 'Build trust and confidence', priority: 'medium' },
          { href: '/instructors', label: 'Meet Instructors', reason: 'See our expert team', priority: 'medium' }
        );
        break;

      case '/courses':
        if (journey === 'discovery') {
          recommendations.push(
            { href: '/courses?category=web-development', label: 'Web Development', reason: 'Popular category', priority: 'high' },
            { href: '/instructors', label: 'Meet Instructors', reason: 'Learn from experts', priority: 'medium' }
          );
        } else if (journey === 'search') {
          recommendations.push(
            { href: '/contact', label: 'Need Help?', reason: 'Get personalized guidance', priority: 'high' },
            { href: '/about', label: 'Why Choose Us', reason: 'See our success stories', priority: 'medium' }
          );
        }
        break;

      case '/about':
        recommendations.push(
          { href: '/courses', label: 'Start Learning', reason: 'Begin your journey', priority: 'high' },
          { href: '/contact', label: 'Get In Touch', reason: 'Ask questions', priority: 'medium' },
          { href: '/instructors', label: 'Meet Our Team', reason: 'See who will teach you', priority: 'medium' }
        );
        break;

      case '/instructors':
        recommendations.push(
          { href: '/courses', label: 'View Courses', reason: 'See what they teach', priority: 'high' },
          { href: '/about', label: 'Our Success Stories', reason: 'See student outcomes', priority: 'medium' }
        );
        break;

      case '/contact':
        recommendations.push(
          { href: '/courses', label: 'Browse Courses', reason: 'Explore our programs', priority: 'high' },
          { href: '/about', label: 'Learn More', reason: 'Understand our approach', priority: 'medium' }
        );
        break;

      default:
        if (currentPage.startsWith('/courses/')) {
          // Course detail page
          recommendations.push(
            { href: '#enroll', label: 'Enroll Now', reason: 'Start this course', priority: 'high' },
            { href: '/courses', label: 'Browse More', reason: 'Explore other options', priority: 'medium' },
            { href: '/instructors', label: 'Meet Instructor', reason: 'Learn about your teacher', priority: 'medium' }
          );
        }
    }

    return recommendations;
  }

  /**
   * Check if user seems lost or confused
   */
  detectUserConfusion(): {
    isConfused: boolean;
    reasons: string[];
    suggestions: string[];
  } {
    const reasons: string[] = [];
    const suggestions: string[] = [];
    
    // Check for rapid page switching
    const recentSteps = this.flowHistory.slice(-5);
    const uniquePages = new Set(recentSteps.map(step => step.page));
    
    if (recentSteps.length >= 4 && uniquePages.size >= 4) {
      reasons.push('Rapid page switching detected');
      suggestions.push('Consider using our search feature to find what you need');
    }

    // Check for repeated searches
    const searchActions = this.flowHistory.filter(step => step.action === 'search').slice(-3);
    if (searchActions.length >= 3) {
      const timeDiff = searchActions[searchActions.length - 1].timestamp.getTime() - searchActions[0].timestamp.getTime();
      if (timeDiff < 60000) { // Within 1 minute
        reasons.push('Multiple searches in short time');
        suggestions.push('Contact us for personalized course recommendations');
      }
    }

    // Check for long session without engagement
    const sessionDuration = this.getSessionDuration();
    const engagementActions = this.flowHistory.filter(step => 
      ['course_view', 'instructor_view', 'enroll_click'].includes(step.action)
    );
    
    if (sessionDuration > 300000 && engagementActions.length === 0) { // 5 minutes without engagement
      reasons.push('Long session without course engagement');
      suggestions.push('Browse our featured courses or contact us for guidance');
    }

    return {
      isConfused: reasons.length > 0,
      reasons,
      suggestions,
    };
  }

  /**
   * Get personalized recommendations based on user behavior
   */
  getPersonalizedRecommendations(): {
    courses: string[];
    categories: string[];
    actions: string[];
  } {
    const viewedCourses = this.flowHistory
      .filter(step => step.action === 'course_view' && step.metadata?.courseId)
      .map(step => step.metadata!.courseId);

    const searchedTerms = this.flowHistory
      .filter(step => step.action === 'search' && step.metadata?.query)
      .map(step => step.metadata!.query);

    const viewedCategories = this.flowHistory
      .filter(step => step.action === 'category_view' && step.metadata?.category)
      .map(step => step.metadata!.category);

    // Simple recommendation logic (in a real app, this would be more sophisticated)
    const recommendations = {
      courses: [...new Set(viewedCourses)].slice(0, 5),
      categories: [...new Set(viewedCategories)].slice(0, 3),
      actions: [] as string[],
    };

    // Suggest actions based on behavior
    if (viewedCourses.length > 0 && !this.flowHistory.some(step => step.action === 'enroll_click')) {
      recommendations.actions.push('Consider enrolling in a course you viewed');
    }

    if (searchedTerms.length > 0 && viewedCourses.length === 0) {
      recommendations.actions.push('Browse courses related to your searches');
    }

    if (this.flowHistory.length > 5 && !this.flowHistory.some(step => step.action === 'contact_view')) {
      recommendations.actions.push('Contact us for personalized guidance');
    }

    return recommendations;
  }

  /**
   * Reset flow tracking (for new session)
   */
  reset(): void {
    this.flowHistory = [];
    this.currentJourney = null;
    this.sessionStartTime = new Date();
  }
}

// Create singleton instance
export const userFlowManager = new UserFlowManager();

// Helper functions for common tracking scenarios
export function trackPageView(page: string, metadata?: Record<string, any>): void {
  userFlowManager.trackStep(page, 'page_view', metadata);
}

export function trackCourseView(courseId: string, courseTitle: string): void {
  userFlowManager.trackStep(window.location.pathname, 'course_view', {
    courseId,
    courseTitle,
  });
}

export function trackInstructorView(instructorId: string, instructorName: string): void {
  userFlowManager.trackStep(window.location.pathname, 'instructor_view', {
    instructorId,
    instructorName,
  });
}

export function trackSearch(query: string, resultsCount: number): void {
  userFlowManager.trackStep(window.location.pathname, 'search', {
    query,
    resultsCount,
  });
}

export function trackEnrollmentClick(courseId: string): void {
  userFlowManager.trackStep(window.location.pathname, 'enroll_click', {
    courseId,
  });
}

export function trackCategoryView(category: string): void {
  userFlowManager.trackStep(window.location.pathname, 'category_view', {
    category,
  });
}

export function trackContactView(): void {
  userFlowManager.trackStep('/contact', 'contact_view');
}

// React hook for user flow tracking
export function useUserFlow() {
  return {
    trackPageView,
    trackCourseView,
    trackInstructorView,
    trackSearch,
    trackEnrollmentClick,
    trackCategoryView,
    trackContactView,
    getCurrentJourney: () => userFlowManager.getCurrentJourney(),
    getRecommendedNextSteps: (currentPage: string) => userFlowManager.getRecommendedNextSteps(currentPage),
    detectUserConfusion: () => userFlowManager.detectUserConfusion(),
    getPersonalizedRecommendations: () => userFlowManager.getPersonalizedRecommendations(),
    getFlowHistory: () => userFlowManager.getFlowHistory(),
    getSessionDuration: () => userFlowManager.getSessionDuration(),
  };
}