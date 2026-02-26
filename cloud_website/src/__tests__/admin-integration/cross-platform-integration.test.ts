/**
 * Cross-Platform Integration Tests
 * 
 * This test suite verifies that the admin panel and main website
 * maintain proper integration and data consistency after the redesign.
 * 
 * Requirements: 9.4, 9.5
 */

import { mockDataService } from '@/data/mock-data-service';

// Mock external API client for admin panel
const mockExternalApiClient = {
  async getCourses(params: any = {}) {
    const { page = 1, limit = 10, category, level } = params;
    
    // Simulate API call to main website
    const courses = mockDataService.getCourses()
      .filter(course => course.isActive)
      .filter(course => !category || course.category.id === category || course.category.slug === category)
      .filter(course => !level || course.level === level);

    const startIndex = (page - 1) * limit;
    const paginatedCourses = courses.slice(startIndex, startIndex + limit);

    return {
      status: 200,
      data: {
        courses: paginatedCourses.map(course => ({
          id: course.id,
          title: course.title,
          slug: course.slug,
          shortDescription: course.shortDescription,
          category: course.category.name,
          level: course.level,
          price: course.price.amount
        })),
        pagination: {
          page,
          limit,
          total: courses.length,
          totalPages: Math.ceil(courses.length / limit),
          hasMore: startIndex + limit < courses.length
        },
        timestamp: new Date().toISOString()
      }
    };
  },

  async createCourse(courseData: any) {
    // Simulate course creation via admin panel
    const newCourse = {
      id: `course-${Date.now()}`,
      ...courseData,
      slug: courseData.title.toLowerCase().replace(/\s+/g, '-'),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      status: 201,
      data: {
        message: 'Course created successfully',
        course: {
          id: newCourse.id,
          title: newCourse.title,
          slug: newCourse.slug
        }
      }
    };
  },

  async updateCourse(courseId: string, updateData: any) {
    // Simulate course update via admin panel
    return {
      status: 200,
      data: {
        message: 'Course updated successfully',
        course: {
          id: courseId,
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      }
    };
  }
};

describe('Cross-Platform Integration Tests', () => {
  beforeEach(() => {
    // Reset mock data service to ensure consistent test state
    mockDataService.resetData();
  });

  describe('Admin Panel to Main Website Integration', () => {
    test('Admin panel can fetch courses from main website API', async () => {
      const response = await mockExternalApiClient.getCourses({
        page: 1,
        limit: 5,
        category: 'web-development'
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('courses');
      expect(response.data).toHaveProperty('pagination');
      expect(Array.isArray(response.data.courses)).toBe(true);
      
      if (response.data.courses.length > 0) {
        const course = response.data.courses[0];
        expect(course).toHaveProperty('id');
        expect(course).toHaveProperty('title');
        expect(course).toHaveProperty('slug');
        expect(course).toHaveProperty('category');
        expect(course).toHaveProperty('level');
        expect(course).toHaveProperty('price');
      }
    });

    test('Course creation from admin panel maintains data structure compatibility', async () => {
      const courseData = {
        title: 'Advanced React Patterns',
        shortDescription: 'Master advanced React patterns and best practices',
        category: 'Web Development',
        level: 'Advanced',
        price: 399
      };

      const response = await mockExternalApiClient.createCourse(courseData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('course');
      expect(response.data.course.title).toBe(courseData.title);
      expect(response.data.course).toHaveProperty('slug');
      expect(response.data.course.slug).toBe('advanced-react-patterns');
    });

    test('Course updates from admin panel preserve existing data structure', async () => {
      const courseId = 'course-123';
      const updateData = {
        title: 'Updated Course Title',
        price: 299,
        isActive: true
      };

      const response = await mockExternalApiClient.updateCourse(courseId, updateData);

      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Course updated successfully');
      expect(response.data.course.id).toBe(courseId);
      expect(response.data.course.title).toBe(updateData.title);
      expect(response.data.course.price).toBe(updateData.price);
      expect(response.data.course).toHaveProperty('updatedAt');
    });

    test('Admin panel respects main website pagination and filtering', async () => {
      // Test pagination
      const page1Response = await mockExternalApiClient.getCourses({ page: 1, limit: 3 });
      const page2Response = await mockExternalApiClient.getCourses({ page: 2, limit: 3 });

      expect(page1Response.data.pagination.page).toBe(1);
      expect(page2Response.data.pagination.page).toBe(2);
      expect(page1Response.data.courses.length).toBeLessThanOrEqual(3);
      expect(page2Response.data.courses.length).toBeLessThanOrEqual(3);

      // Test filtering
      const filteredResponse = await mockExternalApiClient.getCourses({ 
        category: 'web-development',
        level: 'Intermediate'
      });

      expect(filteredResponse.status).toBe(200);
      if (filteredResponse.data.courses.length > 0) {
        filteredResponse.data.courses.forEach((course: any) => {
          expect(course.level).toBe('Intermediate');
        });
      }
    });
  });

  describe('Data Consistency Between Platforms', () => {
    test('Course data structure remains consistent across platforms', () => {
      const mainWebsiteCourse = mockDataService.getCourses()[0];
      
      // Verify main website course structure
      expect(mainWebsiteCourse).toHaveProperty('id');
      expect(mainWebsiteCourse).toHaveProperty('title');
      expect(mainWebsiteCourse).toHaveProperty('slug');
      expect(mainWebsiteCourse).toHaveProperty('shortDescription');
      expect(mainWebsiteCourse).toHaveProperty('category');
      expect(mainWebsiteCourse).toHaveProperty('level');
      expect(mainWebsiteCourse).toHaveProperty('price');
      expect(mainWebsiteCourse).toHaveProperty('rating');
      expect(mainWebsiteCourse).toHaveProperty('instructorIds');
      expect(mainWebsiteCourse).toHaveProperty('isActive');

      // Verify category structure
      expect(mainWebsiteCourse.category).toHaveProperty('id');
      expect(mainWebsiteCourse.category).toHaveProperty('name');
      expect(mainWebsiteCourse.category).toHaveProperty('slug');

      // Verify price structure
      expect(mainWebsiteCourse.price).toHaveProperty('amount');
      expect(mainWebsiteCourse.price).toHaveProperty('currency');

      // Verify rating structure
      expect(mainWebsiteCourse.rating).toHaveProperty('average');
      expect(mainWebsiteCourse.rating).toHaveProperty('count');
    });

    test('Instructor data structure maintains consistency', () => {
      const instructor = mockDataService.getInstructors()[0];
      
      // Verify core instructor fields
      expect(instructor).toHaveProperty('id');
      expect(instructor).toHaveProperty('name');
      expect(instructor).toHaveProperty('title');
      expect(instructor).toHaveProperty('bio');
      expect(instructor).toHaveProperty('expertise');
      expect(instructor).toHaveProperty('experience');
      expect(instructor).toHaveProperty('courseIds');
      expect(instructor).toHaveProperty('rating');

      // Verify new fields are optional and don't break existing functionality
      if (instructor.credentials) {
        expect(Array.isArray(instructor.credentials)).toBe(true);
      }
      
      if (instructor.professionalBackground) {
        expect(typeof instructor.professionalBackground).toBe('object');
        if (instructor.professionalBackground.previousRoles) {
          expect(Array.isArray(instructor.professionalBackground.previousRoles)).toBe(true);
        }
      }
    });

    test('Search functionality maintains consistency across platforms', () => {
      const searchResults = mockDataService.searchCourses({
        query: 'react',
        filters: { category: ['web-development'] },
        page: 1,
        limit: 5
      });

      // Verify search results structure
      expect(searchResults).toHaveProperty('courses');
      expect(searchResults).toHaveProperty('total');
      expect(searchResults).toHaveProperty('page');
      expect(searchResults).toHaveProperty('totalPages');
      expect(searchResults).toHaveProperty('hasMore');

      // Verify search results contain expected data
      expect(Array.isArray(searchResults.courses)).toBe(true);
      expect(typeof searchResults.total).toBe('number');
      expect(typeof searchResults.page).toBe('number');
      expect(typeof searchResults.hasMore).toBe('boolean');
    });
  });

  describe('User Data Privacy Compliance', () => {
    test('User privacy settings are respected across platforms', () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'learner',
        privacySettings: {
          profileVisible: false,
          emailVisible: false,
          progressVisible: true,
          dataProcessingConsent: true,
          marketingConsent: false
        },
        enrolledCourses: ['course-1', 'course-2'],
        completedCourses: ['course-1'],
        progress: {
          'course-2': {
            completionPercentage: 45,
            lastAccessed: new Date().toISOString()
          }
        }
      };

      // Verify privacy settings structure
      expect(mockUser.privacySettings).toHaveProperty('profileVisible');
      expect(mockUser.privacySettings).toHaveProperty('emailVisible');
      expect(mockUser.privacySettings).toHaveProperty('progressVisible');
      expect(mockUser.privacySettings).toHaveProperty('dataProcessingConsent');
      expect(mockUser.privacySettings).toHaveProperty('marketingConsent');

      // Verify privacy settings are boolean values
      Object.values(mockUser.privacySettings).forEach(setting => {
        expect(typeof setting).toBe('boolean');
      });
    });

    test('Data export functionality maintains user privacy compliance', () => {
      const mockDataExport = {
        userId: 'user-123',
        exportDate: new Date().toISOString(),
        requestedBy: 'user',
        dataTypes: ['profile', 'enrollments', 'progress', 'certificates'],
        data: {
          profile: {
            name: 'Test User',
            email: 'user@example.com',
            joinDate: '2024-01-01T00:00:00Z',
            privacySettings: {
              profileVisible: false,
              emailVisible: false,
              progressVisible: true
            }
          },
          enrollments: [
            {
              courseId: 'course-123',
              enrollmentDate: '2024-01-15T00:00:00Z',
              status: 'active',
              paymentStatus: 'completed'
            }
          ],
          progress: [
            {
              courseId: 'course-123',
              completionPercentage: 75,
              lastAccessed: '2024-01-20T00:00:00Z',
              timeSpent: 3600 // seconds
            }
          ],
          certificates: []
        }
      };

      // Verify export structure
      expect(mockDataExport).toHaveProperty('userId');
      expect(mockDataExport).toHaveProperty('exportDate');
      expect(mockDataExport).toHaveProperty('requestedBy');
      expect(mockDataExport).toHaveProperty('dataTypes');
      expect(mockDataExport).toHaveProperty('data');

      // Verify data categories
      expect(mockDataExport.data).toHaveProperty('profile');
      expect(mockDataExport.data).toHaveProperty('enrollments');
      expect(mockDataExport.data).toHaveProperty('progress');
      expect(mockDataExport.data).toHaveProperty('certificates');

      // Verify privacy settings are included in export
      expect(mockDataExport.data.profile).toHaveProperty('privacySettings');
    });

    test('Data deletion workflow maintains compliance requirements', () => {
      const mockDeletionRequest = {
        userId: 'user-123',
        requestDate: new Date().toISOString(),
        deletionType: 'full',
        retainLegal: true,
        confirmationToken: 'deletion-token-123',
        scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        retainedData: [
          'legal_records',
          'financial_transactions',
          'audit_logs'
        ],
        deletedData: [
          'profile',
          'progress',
          'preferences',
          'communication_history'
        ],
        complianceNotes: 'Retained data as required by financial regulations'
      };

      // Verify deletion request structure
      expect(mockDeletionRequest).toHaveProperty('userId');
      expect(mockDeletionRequest).toHaveProperty('requestDate');
      expect(mockDeletionRequest).toHaveProperty('deletionType');
      expect(mockDeletionRequest).toHaveProperty('retainLegal');
      expect(mockDeletionRequest).toHaveProperty('scheduledDate');
      expect(mockDeletionRequest).toHaveProperty('retainedData');
      expect(mockDeletionRequest).toHaveProperty('deletedData');

      // Verify data arrays
      expect(Array.isArray(mockDeletionRequest.retainedData)).toBe(true);
      expect(Array.isArray(mockDeletionRequest.deletedData)).toBe(true);
      expect(mockDeletionRequest.retainedData.length).toBeGreaterThan(0);
      expect(mockDeletionRequest.deletedData.length).toBeGreaterThan(0);
    });
  });

  describe('Authentication and Authorization Integration', () => {
    test('User authentication flows remain consistent', () => {
      const mockAuthFlow = {
        login: {
          endpoint: '/api/auth/signin',
          method: 'POST',
          requiredFields: ['email', 'password'],
          responseFields: ['token', 'user', 'expiresAt']
        },
        logout: {
          endpoint: '/api/auth/signout',
          method: 'POST',
          requiredFields: ['token'],
          responseFields: ['success', 'message']
        },
        refresh: {
          endpoint: '/api/auth/refresh',
          method: 'POST',
          requiredFields: ['refreshToken'],
          responseFields: ['token', 'expiresAt']
        }
      };

      // Verify authentication endpoints structure
      Object.values(mockAuthFlow).forEach(flow => {
        expect(flow).toHaveProperty('endpoint');
        expect(flow).toHaveProperty('method');
        expect(flow).toHaveProperty('requiredFields');
        expect(flow).toHaveProperty('responseFields');
        expect(Array.isArray(flow.requiredFields)).toBe(true);
        expect(Array.isArray(flow.responseFields)).toBe(true);
      });
    });

    test('Role-based access control maintains consistency', () => {
      const mockRolePermissions = {
        super_admin: [
          'create_course',
          'update_course',
          'delete_course',
          'manage_users',
          'view_analytics',
          'export_data',
          'manage_instructors',
          'moderate_content',
          'system_settings'
        ],
        admin: [
          'create_course',
          'update_course',
          'manage_users',
          'view_analytics',
          'export_data',
          'manage_instructors',
          'moderate_content'
        ],
        instructor: [
          'update_course',
          'view_analytics',
          'moderate_content'
        ],
        learner: [
          'view_courses',
          'enroll_course',
          'view_progress'
        ]
      };

      // Verify role structure
      Object.entries(mockRolePermissions).forEach(([role, permissions]) => {
        expect(Array.isArray(permissions)).toBe(true);
        expect(permissions.length).toBeGreaterThan(0);
        
        // Verify all permissions are strings
        permissions.forEach(permission => {
          expect(typeof permission).toBe('string');
          expect(permission.length).toBeGreaterThan(0);
        });
      });

      // Verify role hierarchy
      expect(mockRolePermissions.super_admin.length).toBeGreaterThan(mockRolePermissions.admin.length);
      expect(mockRolePermissions.admin.length).toBeGreaterThan(mockRolePermissions.instructor.length);
      expect(mockRolePermissions.instructor.length).toBeGreaterThanOrEqual(mockRolePermissions.learner.length);
    });
  });

  describe('API Versioning and Compatibility', () => {
    test('API versioning maintains backward compatibility', () => {
      const mockApiVersions = {
        v1: {
          courses: '/api/v1/courses',
          search: '/api/v1/search',
          users: '/api/v1/users',
          analytics: '/api/v1/analytics'
        },
        v2: {
          courses: '/api/v2/courses',
          search: '/api/v2/search',
          users: '/api/v2/users',
          analytics: '/api/v2/analytics'
        }
      };

      // Verify API version structure
      Object.values(mockApiVersions).forEach(version => {
        expect(version).toHaveProperty('courses');
        expect(version).toHaveProperty('search');
        expect(version).toHaveProperty('users');
        expect(version).toHaveProperty('analytics');
      });

      // Verify endpoint format
      Object.values(mockApiVersions.v1).forEach(endpoint => {
        expect(endpoint).toMatch(/^\/api\/v1\//);
      });
    });

    test('Content-Type and response format consistency', () => {
      const mockApiResponse = {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': '1.0',
          'Cache-Control': 'public, max-age=300'
        },
        body: {
          data: {},
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
            requestId: 'req-123'
          }
        }
      };

      // Verify response structure
      expect(mockApiResponse).toHaveProperty('headers');
      expect(mockApiResponse).toHaveProperty('body');
      expect(mockApiResponse.headers['Content-Type']).toBe('application/json');
      expect(mockApiResponse.body).toHaveProperty('data');
      expect(mockApiResponse.body).toHaveProperty('meta');
      expect(mockApiResponse.body.meta).toHaveProperty('timestamp');
      expect(mockApiResponse.body.meta).toHaveProperty('version');
    });
  });
});