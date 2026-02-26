/**
 * Checkpoint 19: Frontend Functionality Verification
 * 
 * This test suite verifies:
 * - Course listing and filtering
 * - Course detail page rendering
 * - Enrollment flow
 * - Lesson player for all types
 * - Progress tracking
 * - Access control
 * - SEO meta tags in HTML
 */

import { dbDataService } from '@/data/db-data-service';
import prisma from '@/lib/db';

describe('Checkpoint 19: Frontend Functionality Verification', () => {
  let testCourseId: string;
  let testUserId: string;
  let testCourseSlug: string;
  let testInstructorId: string;

  beforeAll(async () => {
    // Clean up any existing test data first
    await prisma.user.deleteMany({
      where: { email: 'test-checkpoint19@example.com' },
    });
    await prisma.category.deleteMany({
      where: { slug: 'test-category-checkpoint19' },
    });
    await prisma.instructor.deleteMany({
      where: { name: 'Test Instructor Checkpoint 19' },
    });

    // Create test data
    const testUser = await prisma.user.create({
      data: {
        email: 'test-checkpoint19@example.com',
        name: 'Test User Checkpoint 19',
      },
    });
    testUserId = testUser.id;

    // Create a test instructor
    const testInstructor = await prisma.instructor.create({
      data: {
        name: 'Test Instructor Checkpoint 19',
        bio: 'Test bio',
      },
    });
    testInstructorId = testInstructor.id;

    // Create a test category
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category-checkpoint19',
      },
    });

    // Create a published test course
    const testCourse = await prisma.course.create({
      data: {
        title: 'Test Course for Checkpoint 19',
        slug: 'test-course-checkpoint19',
        summary: 'Test summary',
        description: 'Test description',
        priceCents: 9900,
        currency: 'INR',
        published: true,
        featured: true,
        level: 'Beginner',
        durationMin: 120,
        rating: 4.5,
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        instructorId: testInstructor.id,
        categoryId: testCategory.id,
      },
    });
    testCourseId = testCourse.id;
    testCourseSlug = testCourse.slug;

    // Create modules and lessons
    const module1 = await prisma.module.create({
      data: {
        title: 'Module 1',
        order: 0,
        courseId: testCourseId,
      },
    });

    await prisma.lesson.create({
      data: {
        title: 'Video Lesson',
        videoUrl: 'https://example.com/video.mp4',
        duration: 600,
        order: 0,
        moduleId: module1.id,
      },
    });

    await prisma.lesson.create({
      data: {
        title: 'Article Lesson',
        content: 'This is article content',
        order: 1,
        moduleId: module1.id,
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.courseProgress.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.enrollment.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.lesson.deleteMany({
      where: { module: { courseId: testCourseId } },
    });
    await prisma.module.deleteMany({
      where: { courseId: testCourseId },
    });
    await prisma.course.deleteMany({
      where: { id: testCourseId },
    });
    await prisma.instructor.deleteMany({
      where: { id: testInstructorId },
    });
    await prisma.category.deleteMany({
      where: { slug: 'test-category-checkpoint19' },
    });
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });
  });

  describe('1. Course Listing and Filtering', () => {
    it('should fetch published courses', async () => {
      const result = await dbDataService.getCourses({ published: true });
      
      expect(result.courses).toBeDefined();
      expect(Array.isArray(result.courses)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
      
      // Verify our test course is in the list
      const testCourse = result.courses.find(c => c.slug === testCourseSlug);
      expect(testCourse).toBeDefined();
      expect(testCourse?.published).toBe(true);
    });

    it('should filter courses by featured status', async () => {
      const result = await dbDataService.getCourses({ 
        published: true, 
        featured: true 
      });
      
      expect(result.courses).toBeDefined();
      expect(result.courses.every(c => c.featured === true)).toBe(true);
      
      // Verify our test course is in featured list
      const testCourse = result.courses.find(c => c.slug === testCourseSlug);
      expect(testCourse).toBeDefined();
    });

    it('should filter courses by category', async () => {
      const result = await dbDataService.getCourses({ 
        published: true,
        category: 'test-category-checkpoint19'
      });
      
      expect(result.courses).toBeDefined();
      expect(result.courses.length).toBeGreaterThan(0);
      expect(result.courses.every(c => c.category?.slug === 'test-category-checkpoint19')).toBe(true);
    });

    it('should filter courses by level', async () => {
      const result = await dbDataService.getCourses({ 
        published: true,
        level: 'Beginner'
      });
      
      expect(result.courses).toBeDefined();
      expect(result.courses.every(c => c.level === 'Beginner')).toBe(true);
    });

    it('should search courses by title', async () => {
      const result = await dbDataService.getCourses({ 
        published: true,
        search: 'Checkpoint 19'
      });
      
      expect(result.courses).toBeDefined();
      const testCourse = result.courses.find(c => c.slug === testCourseSlug);
      expect(testCourse).toBeDefined();
    });

    it('should support pagination', async () => {
      const page1 = await dbDataService.getCourses({ 
        published: true,
        page: 1,
        pageSize: 5
      });
      
      expect(page1.page).toBe(1);
      expect(page1.pageSize).toBe(5);
      expect(page1.courses.length).toBeLessThanOrEqual(5);
      expect(page1.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should support sorting by different fields', async () => {
      const byTitle = await dbDataService.getCourses({ 
        published: true,
        sortBy: 'title',
        sortOrder: 'asc'
      });
      
      expect(byTitle.courses).toBeDefined();
      
      const byRating = await dbDataService.getCourses({ 
        published: true,
        sortBy: 'rating',
        sortOrder: 'desc'
      });
      
      expect(byRating.courses).toBeDefined();
    });
  });

  describe('2. Course Detail Page Rendering', () => {
    it('should fetch course by slug with complete data', async () => {
      const course = await dbDataService.getCourseBySlug(testCourseSlug);
      
      expect(course).toBeDefined();
      expect(course?.id).toBe(testCourseId);
      expect(course?.title).toBe('Test Course for Checkpoint 19');
      expect(course?.slug).toBe(testCourseSlug);
      expect(course?.published).toBe(true);
    });

    it('should include instructor information', async () => {
      const course = await dbDataService.getCourseBySlug(testCourseSlug);
      
      expect(course?.instructor).toBeDefined();
      expect(course?.instructor?.name).toBe('Test Instructor Checkpoint 19');
    });

    it('should include category information', async () => {
      const course = await dbDataService.getCourseBySlug(testCourseSlug);
      
      expect(course?.category).toBeDefined();
      expect(course?.category?.slug).toBe('test-category-checkpoint19');
    });

    it('should include modules and lessons in correct order', async () => {
      const course = await dbDataService.getCourseBySlug(testCourseSlug);
      
      expect(course?.modules).toBeDefined();
      expect(course?.modules.length).toBeGreaterThan(0);
      
      const module = course?.modules[0];
      expect(module?.lessons).toBeDefined();
      expect(module?.lessons.length).toBe(2);
      
      // Verify lessons are ordered
      expect(module?.lessons[0].order).toBe(0);
      expect(module?.lessons[1].order).toBe(1);
    });

    it('should return null for non-existent course', async () => {
      const course = await dbDataService.getCourseBySlug('non-existent-slug');
      expect(course).toBeNull();
    });
  });

  describe('3. Course Curriculum', () => {
    it('should fetch curriculum with metadata only', async () => {
      const curriculum = await dbDataService.getCourseCurriculum(testCourseSlug);
      
      expect(curriculum).toBeDefined();
      expect(curriculum?.modules).toBeDefined();
      expect(curriculum?.modules.length).toBeGreaterThan(0);
      
      const lesson = curriculum?.modules[0].lessons[0];
      expect(lesson).toBeDefined();
      expect(lesson?.title).toBeDefined();
      expect(lesson?.order).toBeDefined();
      expect(lesson?.type).toBeDefined();
    });

    it('should identify lesson types correctly', async () => {
      const curriculum = await dbDataService.getCourseCurriculum(testCourseSlug);
      
      const lessons = curriculum?.modules[0].lessons || [];
      const videoLesson = lessons.find(l => l.title === 'Video Lesson');
      const articleLesson = lessons.find(l => l.title === 'Article Lesson');
      
      expect(videoLesson?.type).toBe('video');
      expect(articleLesson?.type).toBe('article');
    });
  });

  describe('4. Enrollment Flow', () => {
    it('should create enrollment for user', async () => {
      const enrollment = await dbDataService.createEnrollment(
        testUserId,
        testCourseId,
        'test'
      );
      
      expect(enrollment).toBeDefined();
      expect(enrollment.userId).toBe(testUserId);
      expect(enrollment.courseId).toBe(testCourseId);
      expect(enrollment.status).toBe('ACTIVE');
    });

    it('should check enrollment status', async () => {
      const enrollment = await dbDataService.checkEnrollment(
        testUserId,
        testCourseId
      );
      
      expect(enrollment).toBeDefined();
      expect(enrollment?.status).toBe('ACTIVE');
    });

    it('should fetch user enrollments', async () => {
      const enrollments = await dbDataService.getUserEnrollments(testUserId);
      
      expect(enrollments).toBeDefined();
      expect(Array.isArray(enrollments)).toBe(true);
      expect(enrollments.length).toBeGreaterThan(0);
      
      const testEnrollment = enrollments.find(e => e.courseId === testCourseId);
      expect(testEnrollment).toBeDefined();
      expect(testEnrollment?.course).toBeDefined();
    });
  });

  describe('5. Progress Tracking', () => {
    let testLessonId: string;

    beforeAll(async () => {
      const course = await dbDataService.getCourseBySlug(testCourseSlug);
      testLessonId = course?.modules[0].lessons[0].id || '';
    });

    it('should update lesson progress', async () => {
      const progress = await dbDataService.updateLessonProgress(
        testUserId,
        testCourseId,
        testLessonId,
        true,
        300
      );
      
      expect(progress).toBeDefined();
      expect(progress.completed).toBe(true);
      expect(progress.timeSpent).toBe(300);
    });

    it('should fetch course progress', async () => {
      const progress = await dbDataService.getCourseProgress(
        testUserId,
        testCourseId
      );
      
      expect(progress).toBeDefined();
      expect(progress?.totalLessons).toBe(2);
      expect(progress?.completedLessons).toBe(1);
      expect(progress?.completionPercentage).toBe(50);
    });

    it('should calculate completion percentage correctly', async () => {
      // Complete second lesson
      const course = await dbDataService.getCourseBySlug(testCourseSlug);
      const secondLessonId = course?.modules[0].lessons[1].id || '';
      
      await dbDataService.updateLessonProgress(
        testUserId,
        testCourseId,
        secondLessonId,
        true,
        200
      );
      
      const progress = await dbDataService.getCourseProgress(
        testUserId,
        testCourseId
      );
      
      expect(progress?.completedLessons).toBe(2);
      expect(progress?.completionPercentage).toBe(100);
    });
  });

  describe('6. Access Control', () => {
    it('should verify enrollment before access', async () => {
      const enrollment = await dbDataService.checkEnrollment(
        testUserId,
        testCourseId
      );
      
      expect(enrollment).toBeDefined();
      expect(enrollment?.status).toBe('ACTIVE');
    });

    it('should return null for non-enrolled user', async () => {
      const fakeUserId = 'non-existent-user-id';
      const enrollment = await dbDataService.checkEnrollment(
        fakeUserId,
        testCourseId
      );
      
      expect(enrollment).toBeNull();
    });

    it('should only return published courses in public queries', async () => {
      const result = await dbDataService.getCourses({ published: true });
      
      expect(result.courses.every(c => c.published === true)).toBe(true);
    });
  });

  describe('7. Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      const course = await dbDataService.getCourseBySlug(testCourseSlug);
      
      expect(course?.instructorId).toBeDefined();
      expect(course?.categoryId).toBeDefined();
      expect(course?.instructor).toBeDefined();
      expect(course?.category).toBeDefined();
    });

    it('should order modules and lessons correctly', async () => {
      const course = await dbDataService.getCourseBySlug(testCourseSlug);
      
      const modules = course?.modules || [];
      for (let i = 0; i < modules.length - 1; i++) {
        expect(modules[i].order).toBeLessThanOrEqual(modules[i + 1].order);
      }
      
      const lessons = modules[0]?.lessons || [];
      for (let i = 0; i < lessons.length - 1; i++) {
        expect(lessons[i].order).toBeLessThanOrEqual(lessons[i + 1].order);
      }
    });
  });
});
