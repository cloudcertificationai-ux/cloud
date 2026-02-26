#!/usr/bin/env tsx
/**
 * Checkpoint 15 Verification Script
 * 
 * This script verifies that all required components and APIs are implemented
 * for the admin panel functionality checkpoint.
 */

import { existsSync } from 'fs'
import { join } from 'path'

interface VerificationItem {
  name: string
  path: string
  type: 'component' | 'api' | 'page'
  required: boolean
}

const verificationsItems: VerificationItem[] = [
  // Components
  { name: 'CourseForm', path: 'src/components/CourseForm.tsx', type: 'component', required: true },
  { name: 'CurriculumBuilder', path: 'src/components/CurriculumBuilder.tsx', type: 'component', required: true },
  { name: 'MediaManager', path: 'src/components/MediaManager.tsx', type: 'component', required: true },
  { name: 'MediaUploader', path: 'src/components/MediaUploader.tsx', type: 'component', required: true },
  { name: 'LessonEditor', path: 'src/components/LessonEditor.tsx', type: 'component', required: true },
  { name: 'ConfirmDialog', path: 'src/components/ConfirmDialog.tsx', type: 'component', required: true },

  // Pages
  { name: 'Courses List Page', path: 'src/app/admin/courses/page.tsx', type: 'page', required: true },
  { name: 'New Course Page', path: 'src/app/admin/courses/new/page.tsx', type: 'page', required: true },
  { name: 'Edit Course Page', path: 'src/app/admin/courses/[id]/edit/page.tsx', type: 'page', required: true },

  // Course CRUD APIs
  { name: 'Create Course API', path: 'src/app/api/admin/courses/route.ts', type: 'api', required: true },
  { name: 'Get Course API', path: 'src/app/api/admin/courses/[id]/route.ts', type: 'api', required: true },

  // Module APIs
  { name: 'Create Module API', path: 'src/app/api/admin/courses/[id]/modules/route.ts', type: 'api', required: true },
  { name: 'Module CRUD API', path: 'src/app/api/admin/courses/[id]/modules/[moduleId]/route.ts', type: 'api', required: true },

  // Lesson APIs
  { name: 'Create Lesson API', path: 'src/app/api/admin/courses/[id]/modules/[moduleId]/lessons/route.ts', type: 'api', required: true },
  { name: 'Lesson CRUD API', path: 'src/app/api/admin/courses/[id]/modules/[moduleId]/lessons/[lessonId]/route.ts', type: 'api', required: true },

  // Reorder API
  { name: 'Reorder API', path: 'src/app/api/admin/courses/[id]/reorder/route.ts', type: 'api', required: true },

  // Publishing APIs
  { name: 'Publish API', path: 'src/app/api/admin/courses/[id]/publish/route.ts', type: 'api', required: true },
  { name: 'Unpublish API', path: 'src/app/api/admin/courses/[id]/unpublish/route.ts', type: 'api', required: true },
  { name: 'Feature API', path: 'src/app/api/admin/courses/[id]/feature/route.ts', type: 'api', required: true },
  { name: 'Unfeature API', path: 'src/app/api/admin/courses/[id]/unfeature/route.ts', type: 'api', required: true },

  // Media Upload API
  { name: 'Media Upload API', path: 'src/app/api/admin/media/upload/route.ts', type: 'api', required: true },

  // Tests
  { name: 'Course CRUD Tests', path: 'src/app/api/admin/courses/__tests__/course-crud.test.ts', type: 'api', required: false },
  { name: 'Reorder Tests', path: 'src/app/api/admin/courses/[id]/reorder/__tests__/reorder.test.ts', type: 'api', required: false },
]

function verifyFile(item: VerificationItem): boolean {
  const fullPath = join(process.cwd(), item.path)
  return existsSync(fullPath)
}

function getIcon(exists: boolean, required: boolean): string {
  if (exists) return '✅'
  if (required) return '❌'
  return '⚠️'
}

function main() {
  console.log('\n🔍 Checkpoint 15: Admin Panel Functionality Verification\n')
  console.log('=' .repeat(80))

  const results = {
    components: [] as { item: VerificationItem; exists: boolean }[],
    pages: [] as { item: VerificationItem; exists: boolean }[],
    apis: [] as { item: VerificationItem; exists: boolean }[],
  }

  // Verify all items
  verificationsItems.forEach((item) => {
    const exists = verifyFile(item)
    if (item.type === 'component') results.components.push({ item, exists })
    else if (item.type === 'page') results.pages.push({ item, exists })
    else if (item.type === 'api') results.apis.push({ item, exists })
  })

  // Print Components
  console.log('\n📦 Components:')
  results.components.forEach(({ item, exists }) => {
    console.log(`  ${getIcon(exists, item.required)} ${item.name}`)
  })

  // Print Pages
  console.log('\n📄 Pages:')
  results.pages.forEach(({ item, exists }) => {
    console.log(`  ${getIcon(exists, item.required)} ${item.name}`)
  })

  // Print APIs
  console.log('\n🔌 API Endpoints:')
  results.apis.forEach(({ item, exists }) => {
    console.log(`  ${getIcon(exists, item.required)} ${item.name}`)
  })

  // Summary
  const totalRequired = verificationsItems.filter((i) => i.required).length
  const passedRequired = verificationsItems.filter((i) => i.required && verifyFile(i)).length
  const totalOptional = verificationsItems.filter((i) => !i.required).length
  const passedOptional = verificationsItems.filter((i) => !i.required && verifyFile(i)).length

  console.log('\n' + '='.repeat(80))
  console.log('\n📊 Summary:')
  console.log(`  Required: ${passedRequired}/${totalRequired} ✅`)
  console.log(`  Optional: ${passedOptional}/${totalOptional} ✅`)
  console.log(`  Total: ${passedRequired + passedOptional}/${totalRequired + totalOptional} ✅`)

  if (passedRequired === totalRequired) {
    console.log('\n✅ All required features are implemented!')
    console.log('\n📝 Next Steps:')
    console.log('  1. Configure AWS S3 credentials for media upload')
    console.log('  2. Run manual testing checklist (see CHECKPOINT_15_VERIFICATION.md)')
    console.log('  3. Proceed to Task 16: Frontend course display components')
  } else {
    console.log('\n❌ Some required features are missing!')
    console.log('  Please implement missing components/APIs before proceeding.')
    process.exit(1)
  }

  console.log('\n' + '='.repeat(80) + '\n')
}

main()
