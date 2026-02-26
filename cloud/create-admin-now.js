require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  const email = 'admin@anywheredoor.com';
  const password = 'Admin@123456';
  
  console.log('Creating admin user...');
  
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        password: hashedPassword, 
        role: 'ADMIN' 
      },
      create: { 
        email, 
        name: 'Admin User', 
        password: hashedPassword, 
        role: 'ADMIN', 
        emailVerified: new Date() 
      }
    });
    
    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Sign in at: http://localhost:3001/auth/signin\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createAdmin();
