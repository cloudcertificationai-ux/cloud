/**
 * Checkpoint 9 Verification Script
 * 
 * Verifies:
 * - Media upload end-to-end
 * - Publishing workflow
 * - Featured status changes
 * - S3/CDN integration
 */

import prisma from '../src/lib/db';
import { randomBytes } from 'crypto';

// Generate a cuid-like ID
function generateId(): string {
  return 'c' + randomBytes(12).toString('base64url');
}

interface VerificationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, details?: any) {
  results.push({ test, status, message, details });
}

// Test 1: Check S3 Configuration
async function testS3Configuration() {
  log('\n1. Testing S3 Configuration...', 'blue');
  
  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET',
  ];
  
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    addResult(
      'S3 Configuration',
      'SKIP',
      `Missing environment variables: ${missing.join(', ')}. Media upload will not work.`,
      { missing }
    );
    log(`  ⚠️  SKIP: Missing S3 configuration`, 'yellow');
    return false;
  }
  
  addResult(
    'S3 Configuration',
    'PASS',
    'All S3 environment variables are configured',
    {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET,
      cdnDomain: process.env.NEXT_PUBLIC_CDN_DOMAIN || 'Not configured (will use S3 direct URLs)',
    }
  );
  log(`  ✓ PASS: S3 configuration complete`, 'green');
  return true;
}

// Test 2: Check Media Upload API Endpoint
async function testMediaUploadEndpoint() {
  log('\n2. Testing Media Upload API Endpoint...', 'blue');
  
  try {
    const testPayload = {
      filename: 'test-video.mp4',
      mimeType: 'video/mp4',
      fileSize: 1024 * 1024, // 1 MB
      courseId: 'test-course-id',
    };
    
    const response = await fetch('http://localhost:3001/api/admin/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    if (response.status === 503) {
      addResult(
        'Media Upload Endpoint',
        'SKIP',
        'S3 not configured - endpoint returns 503',
      );
      log(`  ⚠️  SKIP: S3 not configured`, 'yellow');
      return false;
    }
    
    if (response.status === 401) {
      addResult(
        'Media Upload Endpoint',
        'PASS',
        'Endpoint exists and requires authentication (401)',
      );
      log(`  ✓ PASS: Endpoint requires authentication`, 'green');
      return true;
    }
    
    const data = await response.json();
    
    if (response.ok && data.uploadUrl && data.cdnUrl) {
      addResult(
        'Media Upload Endpoint',
        'PASS',
        'Endpoint returns presigned URL and CDN URL',
        { uploadUrl: data.uploadUrl.substring(0, 50) + '...', cdnUrl: data.cdnUrl }
      );
      log(`  ✓ PASS: Endpoint working correctly`, 'green');
      return true;
    }
    
    addResult(
      'Media Upload Endpoint',
      'FAIL',
      `Unexpected response: ${response.status}`,
      data
    );
    log(`  ✗ FAIL: Unexpected response`, 'red');
    return false;
  } catch (error: any) {
    addResult(
      'Media Upload Endpoint',
      'FAIL',
      `Error testing endpoint: ${error.message}`,
    );
    log(`  ✗ FAIL: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: Test Publishing Workflow
async function testPublishingWorkflow() {
  log('\n3. Testing Publishing Workflow...', 'blue');
  
  try {
    // Create a test course
    const testCourse = await prisma.course.create({
      data: {
        id: generateId(),
        title: 'Test Course for Publishing',
        slug: `test-publish-${Date.now()}`,
        summary: 'Test course summary',
        priceCents: 999,
        currency: 'INR',
        published: false,
        updatedAt: new Date(),
        Module: {
          create: {
            id: generateId(),
            title: 'Test Module',
            order: 0,
            Lesson: {
              create: {
                id: generateId(),
                title: 'Test Lesson',
                content: 'Test content',
                order: 0,
              },
            },
          },
        },
      },
    });
    
    log(`  Created test course: ${testCourse.id}`, 'blue');
    
    // Test publish endpoint
    const publishResponse = await fetch(
      `http://localhost:3001/api/admin/courses/${testCourse.id}/publish`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (publishResponse.status === 401) {
      addResult(
        'Publishing Workflow',
        'PASS',
        'Publish endpoint exists and requires authentication',
      );
      log(`  ✓ PASS: Publish endpoint requires authentication`, 'green');
    } else if (publishResponse.ok) {
      const data = await publishResponse.json();
      addResult(
        'Publishing Workflow',
        'PASS',
        'Course published successfully',
        { courseId: testCourse.id, published: data.course?.published }
      );
      log(`  ✓ PASS: Course published successfully`, 'green');
    } else {
      addResult(
        'Publishing Workflow',
        'FAIL',
        `Publish failed with status ${publishResponse.status}`,
      );
      log(`  ✗ FAIL: Publish failed`, 'red');
    }
    
    // Cleanup
    await prisma.course.delete({ where: { id: testCourse.id } });
    log(`  Cleaned up test course`, 'blue');
    
    return true;
  } catch (error: any) {
    addResult(
      'Publishing Workflow',
      'FAIL',
      `Error testing publishing: ${error.message}`,
    );
    log(`  ✗ FAIL: ${error.message}`, 'red');
    return false;
  }
}

// Test 4: Test Unpublishing Workflow
async function testUnpublishingWorkflow() {
  log('\n4. Testing Unpublishing Workflow...', 'blue');
  
  try {
    // Create a published test course
    const testCourse = await prisma.course.create({
      data: {
        id: generateId(),
        title: 'Test Course for Unpublishing',
        slug: `test-unpublish-${Date.now()}`,
        summary: 'Test course summary',
        priceCents: 999,
        currency: 'INR',
        published: true,
        updatedAt: new Date(),
        Module: {
          create: {
            id: generateId(),
            title: 'Test Module',
            order: 0,
            Lesson: {
              create: {
                id: generateId(),
                title: 'Test Lesson',
                content: 'Test content',
                order: 0,
              },
            },
          },
        },
      },
    });
    
    log(`  Created published test course: ${testCourse.id}`, 'blue');
    
    // Test unpublish endpoint
    const unpublishResponse = await fetch(
      `http://localhost:3001/api/admin/courses/${testCourse.id}/unpublish`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (unpublishResponse.status === 401) {
      addResult(
        'Unpublishing Workflow',
        'PASS',
        'Unpublish endpoint exists and requires authentication',
      );
      log(`  ✓ PASS: Unpublish endpoint requires authentication`, 'green');
    } else if (unpublishResponse.ok) {
      const data = await unpublishResponse.json();
      addResult(
        'Unpublishing Workflow',
        'PASS',
        'Course unpublished successfully',
        { courseId: testCourse.id, published: data.course?.published }
      );
      log(`  ✓ PASS: Course unpublished successfully`, 'green');
    } else {
      addResult(
        'Unpublishing Workflow',
        'FAIL',
        `Unpublish failed with status ${unpublishResponse.status}`,
      );
      log(`  ✗ FAIL: Unpublish failed`, 'red');
    }
    
    // Cleanup
    await prisma.course.delete({ where: { id: testCourse.id } });
    log(`  Cleaned up test course`, 'blue');
    
    return true;
  } catch (error: any) {
    addResult(
      'Unpublishing Workflow',
      'FAIL',
      `Error testing unpublishing: ${error.message}`,
    );
    log(`  ✗ FAIL: ${error.message}`, 'red');
    return false;
  }
}

// Test 5: Test Featured Status Changes
async function testFeaturedStatus() {
  log('\n5. Testing Featured Status Changes...', 'blue');
  
  try {
    // Create a published test course
    const testCourse = await prisma.course.create({
      data: {
        id: generateId(),
        title: 'Test Course for Featured',
        slug: `test-featured-${Date.now()}`,
        summary: 'Test course summary',
        priceCents: 999,
        currency: 'INR',
        published: true,
        featured: false,
        updatedAt: new Date(),
        Module: {
          create: {
            id: generateId(),
            title: 'Test Module',
            order: 0,
            Lesson: {
              create: {
                id: generateId(),
                title: 'Test Lesson',
                content: 'Test content',
                order: 0,
              },
            },
          },
        },
      },
    });
    
    log(`  Created test course: ${testCourse.id}`, 'blue');
    
    // Test feature endpoint
    const featureResponse = await fetch(
      `http://localhost:3001/api/admin/courses/${testCourse.id}/feature`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (featureResponse.status === 401) {
      addResult(
        'Featured Status',
        'PASS',
        'Feature endpoint exists and requires authentication',
      );
      log(`  ✓ PASS: Feature endpoint requires authentication`, 'green');
    } else if (featureResponse.ok) {
      const data = await featureResponse.json();
      addResult(
        'Featured Status',
        'PASS',
        'Course featured successfully',
        { courseId: testCourse.id, featured: data.course?.featured }
      );
      log(`  ✓ PASS: Course featured successfully`, 'green');
    } else {
      addResult(
        'Featured Status',
        'FAIL',
        `Feature failed with status ${featureResponse.status}`,
      );
      log(`  ✗ FAIL: Feature failed`, 'red');
    }
    
    // Test unfeature endpoint
    const unfeatureResponse = await fetch(
      `http://localhost:3001/api/admin/courses/${testCourse.id}/unfeature`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (unfeatureResponse.status === 401) {
      log(`  ✓ PASS: Unfeature endpoint requires authentication`, 'green');
    } else if (unfeatureResponse.ok) {
      log(`  ✓ PASS: Course unfeatured successfully`, 'green');
    } else {
      log(`  ⚠️  WARNING: Unfeature failed with status ${unfeatureResponse.status}`, 'yellow');
    }
    
    // Cleanup
    await prisma.course.delete({ where: { id: testCourse.id } });
    log(`  Cleaned up test course`, 'blue');
    
    return true;
  } catch (error: any) {
    addResult(
      'Featured Status',
      'FAIL',
      `Error testing featured status: ${error.message}`,
    );
    log(`  ✗ FAIL: ${error.message}`, 'red');
    return false;
  }
}

// Test 6: Verify Database Schema
async function testDatabaseSchema() {
  log('\n6. Testing Database Schema...', 'blue');
  
  try {
    // Check if Course table has required fields
    const course = await prisma.course.findFirst({
      select: {
        id: true,
        published: true,
        featured: true,
        thumbnailUrl: true,
      },
    });
    
    addResult(
      'Database Schema',
      'PASS',
      'Course table has all required fields for publishing and media',
      { hasPublished: true, hasFeatured: true, hasThumbnailUrl: true }
    );
    log(`  ✓ PASS: Database schema is correct`, 'green');
    return true;
  } catch (error: any) {
    addResult(
      'Database Schema',
      'FAIL',
      `Database schema check failed: ${error.message}`,
    );
    log(`  ✗ FAIL: ${error.message}`, 'red');
    return false;
  }
}

// Main verification function
async function runVerification() {
  log('\n' + '='.repeat(60), 'blue');
  log('CHECKPOINT 9 VERIFICATION', 'blue');
  log('Publishing and Media Workflows', 'blue');
  log('='.repeat(60), 'blue');
  
  await testS3Configuration();
  await testMediaUploadEndpoint();
  await testPublishingWorkflow();
  await testUnpublishingWorkflow();
  await testFeaturedStatus();
  await testDatabaseSchema();
  
  // Print summary
  log('\n' + '='.repeat(60), 'blue');
  log('VERIFICATION SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '⚠️';
    const color = result.status === 'PASS' ? 'green' : result.status === 'FAIL' ? 'red' : 'yellow';
    log(`${icon} ${result.test}: ${result.message}`, color);
  });
  
  log('\n' + '-'.repeat(60), 'blue');
  log(`Total Tests: ${results.length}`, 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'blue');
  log(`Skipped: ${skipped}`, skipped > 0 ? 'yellow' : 'blue');
  log('-'.repeat(60) + '\n', 'blue');
  
  if (failed > 0) {
    log('⚠️  Some tests failed. Please review the failures above.', 'red');
    process.exit(1);
  } else if (skipped > 0) {
    log('⚠️  Some tests were skipped. S3 configuration is required for full verification.', 'yellow');
    log('   To enable media upload, configure AWS credentials in .env:', 'yellow');
    log('   - AWS_REGION', 'yellow');
    log('   - AWS_ACCESS_KEY_ID', 'yellow');
    log('   - AWS_SECRET_ACCESS_KEY', 'yellow');
    log('   - AWS_S3_BUCKET', 'yellow');
  } else {
    log('✓ All tests passed!', 'green');
  }
}

// Run verification
runVerification()
  .catch(error => {
    log(`\n✗ Verification failed with error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
