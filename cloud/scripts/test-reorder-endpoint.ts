/**
 * Manual test script for the reorder endpoint
 * This script demonstrates how to use the reorder API
 * 
 * Usage: tsx scripts/test-reorder-endpoint.ts
 */

import prisma from '../src/lib/db'

async function testReorderEndpoint() {
  console.log('🧪 Testing Reorder Endpoint Logic\n')

  try {
    // 1. Find or create a test course
    console.log('1️⃣ Finding or creating test course...')
    let course = await prisma.course.findFirst({
      where: { title: { contains: 'Test' } },
      include: {
        Module: {
          orderBy: { order: 'asc' },
          include: {
            Lesson: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!course) {
      console.log('   No test course found. Please create a course with modules and lessons first.')
      return
    }

    console.log(`   ✅ Found course: ${course.title} (${course.id})`)
    console.log(`   📚 Modules: ${course.Module.length}`)
    
    // Display current structure
    console.log('\n2️⃣ Current curriculum structure:')
    course.Module.forEach((module) => {
      console.log(`   📖 Module ${module.order}: ${module.title} (${module.id})`)
      module.Lesson.forEach((lesson) => {
        console.log(`      📝 Lesson ${lesson.order}: ${lesson.title} (${lesson.id})`)
      })
    })

    if (course.Module.length < 2) {
      console.log('\n   ⚠️  Need at least 2 modules to test reordering')
      return
    }

    // 3. Test module reordering
    console.log('\n3️⃣ Testing module reorder (swapping first two modules)...')
    const module1 = course.Module[0]
    const module2 = course.Module[1]

    // Simulate reorder operations
    const moduleReorderOps = [
      { type: 'module' as const, id: module1.id, order: 1 },
      { type: 'module' as const, id: module2.id, order: 0 },
    ]

    console.log('   Operations:', JSON.stringify(moduleReorderOps, null, 2))

    // Execute reorder in transaction
    await prisma.$transaction(async (tx) => {
      for (const op of moduleReorderOps) {
        await tx.module.update({
          where: { id: op.id },
          data: { order: op.order },
        })
      }
    })

    console.log('   ✅ Module reorder completed')

    // Verify the change
    const updatedCourse = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        Module: {
          orderBy: { order: 'asc' },
          include: {
            Lesson: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    console.log('\n4️⃣ Updated curriculum structure:')
    updatedCourse?.Module.forEach((module) => {
      console.log(`   📖 Module ${module.order}: ${module.title} (${module.id})`)
      module.Lesson.forEach((lesson) => {
        console.log(`      📝 Lesson ${lesson.order}: ${lesson.title} (${lesson.id})`)
      })
    })

    // 5. Test lesson reordering (if lessons exist)
    if (module1.Lesson.length >= 2) {
      console.log('\n5️⃣ Testing lesson reorder within module...')
      const lesson1 = module1.Lesson[0]
      const lesson2 = module1.Lesson[1]

      const lessonReorderOps = [
        { type: 'lesson' as const, id: lesson1.id, order: 1, moduleId: module1.id },
        { type: 'lesson' as const, id: lesson2.id, order: 0, moduleId: module1.id },
      ]

      console.log('   Operations:', JSON.stringify(lessonReorderOps, null, 2))

      await prisma.$transaction(async (tx) => {
        for (const op of lessonReorderOps) {
          await tx.lesson.update({
            where: { id: op.id },
            data: { order: op.order, moduleId: op.moduleId },
          })
        }
      })

      console.log('   ✅ Lesson reorder completed')
    }

    // 6. Test moving lesson between modules
    if (course.Module.length >= 2 && module1.Lesson.length >= 1) {
      console.log('\n6️⃣ Testing lesson move between modules...')
      const lessonToMove = module1.Lesson[0]
      const targetModule = course.Module[1]

      console.log(`   Moving lesson "${lessonToMove.title}" from module "${module1.title}" to "${targetModule.title}"`)

      await prisma.lesson.update({
        where: { id: lessonToMove.id },
        data: {
          moduleId: targetModule.id,
          order: 0, // Place at beginning of target module
        },
      })

      console.log('   ✅ Lesson moved successfully')
    }

    // Final verification
    const finalCourse = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        Module: {
          orderBy: { order: 'asc' },
          include: {
            Lesson: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    console.log('\n7️⃣ Final curriculum structure:')
    finalCourse?.Module.forEach((module) => {
      console.log(`   📖 Module ${module.order}: ${module.title} (${module.id})`)
      module.Lesson.forEach((lesson) => {
        console.log(`      📝 Lesson ${lesson.order}: ${lesson.title} (${lesson.id})`)
      })
    })

    console.log('\n✅ All reorder operations completed successfully!')
    console.log('\n📝 Note: The reorder endpoint at PUT /api/admin/courses/:id/reorder')
    console.log('   accepts an array of operations and executes them in a transaction.')
    console.log('   Example request body:')
    console.log(JSON.stringify({
      operations: [
        { type: 'module', id: 'module-id', order: 0 },
        { type: 'lesson', id: 'lesson-id', order: 1, moduleId: 'module-id' },
      ],
    }, null, 2))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testReorderEndpoint()
