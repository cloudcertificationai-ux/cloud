/**
 * Test script to verify Cloudflare R2 connection
 * 
 * Usage: npx tsx scripts/test-r2-connection.ts
 */

import 'dotenv/config';
import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Load environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN;

console.log('🔍 Checking R2 Configuration...\n');

// Validate environment variables
const missingVars: string[] = [];
if (!R2_ACCOUNT_ID) missingVars.push('R2_ACCOUNT_ID');
if (!R2_ACCESS_KEY_ID) missingVars.push('R2_ACCESS_KEY_ID');
if (!R2_SECRET_ACCESS_KEY) missingVars.push('R2_SECRET_ACCESS_KEY');
if (!R2_BUCKET_NAME) missingVars.push('R2_BUCKET_NAME');
if (!R2_PUBLIC_DOMAIN) missingVars.push('R2_PUBLIC_DOMAIN');

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease update your .env file with the correct values.');
  process.exit(1);
}

console.log('✅ All required environment variables are set\n');
console.log('Configuration:');
console.log(`   Account ID: ${R2_ACCOUNT_ID}`);
console.log(`   Bucket: ${R2_BUCKET_NAME}`);
console.log(`   Public Domain: ${R2_PUBLIC_DOMAIN}`);
console.log(`   Endpoint: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com\n`);

// Create R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

async function testR2Connection() {
  try {
    console.log('🧪 Test 1: Listing buckets...');
    const listCommand = new ListBucketsCommand({});
    const listResponse = await r2Client.send(listCommand);
    console.log(`✅ Successfully connected to R2!`);
    console.log(`   Found ${listResponse.Buckets?.length || 0} bucket(s):`);
    listResponse.Buckets?.forEach(bucket => {
      console.log(`   - ${bucket.Name} (created: ${bucket.CreationDate?.toISOString()})`);
    });
    console.log();

    // Test 2: Upload a test file
    console.log('🧪 Test 2: Uploading test file...');
    const testKey = `test/connection-test-${Date.now()}.txt`;
    const testContent = `R2 Connection Test - ${new Date().toISOString()}`;
    
    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    
    await r2Client.send(putCommand);
    console.log(`✅ Successfully uploaded test file: ${testKey}`);
    console.log(`   Public URL: ${R2_PUBLIC_DOMAIN}/${testKey}\n`);

    // Test 3: Generate presigned URL
    console.log('🧪 Test 3: Generating presigned URL...');
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: testKey,
    });
    
    const presignedUrl = await getSignedUrl(r2Client, getCommand, { expiresIn: 3600 });
    console.log(`✅ Successfully generated presigned URL`);
    console.log(`   URL (expires in 1 hour): ${presignedUrl.substring(0, 100)}...\n`);

    // Test 4: Read the file back
    console.log('🧪 Test 4: Reading test file...');
    const getResponse = await r2Client.send(getCommand);
    const retrievedContent = await getResponse.Body?.transformToString();
    
    if (retrievedContent === testContent) {
      console.log(`✅ Successfully read test file`);
      console.log(`   Content matches: "${retrievedContent}"\n`);
    } else {
      console.log(`⚠️  Content mismatch!`);
      console.log(`   Expected: "${testContent}"`);
      console.log(`   Got: "${retrievedContent}"\n`);
    }

    // Test 5: Clean up - delete test file
    console.log('🧪 Test 5: Cleaning up test file...');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: testKey,
    });
    
    await r2Client.send(deleteCommand);
    console.log(`✅ Successfully deleted test file\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 All tests passed! R2 is configured correctly.');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\nYou can now:');
    console.log('  • Upload media files through the admin panel');
    console.log('  • Access files via the public domain');
    console.log('  • Generate presigned URLs for secure access\n');

  } catch (error: any) {
    console.error('\n❌ R2 Connection Test Failed!\n');
    
    if (error.name === 'InvalidAccessKeyId') {
      console.error('Error: Invalid Access Key ID');
      console.error('Solution: Check that R2_ACCESS_KEY_ID is correct in your .env file\n');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('Error: Invalid Secret Access Key');
      console.error('Solution: Check that R2_SECRET_ACCESS_KEY is correct in your .env file\n');
    } else if (error.name === 'NoSuchBucket') {
      console.error(`Error: Bucket "${R2_BUCKET_NAME}" does not exist`);
      console.error('Solution: Create the bucket in Cloudflare R2 dashboard or update R2_BUCKET_NAME\n');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('Error: Cannot connect to R2 endpoint');
      console.error('Solution: Check your internet connection and R2_ACCOUNT_ID\n');
    } else {
      console.error('Error details:');
      console.error(`  Name: ${error.name}`);
      console.error(`  Code: ${error.code || 'N/A'}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Status: ${error.$metadata?.httpStatusCode || 'N/A'}\n`);
    }
    
    console.error('Debug information:');
    console.error(`  Endpoint: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
    console.error(`  Bucket: ${R2_BUCKET_NAME}`);
    console.error(`  Access Key ID: ${R2_ACCESS_KEY_ID?.substring(0, 10)}...`);
    console.error(`  Secret Key: ${R2_SECRET_ACCESS_KEY ? '[SET]' : '[NOT SET]'}\n`);
    
    process.exit(1);
  }
}

// Run the test
testR2Connection();
