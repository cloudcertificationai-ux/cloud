// Import types from main project
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
    originalPrice?: number;
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
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
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
  duration: number;
  isPreview: boolean;
}

// Admin-specific types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: Permission[];
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminRole = 'super_admin' | 'admin' | 'content_manager' | 'instructor_manager' | 'analytics_viewer';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface Student {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  enrolledCourses: string[];
  completedCourses: string[];
  totalSpent: number;
  joinDate: Date;
  lastActive: Date;
  isActive: boolean;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: Date;
  completionDate?: Date;
  progress: number;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
}

export interface Analytics {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  monthlyRevenue: number[];
  monthlyEnrollments: number[];
  topCourses: Array<{
    courseId: string;
    title: string;
    enrollments: number;
    revenue: number;
  }>;
  topInstructors: Array<{
    instructorId: string;
    name: string;
    totalStudents: number;
    averageRating: number;
  }>;
}

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeEnrollments: number;
  recentEnrollments: Enrollment[];
  recentUsers: Student[];
  coursePerformance: Array<{
    courseId: string;
    title: string;
    enrollments: number;
    completionRate: number;
    rating: number;
  }>;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  paymentGateway: {
    stripe: {
      enabled: boolean;
      publicKey: string;
      webhookSecret: string;
    };
    paypal: {
      enabled: boolean;
      clientId: string;
    };
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}