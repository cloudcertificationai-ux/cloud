/**
 * Seed 15 Cloud Computing courses (upsert by slug).
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const courses = [
  {
    title: 'AWS Solutions Architect Associate 2026',
    slug: 'aws-solutions-architect-associate-2026',
    summary: 'Design resilient AWS architectures for enterprise workloads.',
    hours: 80,
    price: 34900,
    rating: 4.8,
    featured: true,
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    level: 'Intermediate',
  },
  {
    title: 'AWS DevOps Engineer Professional',
    slug: 'aws-devops-engineer-professional-2026',
    summary: 'Automate CI/CD, IaC, and operations on AWS at scale.',
    hours: 90,
    price: 39900,
    rating: 4.8,
    featured: true,
    img: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
    level: 'Advanced',
  },
  {
    title: 'Microsoft Azure Administrator (AZ-104)',
    slug: 'microsoft-azure-administrator-az104-2026',
    summary: 'Manage Azure identities, networking, storage, and compute.',
    hours: 70,
    price: 32900,
    rating: 4.7,
    featured: false,
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a2?w=800&q=80',
    level: 'Intermediate',
  },
  {
    title: 'Azure Solutions Architect Expert',
    slug: 'azure-solutions-architect-expert-2026',
    summary: 'Design enterprise Azure landing zones and hybrid cloud.',
    hours: 95,
    price: 42900,
    rating: 4.8,
    featured: true,
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    level: 'Advanced',
  },
  {
    title: 'Google Cloud Professional Architect',
    slug: 'google-cloud-professional-architect-2026',
    summary: 'Architect scalable solutions on Google Cloud Platform.',
    hours: 85,
    price: 38900,
    rating: 4.7,
    featured: true,
    img: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80',
    level: 'Advanced',
  },
  {
    title: 'Multi-Cloud Architecture Masterclass',
    slug: 'multi-cloud-architecture-masterclass-2026',
    summary: 'Design portable workloads across AWS, Azure, and GCP.',
    hours: 75,
    price: 44900,
    rating: 4.6,
    featured: false,
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    level: 'Advanced',
  },
  {
    title: 'Terraform Infrastructure as Code Pro',
    slug: 'terraform-infrastructure-as-code-pro-2026',
    summary: 'Automate cloud infrastructure with Terraform and modules.',
    hours: 60,
    price: 29900,
    rating: 4.8,
    featured: true,
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    level: 'Intermediate',
  },
  {
    title: 'Docker & Container Essentials',
    slug: 'docker-container-essentials-2026',
    summary: 'Package and ship apps with Docker for cloud-native teams.',
    hours: 40,
    price: 19900,
    rating: 4.7,
    featured: false,
    img: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80',
    level: 'Beginner',
  },
  {
    title: 'Kubernetes Administrator (CKA) Path',
    slug: 'kubernetes-administrator-cka-2026',
    summary: 'Operate production Kubernetes clusters and pass CKA skills.',
    hours: 80,
    price: 37900,
    rating: 4.8,
    featured: true,
    img: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
    level: 'Intermediate',
  },
  {
    title: 'Serverless on AWS with Lambda & API Gateway',
    slug: 'serverless-aws-lambda-api-gateway-2026',
    summary: 'Build event-driven serverless APIs and backends on AWS.',
    hours: 55,
    price: 27900,
    rating: 4.7,
    featured: false,
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    level: 'Intermediate',
  },
  {
    title: 'Cloud FinOps & Cost Optimization',
    slug: 'cloud-finops-cost-optimization-2026',
    summary: 'Cut cloud spend with FinOps frameworks and observability.',
    hours: 45,
    price: 24900,
    rating: 4.6,
    featured: false,
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    level: 'Intermediate',
  },
  {
    title: 'Site Reliability Engineering (SRE) Fundamentals',
    slug: 'site-reliability-engineering-sre-2026',
    summary: 'Apply SRE practices for reliability, SLOs, and incident response.',
    hours: 65,
    price: 35900,
    rating: 4.7,
    featured: true,
    img: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    level: 'Intermediate',
  },
  {
    title: 'Cloud Networking & Hybrid Connectivity',
    slug: 'cloud-networking-hybrid-connectivity-2026',
    summary: 'Design VPCs, peering, VPN, and ExpressRoute/Direct Connect.',
    hours: 50,
    price: 28900,
    rating: 4.6,
    featured: false,
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a2?w=800&q=80',
    level: 'Intermediate',
  },
  {
    title: 'AWS Security Specialty Essentials',
    slug: 'aws-security-specialty-essentials-2026',
    summary: 'Secure cloud accounts with IAM, KMS, GuardDuty, and WAF.',
    hours: 70,
    price: 33900,
    rating: 4.8,
    featured: true,
    img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    level: 'Advanced',
  },
  {
    title: 'Platform Engineering on the Cloud',
    slug: 'platform-engineering-on-the-cloud-2026',
    summary: 'Build internal developer platforms with GitOps and golden paths.',
    hours: 75,
    price: 41900,
    rating: 4.7,
    featured: true,
    img: 'https://images.unsplash.com/photo-1504639725590-34d09848534b?w=800&q=80',
    level: 'Advanced',
  },
]

async function main() {
  const cat = await prisma.category.upsert({
    where: { slug: 'cloud-computing' },
    update: { name: 'Cloud Computing' },
    create: { name: 'Cloud Computing', slug: 'cloud-computing' },
  })
  console.log('Category:', cat.name)

  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        summary: c.summary,
        description: `${c.summary} Hands-on labs and interview-ready projects for 2026 cloud roles.`,
        level: c.level,
        durationMin: c.hours * 60,
        priceCents: c.price,
        rating: c.rating,
        published: true,
        featured: c.featured,
        thumbnailUrl: c.img,
        categoryId: cat.id,
        currency: 'INR',
        language: 'English',
      },
      create: {
        title: c.title,
        slug: c.slug,
        summary: c.summary,
        description: `${c.summary} Hands-on labs and interview-ready projects for 2026 cloud roles.`,
        level: c.level,
        durationMin: c.hours * 60,
        priceCents: c.price,
        rating: c.rating,
        published: true,
        featured: c.featured,
        thumbnailUrl: c.img,
        categoryId: cat.id,
        currency: 'INR',
        language: 'English',
      },
    })
    console.log('✓', c.title)
  }

  const count = await prisma.course.count({
    where: { categoryId: cat.id, published: true },
  })
  console.log(`\nPublished Cloud Computing courses: ${count}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
