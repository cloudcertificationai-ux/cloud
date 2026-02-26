// Core data models for the Anywheredoor platform

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  category: CourseCategory;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: {
    hours: number;
    weeks: number;
  };
  price: {
    amount: number;
    currency: string;
    originalPrice?: number; // for discounts
  };
  rating: {
    average: number;
    count: number;
  };
  thumbnailUrl: string;
  instructorIds: string[];
  curriculum: CurriculumModule[];
  tags: string[];
  mode: 'Live' | 'Self-Paced' | 'Hybrid';
  enrollmentCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  cohorts?: CohortInfo[]; // Add cohort information
}

export interface CohortInfo {
  id: string;
  startDate: Date;
  endDate: Date;
  enrollmentDeadline: Date;
  maxStudents: number;
  currentEnrollment: number;
  status: 'Open' | 'Full' | 'Starting Soon' | 'In Progress' | 'Completed';
  timeZone: string;
  schedule: {
    days: string[];
    time: string;
  };
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  profileImageUrl: string;
  expertise: string[];
  experience: {
    years: number;
    companies: string[];
  };
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  courseIds: string[];
  rating: {
    average: number;
    count: number;
  };
  credentials?: string[]; // Add credentials
  professionalBackground?: {
    currentRole?: string;
    previousRoles?: Array<{
      title: string;
      company: string;
      duration: string;
      description?: string;
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      year?: string;
    }>;
    certifications?: string[];
    achievements?: string[];
  };
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  estimatedHours: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'Video' | 'Reading' | 'Exercise' | 'Quiz';
  duration: number; // in minutes
  isPreview: boolean;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface SEOMetadata {
  title: string; // 50-60 characters
  description: string; // 150-160 characters
  keywords: string[];
  canonicalUrl: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
    type: 'website' | 'article' | 'course';
  };
  twitterCard: {
    card: 'summary_large_image';
    title: string;
    description: string;
    image: string;
  };
  structuredData: Record<string, unknown>; // JSON-LD schema
}

export interface StudentTestimonial {
  id: string;
  studentName: string;
  studentPhoto: string;
  courseCompleted: string;
  rating: number;
  testimonialText: string;
  careerOutcome: {
    previousRole?: string;
    currentRole: string;
    salaryIncrease?: string;
    companyName: string;
  };
  isVerified: boolean;
  dateCompleted: Date;
}

export interface SuccessMetrics {
  totalStudents: number;
  averageSalaryIncrease: string;
  jobPlacementRate: number;
  courseCompletionRate: number;
  averageRating: number;
  industryPartners: string[];
}

// Search and filter types
export interface CourseFilters {
  category?: string[];
  level?: string[];
  mode?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: {
    min: number;
    max: number;
  };
}

export interface SearchParams {
  query?: string;
  filters?: CourseFilters;
  sortBy?: 'relevance' | 'rating' | 'price' | 'duration' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResults {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Data generation and validation types
export interface DataGeneratorOptions {
  count?: number;
  seed?: number;
  includeInactive?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Content optimization types
export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  seoMetadata: SEOMetadata;
  targetKeywords: string[];
  readingTime: number;
  lastUpdated: Date;
  author: string;
  category: string;
}

// Enterprise and business solution types
export interface EnterpriseSolution {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
  pricing?: string;
  category: 'training' | 'platform' | 'consulting' | 'certification';
}

export interface CompanyLogo {
  id: string;
  name: string;
  logoUrl: string;
  category: 'fortune500' | 'startup' | 'government' | 'nonprofit';
  description?: string;
  caseStudyUrl?: string;
}

export interface CaseStudy {
  id: string;
  companyName: string;
  companyLogo: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  testimonial?: {
    quote: string;
    author: string;
    title: string;
  };
  isPublic: boolean;
}

export interface EnterpriseInquiry {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  trainingNeeds: string[];
  timeline: string;
  budget?: string;
  message: string;
  requestType: 'demo' | 'consultation' | 'custom_training' | 'platform_access';
}

// Re-export design system types
export * from './design-system';
