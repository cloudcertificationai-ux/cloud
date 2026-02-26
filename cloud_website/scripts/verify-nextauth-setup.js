#!/usr/bin/env node
// scripts/verify-nextauth-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying NextAuth.js Setup...\n');

const checks = [];

// Check 1: Verify auth.ts exists
const authPath = path.join(__dirname, '../src/lib/auth.ts');
if (fs.existsSync(authPath)) {
  checks.push({ name: 'auth.ts configuration file', status: '✅' });
} else {
  checks.push({ name: 'auth.ts configuration file', status: '❌' });
}

// Check 2: Verify API route exists
const apiRoutePath = path.join(__dirname, '../src/app/api/auth/[...nextauth]/route.ts');
if (fs.existsSync(apiRoutePath)) {
  checks.push({ name: 'NextAuth API route', status: '✅' });
} else {
  checks.push({ name: 'NextAuth API route', status: '❌' });
}

// Check 3: Verify TypeScript types exist
const typesPath = path.join(__dirname, '../src/types/next-auth.d.ts');
if (fs.existsSync(typesPath)) {
  checks.push({ name: 'TypeScript type definitions', status: '✅' });
} else {
  checks.push({ name: 'TypeScript type definitions', status: '❌' });
}

// Check 4: Verify .env file exists
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  checks.push({ name: '.env file', status: '✅' });
  
  // Check environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'APPLE_ID',
    'APPLE_SECRET',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'AUTH0_ISSUER'
  ];
  
  const missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length === 0) {
    checks.push({ name: 'Required environment variables', status: '✅' });
  } else {
    checks.push({ 
      name: 'Required environment variables', 
      status: '⚠️',
      note: `Missing: ${missingVars.join(', ')}`
    });
  }
} else {
  checks.push({ name: '.env file', status: '❌' });
}

// Check 5: Verify signin page exists
const signinPath = path.join(__dirname, '../src/app/auth/signin/page.tsx');
if (fs.existsSync(signinPath)) {
  checks.push({ name: 'Sign-in page', status: '✅' });
} else {
  checks.push({ name: 'Sign-in page', status: '❌' });
}

// Check 6: Verify package.json has required dependencies
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = ['next-auth', '@next-auth/prisma-adapter'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    checks.push({ name: 'NextAuth dependencies', status: '✅' });
  } else {
    checks.push({ 
      name: 'NextAuth dependencies', 
      status: '❌',
      note: `Missing: ${missingDeps.join(', ')}`
    });
  }
}

// Print results
console.log('Setup Verification Results:');
console.log('─'.repeat(60));
checks.forEach(check => {
  console.log(`${check.status} ${check.name}`);
  if (check.note) {
    console.log(`   ${check.note}`);
  }
});
console.log('─'.repeat(60));

const allPassed = checks.every(check => check.status === '✅');
const hasWarnings = checks.some(check => check.status === '⚠️');

if (allPassed) {
  console.log('\n✅ All checks passed! NextAuth.js is properly configured.');
  console.log('\n📝 Next steps:');
  console.log('   1. Update environment variables with actual credentials');
  console.log('   2. Test authentication flow with Google provider');
  console.log('   3. Verify session management works correctly');
  process.exit(0);
} else if (hasWarnings) {
  console.log('\n⚠️  Setup complete with warnings. Please review the notes above.');
  console.log('\n📝 Action required:');
  console.log('   - Update placeholder environment variables with actual credentials');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please review the errors above.');
  process.exit(1);
}
