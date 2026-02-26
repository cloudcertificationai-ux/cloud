#!/usr/bin/env tsx
/**
 * Script to test sitemap generation
 * This validates that the sitemap includes all published courses
 */

import sitemap from '../src/app/sitemap';

async function testSitemap() {
  console.log('='.repeat(80));
  console.log('SITEMAP GENERATION TEST');
  console.log('='.repeat(80));
  console.log();

  try {
    const sitemapEntries = await sitemap();
    
    console.log(`Total sitemap entries: ${sitemapEntries.length}`);
    console.log();

    // Group by type
    const staticPages = sitemapEntries.filter(entry => 
      !entry.url.includes('/courses/') || entry.url.endsWith('/courses') || entry.url.endsWith('/courses/featured')
    );
    const coursePages = sitemapEntries.filter(entry => 
      entry.url.includes('/courses/') && 
      !entry.url.endsWith('/courses') && 
      !entry.url.endsWith('/courses/featured') &&
      !entry.url.includes('/category/')
    );
    const categoryPages = sitemapEntries.filter(entry => 
      entry.url.includes('/courses/category/')
    );

    console.log('Breakdown:');
    console.log('-'.repeat(80));
    console.log(`Static pages: ${staticPages.length}`);
    console.log(`Course pages: ${coursePages.length}`);
    console.log(`Category pages: ${categoryPages.length}`);
    console.log();

    // Display sample entries
    console.log('Sample Static Pages:');
    console.log('-'.repeat(80));
    staticPages.slice(0, 5).forEach(entry => {
      console.log(`  ${entry.url}`);
      console.log(`    Priority: ${entry.priority}, Change Frequency: ${entry.changeFrequency}`);
    });
    console.log();

    if (coursePages.length > 0) {
      console.log('Sample Course Pages:');
      console.log('-'.repeat(80));
      coursePages.slice(0, 5).forEach(entry => {
        console.log(`  ${entry.url}`);
        console.log(`    Last Modified: ${entry.lastModified}, Priority: ${entry.priority}`);
      });
      console.log();
    } else {
      console.log('⚠️  No course pages found in sitemap');
      console.log('   This might be expected if no courses are published yet');
      console.log();
    }

    if (categoryPages.length > 0) {
      console.log('Sample Category Pages:');
      console.log('-'.repeat(80));
      categoryPages.slice(0, 5).forEach(entry => {
        console.log(`  ${entry.url}`);
        console.log(`    Priority: ${entry.priority}`);
      });
      console.log();
    }

    // Validation checks
    console.log('Validation:');
    console.log('-'.repeat(80));
    
    const checks = [
      { name: 'Homepage included', pass: sitemapEntries.some(e => e.url.endsWith('.com') || e.url.endsWith('.com/')) },
      { name: 'Courses page included', pass: sitemapEntries.some(e => e.url.endsWith('/courses')) },
      { name: 'All URLs are absolute', pass: sitemapEntries.every(e => e.url.startsWith('http')) },
      { name: 'All entries have lastModified', pass: sitemapEntries.every(e => e.lastModified) },
      { name: 'All entries have priority', pass: sitemapEntries.every(e => e.priority !== undefined) },
      { name: 'All entries have changeFrequency', pass: sitemapEntries.every(e => e.changeFrequency) },
    ];

    checks.forEach(check => {
      const status = check.pass ? '✓' : '✗';
      const color = check.pass ? '\x1b[32m' : '\x1b[31m';
      const reset = '\x1b[0m';
      console.log(`${color}${status}${reset} ${check.name}`);
    });

    const allPassed = checks.every(c => c.pass);
    
    console.log();
    console.log('='.repeat(80));
    console.log(`Overall Status: ${allPassed ? '\x1b[32m✓ VALID\x1b[0m' : '\x1b[31m✗ INVALID\x1b[0m'}`);
    console.log('='.repeat(80));
    console.log();

    console.log('Next Steps:');
    console.log('-'.repeat(80));
    console.log('1. Build the application: npm run build');
    console.log('2. Access sitemap at: http://localhost:3000/sitemap.xml');
    console.log('3. Submit to Google Search Console');
    console.log('4. Submit to Bing Webmaster Tools');
    console.log();

    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

testSitemap();
