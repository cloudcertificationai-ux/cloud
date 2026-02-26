#!/usr/bin/env tsx
/**
 * Script to test robots.txt generation
 * This validates that the robots.txt has correct rules
 */

import robots from '../src/app/robots';

function testRobots() {
  console.log('='.repeat(80));
  console.log('ROBOTS.TXT GENERATION TEST');
  console.log('='.repeat(80));
  console.log();

  const robotsConfig = robots();

  console.log('Generated robots.txt configuration:');
  console.log('-'.repeat(80));
  console.log(JSON.stringify(robotsConfig, null, 2));
  console.log();

  // Validation checks
  console.log('Validation:');
  console.log('-'.repeat(80));

  const checks = [
    {
      name: 'Has rules for all user agents',
      pass: robotsConfig.rules.some(rule => rule.userAgent === '*'),
    },
    {
      name: 'Disallows /api/ for all agents',
      pass: robotsConfig.rules.every(rule => 
        rule.disallow?.includes('/api/') || rule.disallow?.includes('/api')
      ),
    },
    {
      name: 'Disallows /admin/ for all agents',
      pass: robotsConfig.rules.every(rule => 
        rule.disallow?.includes('/admin/') || rule.disallow?.includes('/admin')
      ),
    },
    {
      name: 'Allows / for all agents',
      pass: robotsConfig.rules.every(rule => 
        rule.allow === '/' || (Array.isArray(rule.allow) && rule.allow.includes('/'))
      ),
    },
    {
      name: 'Has sitemap reference',
      pass: !!robotsConfig.sitemap && robotsConfig.sitemap.includes('sitemap.xml'),
    },
    {
      name: 'Has host specified',
      pass: !!robotsConfig.host,
    },
    {
      name: 'Googlebot has specific rules',
      pass: robotsConfig.rules.some(rule => rule.userAgent === 'Googlebot'),
    },
    {
      name: 'Allows course pages for Googlebot',
      pass: robotsConfig.rules.some(rule => 
        rule.userAgent === 'Googlebot' && 
        Array.isArray(rule.allow) && 
        rule.allow.some(path => path.includes('/courses'))
      ),
    },
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

  // Generate sample robots.txt output
  console.log('Sample robots.txt output:');
  console.log('-'.repeat(80));
  
  robotsConfig.rules.forEach(rule => {
    console.log(`User-agent: ${rule.userAgent}`);
    
    if (Array.isArray(rule.allow)) {
      rule.allow.forEach(path => console.log(`Allow: ${path}`));
    } else if (rule.allow) {
      console.log(`Allow: ${rule.allow}`);
    }
    
    if (Array.isArray(rule.disallow)) {
      rule.disallow.forEach(path => console.log(`Disallow: ${path}`));
    } else if (rule.disallow) {
      console.log(`Disallow: ${rule.disallow}`);
    }
    
    console.log();
  });

  if (robotsConfig.sitemap) {
    console.log(`Sitemap: ${robotsConfig.sitemap}`);
  }
  
  if (robotsConfig.host) {
    console.log(`Host: ${robotsConfig.host}`);
  }

  console.log();
  console.log('Next Steps:');
  console.log('-'.repeat(80));
  console.log('1. Build the application: npm run build');
  console.log('2. Access robots.txt at: http://localhost:3000/robots.txt');
  console.log('3. Validate with: https://www.google.com/webmasters/tools/robots-testing-tool');
  console.log('4. Test crawling with: curl http://localhost:3000/robots.txt');
  console.log();

  process.exit(allPassed ? 0 : 1);
}

testRobots();
