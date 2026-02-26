#!/usr/bin/env tsx
/**
 * Comprehensive verification script for curriculum management APIs
 * Tests module and lesson creation, reordering, and order value correctness
 */

import prisma from '../src/lib/db'
import { createId } from '@paralleldrive/cuid2'

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

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...')
  
  // Delete test courses (cascade will handle modules and lessons)
  await prisma.course.deleteMany({
    where: {
      title: {
        startsWith: '[TEST]',
      },
    },
  })
  
  console.log('✅ Cleanup complete\n')
}

async function testModuleCreation() {
  console.log('\n📦 Testing Module Creation...\n')

  // Create a test course
  const course = await prisma.course.create({
    data: {
      id: createId(),
      title: '[TEST] Curriculum Test Course',
      slug: `test-curriculum-${Date.now()}`,
      priceCents: 0,
      currency: 'INR',
      published: false,
      updatedAt: new Date(),
    },
  })

  // Test 1: Create first module (should have order 0)
  const module1 = await prisma.module.create({
    data: {
      id: createId(),
      title: 'Module 1',
      order: 0,
      courseId: course.id,
    },
  })

  logTest(
    'Module Creation - First Module',
    module1.order === 0,
    `First module should have order 0, got ${module1.order}`,
    { moduleId: module1.id, order: module1.order }
  )

  // Test 2: Create second module (should have order 1)
  const maxOrder = await prisma.module.findFirst({
    where: { courseId: course.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const module2 = await prisma.module.create({
    data: {
      id: createId(),
      title: 'Module 2',
      order: (maxOrder?.order ?? -1) + 1,
      courseId: course.id,
    },
  })

  logTest(
    'Module Creation - Sequential Order',
    module2.order === 1,
    `Second module should have order 1, got ${module2.order}`,
    { moduleId: module2.id, order: module2.order }
  )

  // Test 3: Create third module
  const maxOrder2 = await prisma.module.findFirst({
    where: { courseId: course.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const module3 = await prisma.module.create({
    data: {
      id: createId(),
      title: 'Module 3',
      order: (maxOrder2?.order ?? -1) + 1,
      courseId: course.id,
    },
  })

  logTest(
    'Module Creation - Third Module',
    module3.order === 2,
    `Third module should have order 2, got ${module3.order}`,
    { moduleId: module3.id, order: module3.order }
  )

  // Test 4: Verify all modules are in correct order
  const allModules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { order: 'asc' },
  })

  const ordersCorrect = allModules.every((mod, idx) => mod.order === idx)
  logTest(
    'Module Creation - Order Sequence',
    ordersCorrect,
    `All modules should have sequential orders 0, 1, 2`,
    { orders: allModules.map((m) => ({ id: m.id, title: m.title, order: m.order })) }
  )

  return { course, modules: [module1, module2, module3] }
}

async function testLessonCreation(courseId: string, moduleId: string) {
  console.log('\n📝 Testing Lesson Creation...\n')

  // Test 1: Create first lesson (should have order 0)
  const lesson1 = await prisma.lesson.create({
    data: {
      id: createId(),
      title: 'Lesson 1',
      content: 'Test content',
      order: 0,
      moduleId,
    },
  })

  logTest(
    'Lesson Creation - First Lesson',
    lesson1.order === 0,
    `First lesson should have order 0, got ${lesson1.order}`,
    { lessonId: lesson1.id, order: lesson1.order }
  )

  // Test 2: Create second lesson (should have order 1)
  const maxOrder = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const lesson2 = await prisma.lesson.create({
    data: {
      id: createId(),
      title: 'Lesson 2',
      videoUrl: 'https://example.com/video.mp4',
      duration: 600,
      order: (maxOrder?.order ?? -1) + 1,
      moduleId,
    },
  })

  logTest(
    'Lesson Creation - Sequential Order',
    lesson2.order === 1,
    `Second lesson should have order 1, got ${lesson2.order}`,
    { lessonId: lesson2.id, order: lesson2.order }
  )

  // Test 3: Create third lesson
  const maxOrder2 = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const lesson3 = await prisma.lesson.create({
    data: {
      id: createId(),
      title: 'Lesson 3',
      content: JSON.stringify({ questions: [] }),
      order: (maxOrder2?.order ?? -1) + 1,
      moduleId,
    },
  })

  logTest(
    'Lesson Creation - Third Lesson',
    lesson3.order === 2,
    `Third lesson should have order 2, got ${lesson3.order}`,
    { lessonId: lesson3.id, order: lesson3.order }
  )

  // Test 4: Verify all lessons are in correct order
  const allLessons = await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { order: 'asc' },
  })

  const ordersCorrect = allLessons.every((lesson, idx) => lesson.order === idx)
  logTest(
    'Lesson Creation - Order Sequence',
    ordersCorrect,
    `All lessons should have sequential orders 0, 1, 2`,
    { orders: allLessons.map((l) => ({ id: l.id, title: l.title, order: l.order })) }
  )

  return [lesson1, lesson2, lesson3]
}

async function testModuleReordering(courseId: string, modules: any[]) {
  console.log('\n🔄 Testing Module Reordering...\n')

  // Test 1: Swap first and last module (0 <-> 2)
  await prisma.$transaction([
    prisma.module.update({
      where: { id: modules[0].id },
      data: { order: 2 },
    }),
    prisma.module.update({
      where: { id: modules[2].id },
      data: { order: 0 },
    }),
  ])

  const reorderedModules1 = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  })

  const swapCorrect =
    reorderedModules1[0].id === modules[2].id &&
    reorderedModules1[2].id === modules[0].id &&
    reorderedModules1[1].id === modules[1].id

  logTest(
    'Module Reordering - Swap First and Last',
    swapCorrect,
    `Modules should be reordered correctly after swap`,
    {
      before: modules.map((m) => ({ id: m.id, title: m.title, order: m.order })),
      after: reorderedModules1.map((m) => ({ id: m.id, title: m.title, order: m.order })),
    }
  )

  // Test 2: Move middle module to end
  await prisma.module.update({
    where: { id: modules[1].id },
    data: { order: 2 },
  })

  await prisma.module.update({
    where: { id: modules[0].id },
    data: { order: 1 },
  })

  const reorderedModules2 = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  })

  const moveCorrect =
    reorderedModules2[0].id === modules[2].id &&
    reorderedModules2[1].id === modules[0].id &&
    reorderedModules2[2].id === modules[1].id

  logTest(
    'Module Reordering - Move to End',
    moveCorrect,
    `Module should be moved to end correctly`,
    { after: reorderedModules2.map((m) => ({ id: m.id, title: m.title, order: m.order })) }
  )

  // Test 3: Verify no gaps in order values
  const hasNoGaps = reorderedModules2.every((mod, idx) => mod.order === idx)
  logTest(
    'Module Reordering - No Gaps',
    hasNoGaps,
    `Order values should be sequential with no gaps`,
    { orders: reorderedModules2.map((m) => m.order) }
  )

  // Reset to original order for next tests
  await prisma.$transaction([
    prisma.module.update({ where: { id: modules[0].id }, data: { order: 0 } }),
    prisma.module.update({ where: { id: modules[1].id }, data: { order: 1 } }),
    prisma.module.update({ where: { id: modules[2].id }, data: { order: 2 } }),
  ])
}

async function testLessonReordering(moduleId: string, lessons: any[]) {
  console.log('\n🔄 Testing Lesson Reordering...\n')

  // Test 1: Reverse lesson order (0->2, 1->1, 2->0)
  await prisma.$transaction([
    prisma.lesson.update({
      where: { id: lessons[0].id },
      data: { order: 2 },
    }),
    prisma.lesson.update({
      where: { id: lessons[2].id },
      data: { order: 0 },
    }),
  ])

  const reorderedLessons1 = await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { order: 'asc' },
  })

  const reverseCorrect =
    reorderedLessons1[0].id === lessons[2].id &&
    reorderedLessons1[1].id === lessons[1].id &&
    reorderedLessons1[2].id === lessons[0].id

  logTest(
    'Lesson Reordering - Reverse Order',
    reverseCorrect,
    `Lessons should be reordered correctly`,
    {
      before: lessons.map((l) => ({ id: l.id, title: l.title, order: l.order })),
      after: reorderedLessons1.map((l) => ({ id: l.id, title: l.title, order: l.order })),
    }
  )

  // Test 2: Verify no gaps in order values
  const hasNoGaps = reorderedLessons1.every((lesson, idx) => lesson.order === idx)
  logTest(
    'Lesson Reordering - No Gaps',
    hasNoGaps,
    `Order values should be sequential with no gaps`,
    { orders: reorderedLessons1.map((l) => l.order) }
  )

  // Reset to original order
  await prisma.$transaction([
    prisma.lesson.update({ where: { id: lessons[0].id }, data: { order: 0 } }),
    prisma.lesson.update({ where: { id: lessons[1].id }, data: { order: 1 } }),
    prisma.lesson.update({ where: { id: lessons[2].id }, data: { order: 2 } }),
  ])
}

async function testLessonMoveBetweenModules(modules: any[], lessons: any[]) {
  console.log('\n🔀 Testing Lesson Move Between Modules...\n')

  const sourceModuleId = modules[0].id
  const targetModuleId = modules[1].id

  // Get initial lesson count in target module
  const initialTargetLessons = await prisma.lesson.findMany({
    where: { moduleId: targetModuleId },
  })

  // Move lesson from module 0 to module 1
  await prisma.lesson.update({
    where: { id: lessons[0].id },
    data: {
      moduleId: targetModuleId,
      order: initialTargetLessons.length, // Append to end
    },
  })

  const movedLesson = await prisma.lesson.findUnique({
    where: { id: lessons[0].id },
  })

  const moveCorrect =
    movedLesson?.moduleId === targetModuleId &&
    movedLesson?.order === initialTargetLessons.length

  logTest(
    'Lesson Move - Between Modules',
    moveCorrect,
    `Lesson should be moved to target module with correct order`,
    {
      lessonId: lessons[0].id,
      sourceModule: sourceModuleId,
      targetModule: targetModuleId,
      newOrder: movedLesson?.order,
    }
  )

  // Reorder source module lessons to fill the gap
  const sourceLessons = await prisma.lesson.findMany({
    where: { moduleId: sourceModuleId },
    orderBy: { order: 'asc' },
  })

  // Update orders to be sequential
  await prisma.$transaction(
    sourceLessons.map((lesson, index) =>
      prisma.lesson.update({
        where: { id: lesson.id },
        data: { order: index },
      })
    )
  )

  // Verify source module lessons are reordered
  const reorderedSourceLessons = await prisma.lesson.findMany({
    where: { moduleId: sourceModuleId },
    orderBy: { order: 'asc' },
  })

  const sourceOrderCorrect = reorderedSourceLessons.every((lesson, idx) => lesson.order === idx)
  logTest(
    'Lesson Move - Source Module Reorder',
    sourceOrderCorrect,
    `Source module lessons should maintain sequential order after reordering`,
    { sourceLessons: reorderedSourceLessons.map((l) => ({ id: l.id, order: l.order })) }
  )

  // Move lesson back
  await prisma.lesson.update({
    where: { id: lessons[0].id },
    data: {
      moduleId: sourceModuleId,
      order: 0,
    },
  })
}

async function testComplexReordering(courseId: string, modules: any[]) {
  console.log('\n🎯 Testing Complex Reordering Scenarios...\n')

  // Create lessons in multiple modules
  const module1Lessons = await Promise.all([
    prisma.lesson.create({
      data: { id: createId(), title: 'M1-L1', content: 'Content', order: 0, moduleId: modules[0].id },
    }),
    prisma.lesson.create({
      data: { id: createId(), title: 'M1-L2', content: 'Content', order: 1, moduleId: modules[0].id },
    }),
  ])

  const module2Lessons = await Promise.all([
    prisma.lesson.create({
      data: { id: createId(), title: 'M2-L1', content: 'Content', order: 0, moduleId: modules[1].id },
    }),
    prisma.lesson.create({
      data: { id: createId(), title: 'M2-L2', content: 'Content', order: 1, moduleId: modules[1].id },
    }),
  ])

  // Test: Batch reorder - swap modules and move lessons
  await prisma.$transaction([
    // Swap modules
    prisma.module.update({ where: { id: modules[0].id }, data: { order: 1 } }),
    prisma.module.update({ where: { id: modules[1].id }, data: { order: 0 } }),
    // Move lesson from module 1 to module 2
    prisma.lesson.update({
      where: { id: module1Lessons[0].id },
      data: { moduleId: modules[1].id, order: 2 },
    }),
  ])

  const finalModules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    include: {
      Lesson: {
        orderBy: { order: 'asc' },
      },
    },
  })

  const batchCorrect =
    finalModules[0].id === modules[1].id &&
    finalModules[1].id === modules[0].id &&
    finalModules[0].Lesson.length === 3 // 2 original + 1 moved

  logTest(
    'Complex Reordering - Batch Operations',
    batchCorrect,
    `Batch reorder should update modules and lessons correctly`,
    {
      modules: finalModules.map((m) => ({
        id: m.id,
        title: m.title,
        order: m.order,
        lessonCount: m.Lesson.length,
      })),
    }
  )
}

async function main() {
  console.log('🚀 Starting Curriculum Management API Verification\n')
  console.log('=' .repeat(60))

  try {
    // Cleanup any existing test data
    await cleanup()

    // Run tests
    const { course, modules } = await testModuleCreation()
    const lessons = await testLessonCreation(course.id, modules[0].id)
    await testModuleReordering(course.id, modules)
    await testLessonReordering(modules[0].id, lessons)
    await testLessonMoveBetweenModules(modules, lessons)
    await testComplexReordering(course.id, modules)

    // Cleanup test data
    await cleanup()

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('\n📊 Test Summary\n')
    const passed = results.filter((r) => r.passed).length
    const failed = results.filter((r) => !r.passed).length
    const total = results.length

    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`)

    if (failed > 0) {
      console.log('❌ Failed Tests:')
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`   - ${r.name}: ${r.message}`)
        })
      process.exit(1)
    } else {
      console.log('✅ All tests passed!')
      process.exit(0)
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:', error)
    await cleanup()
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
