/**
 * API Verification Script for Course CRUD Operations
 * 
 * This script tests all course CRUD endpoints:
 * - POST /api/admin/courses (Create)
 * - GET /api/admin/courses/:id (Read)
 * - PUT /api/admin/courses/:id (Update)
 * - DELETE /api/admin/courses/:id (Delete)
 * 
 * It also verifies:
 * - Validation errors return correct status codes
 * - Cascade deletion works correctly
 * 
 * Usage: tsx scripts/verify-course-crud-apis.ts
 */

import prisma from '../src/lib/db'
import { createId } from '@paralleldrive/cuid2'

const BASE_URL = 'http://localhost:3001'
const API_BASE = `${BASE_URL}/api/admin/courses`

interface TestResult {
  name: string
  passed: boolean
  message: string
  details?: any
}

const results: TestResult[] = []

function logTest(name: string, passed: boolean, message: string, details?: any) {
  results.push({ name, passed, message, details })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}: ${message}`)
  if (details) {
    console.log('   Details:', JSON.stringify(details, null, 2))
  }
}

async function makeRequest(
  url: string,
  method: string,
  body?: any,
  headers: Record<string, string> = {}
) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()
    return { status: response.status, data }
  } catch (error) {
    return { status: 0, data: { error: (error as Error).message } }
  }
}

async function testCreateCourse() {
  console.log('\n📝 Testing POST /api/admin/courses (Create Course)')

  // Test 1: Create course with valid data
  const validCourse = {
    title: 'Test Course for API Verification',
    slug: 'test-course-api-verification',
    summary: 'This is a test course',
    description: 'Detailed description of the test course',
    priceCents: 9900,
    currency: 'INR',
    level: 'Beginner',
    durationMin: 120,
  }

  const { status, data } = await makeRequest(API_BASE, 'POST', validCourse)

  if (status === 201 && data.success && data.data.id) {
    logTest(
      'Create course with valid data',
      true,
      'Course created successfully',
      { id: data.data.id, slug: data.data.slug }
    )
    return data.data.id
  } else {
    logTest(
      'Create course with valid data',
      false,
      `Expected 201, got ${status}`,
      data
    )
    return null
  }
}

async function testCreateCourseValidation() {
  console.log('\n🔍 Testing Validation Errors')

  // Test 2: Missing required fields
  const { status: status1, data: data1 } = await makeRequest(API_BASE, 'POST', {
    slug: 'test-course',
  })

  logTest(
    'Validation: Missing required fields',
    status1 === 400,
    status1 === 400 ? 'Correctly rejected with 400' : `Expected 400, got ${status1}`,
    data1
  )

  // Test 3: Invalid price (negative)
  const { status: status2, data: data2 } = await makeRequest(API_BASE, 'POST', {
    title: 'Test Course',
    priceCents: -100,
  })

  logTest(
    'Validation: Negative price',
    status2 === 400,
    status2 === 400 ? 'Correctly rejected with 400' : `Expected 400, got ${status2}`,
    data2
  )

  // Test 4: Duplicate slug
  const { status: status3, data: data3 } = await makeRequest(API_BASE, 'POST', {
    title: 'Another Test Course',
    slug: 'test-course-api-verification', // Same as first course
    priceCents: 9900,
  })

  logTest(
    'Validation: Duplicate slug',
    status3 === 409,
    status3 === 409 ? 'Correctly rejected with 409' : `Expected 409, got ${status3}`,
    data3
  )
}

async function testGetCourse(courseId: string) {
  console.log('\n📖 Testing GET /api/admin/courses/:id (Read Course)')

  const { status, data } = await makeRequest(`${API_BASE}/${courseId}`, 'GET')

  if (status === 200 && data.success && data.data.id === courseId) {
    logTest(
      'Get course by ID',
      true,
      'Course retrieved successfully',
      {
        id: data.data.id,
        title: data.data.title,
        moduleCount: data.data.Module?.length || 0,
      }
    )
    return true
  } else {
    logTest(
      'Get course by ID',
      false,
      `Expected 200, got ${status}`,
      data
    )
    return false
  }
}

async function testGetNonexistentCourse() {
  console.log('\n🔍 Testing GET with nonexistent ID')

  const { status, data } = await makeRequest(
    `${API_BASE}/nonexistent-id-12345`,
    'GET'
  )

  logTest(
    'Get nonexistent course',
    status === 404,
    status === 404 ? 'Correctly returned 404' : `Expected 404, got ${status}`,
    data
  )
}

async function testUpdateCourse(courseId: string) {
  console.log('\n✏️ Testing PUT /api/admin/courses/:id (Update Course)')

  const updateData = {
    title: 'Updated Test Course Title',
    summary: 'Updated summary',
    priceCents: 12900,
  }

  const { status, data } = await makeRequest(
    `${API_BASE}/${courseId}`,
    'PUT',
    updateData
  )

  if (status === 200 && data.success && data.data.title === updateData.title) {
    logTest(
      'Update course metadata',
      true,
      'Course updated successfully',
      {
        id: data.data.id,
        title: data.data.title,
        priceCents: data.data.priceCents,
      }
    )
    return true
  } else {
    logTest(
      'Update course metadata',
      false,
      `Expected 200, got ${status}`,
      data
    )
    return false
  }
}

async function testUpdatePublishedCourseSlug(courseId: string) {
  console.log('\n🔒 Testing slug change prevention for published courses')

  // First, publish the course
  await prisma.course.update({
    where: { id: courseId },
    data: { published: true },
  })

  // Try to change the slug
  const { status, data } = await makeRequest(`${API_BASE}/${courseId}`, 'PUT', {
    slug: 'new-slug-should-fail',
  })

  logTest(
    'Prevent slug change on published course',
    status === 400,
    status === 400
      ? 'Correctly prevented slug change'
      : `Expected 400, got ${status}`,
    data
  )

  // Unpublish for cleanup
  await prisma.course.update({
    where: { id: courseId },
    data: { published: false },
  })
}

async function testCascadeDeletion(courseId: string) {
  console.log('\n🗑️ Testing Cascade Deletion')

  // Create modules and lessons for the course
  const module1 = await prisma.module.create({
    data: {
      id: createId(),
      title: 'Test Module 1',
      order: 0,
      Course: {
        connect: { id: courseId }
      },
    },
  })

  const module2 = await prisma.module.create({
    data: {
      id: createId(),
      title: 'Test Module 2',
      order: 1,
      Course: {
        connect: { id: courseId }
      },
    },
  })

  const lesson1 = await prisma.lesson.create({
    data: {
      id: createId(),
      title: 'Test Lesson 1',
      order: 0,
      moduleId: module1.id,
      content: 'Test content',
    },
  })

  const lesson2 = await prisma.lesson.create({
    data: {
      id: createId(),
      title: 'Test Lesson 2',
      order: 1,
      moduleId: module1.id,
      videoUrl: 'https://cdn.example.com/video.mp4',
    },
  })

  const lesson3 = await prisma.lesson.create({
    data: {
      id: createId(),
      title: 'Test Lesson 3',
      order: 0,
      moduleId: module2.id,
      content: '{"questions":[]}',
    },
  })

  console.log(`   Created 2 modules and 3 lessons for course ${courseId}`)

  // Verify they exist
  const modulesBeforeDelete = await prisma.module.findMany({
    where: { courseId },
  })
  const lessonsBeforeDelete = await prisma.lesson.findMany({
    where: { moduleId: { in: [module1.id, module2.id] } },
  })

  logTest(
    'Verify test data created',
    modulesBeforeDelete.length === 2 && lessonsBeforeDelete.length === 3,
    `Found ${modulesBeforeDelete.length} modules and ${lessonsBeforeDelete.length} lessons`
  )

  // Delete the course
  const { status, data } = await makeRequest(`${API_BASE}/${courseId}`, 'DELETE')

  if (status === 200 && data.success) {
    logTest('Delete course', true, 'Course deleted successfully', data.data)

    // Verify cascade deletion
    const modulesAfterDelete = await prisma.module.findMany({
      where: { courseId },
    })
    const lessonsAfterDelete = await prisma.lesson.findMany({
      where: { moduleId: { in: [module1.id, module2.id] } },
    })

    logTest(
      'Verify cascade deletion of modules',
      modulesAfterDelete.length === 0,
      modulesAfterDelete.length === 0
        ? 'All modules deleted'
        : `Expected 0 modules, found ${modulesAfterDelete.length}`
    )

    logTest(
      'Verify cascade deletion of lessons',
      lessonsAfterDelete.length === 0,
      lessonsAfterDelete.length === 0
        ? 'All lessons deleted'
        : `Expected 0 lessons, found ${lessonsAfterDelete.length}`
    )

    return true
  } else {
    logTest('Delete course', false, `Expected 200, got ${status}`, data)
    return false
  }
}

async function testDeleteNonexistentCourse() {
  console.log('\n🔍 Testing DELETE with nonexistent ID')

  const { status, data } = await makeRequest(
    `${API_BASE}/nonexistent-id-12345`,
    'DELETE'
  )

  logTest(
    'Delete nonexistent course',
    status === 404,
    status === 404 ? 'Correctly returned 404' : `Expected 404, got ${status}`,
    data
  )
}

async function runTests() {
  console.log('🚀 Starting Course CRUD API Verification')
  console.log('=' .repeat(60))

  try {
    // Test CREATE
    const courseId = await testCreateCourse()
    if (!courseId) {
      console.log('\n❌ Failed to create course. Stopping tests.')
      return
    }

    // Test validation errors
    await testCreateCourseValidation()

    // Test READ
    await testGetCourse(courseId)
    await testGetNonexistentCourse()

    // Test UPDATE
    await testUpdateCourse(courseId)
    await testUpdatePublishedCourseSlug(courseId)

    // Test DELETE with cascade
    await testCascadeDeletion(courseId)
    await testDeleteNonexistentCourse()

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Summary')
    console.log('='.repeat(60))

    const passed = results.filter((r) => r.passed).length
    const failed = results.filter((r) => !r.passed).length
    const total = results.length

    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`   - ${r.name}: ${r.message}`)
        })
    }

    console.log('\n' + (failed === 0 ? '✅ All tests passed!' : '❌ Some tests failed'))
  } catch (error) {
    console.error('\n💥 Error running tests:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
runTests()
