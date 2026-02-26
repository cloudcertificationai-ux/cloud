#!/usr/bin/env tsx
/**
 * Script to validate structured data (JSON-LD) for courses
 * This helps ensure our structured data is valid for Google Rich Results
 */

import { generateCourseStructuredData, generateOrganizationStructuredData } from '../src/lib/seo';

// Mock course data for validation
const mockCourse = {
  id: 'test-course-id',
  title: 'Full Stack Web Development Bootcamp',
  slug: 'full-stack-web-development-bootcamp',
  shortDescription: 'Learn to build modern web applications from scratch with React, Node.js, and PostgreSQL',
  level: 'Intermediate',
  duration: {
    hours: 120,
    weeks: 12,
  },
  rating: {
    average: 4.8,
    count: 245,
  },
  price: {
    amount: 499,
    currency: 'USD',
  },
  thumbnailUrl: 'https://anywheredoor.com/courses/full-stack-bootcamp.jpg',
  tags: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Full Stack'],
  category: {
    name: 'Web Development',
  },
  mode: 'Online',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-15'),
};

const mockInstructors = [
  {
    name: 'John Doe',
    title: 'Senior Full Stack Developer',
    bio: 'John has 10+ years of experience building scalable web applications',
    profileImageUrl: 'https://anywheredoor.com/instructors/john-doe.jpg',
  },
];

console.log('='.repeat(80));
console.log('STRUCTURED DATA VALIDATION');
console.log('='.repeat(80));
console.log();

// Generate and display course structured data
console.log('Course Structured Data (JSON-LD):');
console.log('-'.repeat(80));
const courseStructuredData = generateCourseStructuredData(mockCourse as any, mockInstructors as any);
console.log(JSON.stringify(courseStructuredData, null, 2));
console.log();

// Validate required fields
console.log('Validation Results:');
console.log('-'.repeat(80));

const validations = [
  { field: '@context', value: courseStructuredData['@context'], expected: 'https://schema.org' },
  { field: '@type', value: courseStructuredData['@type'], expected: 'Course' },
  { field: 'name', value: courseStructuredData.name, required: true },
  { field: 'description', value: courseStructuredData.description, required: true },
  { field: 'provider', value: courseStructuredData.provider, required: true },
  { field: 'instructor', value: courseStructuredData.instructor, required: true },
  { field: 'aggregateRating', value: courseStructuredData.aggregateRating, required: true },
  { field: 'offers.price', value: courseStructuredData.offers?.price, required: true },
  { field: 'offers.priceCurrency', value: courseStructuredData.offers?.priceCurrency, required: true },
];

let allValid = true;
validations.forEach(({ field, value, expected, required }) => {
  const isValid = expected ? value === expected : (required ? !!value : true);
  const status = isValid ? '✓' : '✗';
  const color = isValid ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  
  console.log(`${color}${status}${reset} ${field}: ${isValid ? 'Valid' : 'Invalid'}`);
  
  if (!isValid) {
    allValid = false;
    if (expected) {
      console.log(`  Expected: ${expected}, Got: ${value}`);
    } else {
      console.log(`  Missing required field`);
    }
  }
});

console.log();
console.log('='.repeat(80));
console.log(`Overall Status: ${allValid ? '\x1b[32m✓ VALID\x1b[0m' : '\x1b[31m✗ INVALID\x1b[0m'}`);
console.log('='.repeat(80));
console.log();

// Generate organization structured data
console.log('Organization Structured Data (JSON-LD):');
console.log('-'.repeat(80));
const orgStructuredData = generateOrganizationStructuredData();
console.log(JSON.stringify(orgStructuredData, null, 2));
console.log();

console.log('Next Steps:');
console.log('-'.repeat(80));
console.log('1. Copy the JSON-LD output above');
console.log('2. Visit: https://search.google.com/test/rich-results');
console.log('3. Paste the JSON-LD and validate');
console.log('4. Check for any warnings or errors');
console.log();
console.log('Alternative validation:');
console.log('- Schema.org validator: https://validator.schema.org/');
console.log('- Google Rich Results Test: https://search.google.com/test/rich-results');
console.log();

process.exit(allValid ? 0 : 1);
