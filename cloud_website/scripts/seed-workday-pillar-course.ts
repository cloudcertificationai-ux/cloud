/**
 * Upsert Workday Software Training as a flagship live (pillar) course.
 * Curriculum from Cloud Certification Workday Software Training outline.
 * Live instructor-led, 40+ hours, two months tenant access, price INR 29,999.
 */
import { PrismaClient, LessonKind } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const SLUG = 'workday-software-training'
const CATEGORY = { name: 'Enterprise Applications', slug: 'enterprise-applications' }
const MIN_LIVE_MINUTES = 40 * 60 // 40+ hours of live training
const PRICE_CENTS = 29999 * 100 // ₹29,999

type LessonSeed = { title: string; duration: number; kind: LessonKind }
type ModuleSeed = { title: string; lessons: LessonSeed[] }

function T(title: string, duration = 15): LessonSeed {
  return { title, duration, kind: 'VIDEO' }
}
function Lab(title: string, duration = 45): LessonSeed {
  return { title, duration, kind: 'ASSIGNMENT' }
}
function Q(title: string, duration = 20): LessonSeed {
  return { title, duration, kind: 'QUIZ' }
}

const CURRICULUM: ModuleSeed[] = [
  {
    title: 'Lesson 01 — Introduction to Workday',
    lessons: [
      T('What is Workday HCM and Financials', 18),
      T('Workday framework fundamentals', 16),
      T('Basic Workday navigation and landing pages', 18),
      T('Single and multi-select prompt fields', 14),
      T('Setting up standard screen icons', 12),
      T('Nova architecture overview', 16),
      T('Create and manage access to a virtual machine / tenant', 16),
      Lab('Live lab: Tenant login, landing pages, and navigation', 50),
    ],
  },
  {
    title: 'Lesson 02 — Organizations in Workday',
    lessons: [
      T('Organization types in Workday', 18),
      T('Supervisory organizations', 18),
      T('Managing a supervisory organization', 16),
      T('Creating a subordinate organization', 16),
      T('Organization hierarchies', 16),
      Lab('Live lab: Build a supervisory org hierarchy', 50),
    ],
  },
  {
    title: 'Lesson 03 — Workday Staffing Models',
    lessons: [
      T('Types of staffing models', 16),
      T('Configuring an individual staffing model', 18),
      T('Position management', 18),
      T('Differentiating Workday staffing models', 16),
      T('Maintaining staffing models', 14),
      Lab('Live lab: Configure position management vs job management', 50),
    ],
  },
  {
    title: 'Lesson 04 — Jobs and Positions',
    lessons: [
      T('Job profiles in Workday', 16),
      T('Differentiating job profiles', 14),
      T('Management-level hierarchy', 16),
      T('Managing filled and unfilled positions', 16),
      T('Headcount groups', 14),
      Lab('Live lab: Job profiles, positions, and headcount', 45),
      Q('Foundations knowledge check — orgs, staffing, jobs', 20),
    ],
  },
  {
    title: 'Lesson 05 — Compensation in Workday',
    lessons: [
      T('Compensation components', 18),
      T('Compensation reports', 14),
      T('Compensation grades', 16),
      T('Salary and hourly plans', 16),
      T('Segment security and initiating a compensation event', 18),
      Lab('Live lab: Grades, plans, and a compensation event', 50),
    ],
  },
  {
    title: 'Lesson 06 — Workday Security Groups',
    lessons: [
      T('Security group types', 18),
      T('Configuring role-based security', 18),
      T('Components of configurable security', 16),
      T('Workday functional areas', 16),
      T('Domain security policies', 18),
      Lab('Live lab: Role-based security and domain policies', 55),
    ],
  },
  {
    title: 'Lesson 07 — Workday Business Process',
    lessons: [
      T('Business process framework', 18),
      T('Business process step types', 18),
      T('Default vs customized business processes', 16),
      T('Approvals, notifications, and routing', 16),
      Lab('Live lab: Customize a hire / change-job business process', 55),
    ],
  },
  {
    title: 'Lesson 08 — Workday Reports',
    lessons: [
      T('Standard reports vs custom reports', 16),
      T('Data sources', 14),
      T('Create reports', 18),
      T('Report type and data source selection', 16),
      T('Filter criteria', 14),
      Lab('Live lab: Build a custom advanced report', 50),
    ],
  },
  {
    title: 'Lesson 09 — Calculated Fields',
    lessons: [
      T('Creating various kinds of calculated fields', 18),
      T('Calculated field reports', 14),
      T('Extract single instance', 16),
      T('Extract multi-instance', 16),
      T('System-wide vs report-specific calculated fields', 16),
      Lab('Live lab: ESI, EMI, and a calculated-field report', 50),
      Q('Reporting and security knowledge check', 20),
    ],
  },
  {
    title: 'Lesson 10 — iLoads and Data Conversion',
    lessons: [
      T('Workday iLoads', 16),
      T('Data push and data extraction', 16),
      T('Kinds of data load', 16),
      T('Implementation areas and implementation tasks', 18),
      T('Data conversion, report, migration, and integration concepts', 18),
      Lab('Live lab: iLoad template and implementation task', 50),
    ],
  },
  {
    title: 'Lesson 11 — Transactions in Workday',
    lessons: [
      T('Creating applicants', 16),
      T('Assigning user-based security groups', 16),
      T('Staffing movement', 16),
      T('Termination and request delegation', 16),
      Lab('Live lab: Hire, transfer, terminate, and delegate', 55),
    ],
  },
  {
    title: 'Lesson 12 — Recruiting, Time & Integrations Overview',
    lessons: [
      T('HCM functionality and integration to other modules', 18),
      T('Recruiting and talent overview', 16),
      T('Absence and time tracking overview', 16),
      T('EIB and core connectors overview', 18),
      T('End-user training and configuration walkthrough', 16),
      Lab('Capstone live lab: Org, hire BP, security, report, and iLoad', 90),
      Q('Final live assessment — Workday Software Training', 30),
    ],
  },
]

const lessonMinutes = CURRICULUM.reduce(
  (sum, mod) => sum + mod.lessons.reduce((s, l) => s + l.duration, 0),
  0
)
const durationScale = MIN_LIVE_MINUTES / lessonMinutes
const durationMin = MIN_LIVE_MINUTES

async function main() {
  console.log('Seeding Workday Software Training pillar course...\n')

  const category = await prisma.category.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name },
    create: CATEGORY,
  })

  const instructor = await prisma.instructor.upsert({
    where: { id: 'workday-pillar-instructor' },
    update: {
      name: 'Sneha Menon',
      bio: 'Workday HCM Solution Architect with 11+ years in HRIS and enterprise HCM. Delivers live Workday software batches covering Core HCM, security, business processes, reporting, calculated fields, iLoads, and tenant-based labs.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Sneha+Menon&background=F59E0B&color=fff&size=256',
    },
    create: {
      id: 'workday-pillar-instructor',
      name: 'Sneha Menon',
      bio: 'Workday HCM Solution Architect with 11+ years in HRIS and enterprise HCM. Delivers live Workday software batches covering Core HCM, security, business processes, reporting, calculated fields, iLoads, and tenant-based labs.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Sneha+Menon&background=F59E0B&color=fff&size=256',
    },
  })

  const courseData = {
    title: 'Workday Software Training',
    summary:
      'Live instructor-led Workday software program — 40+ hours with two months of tenant access covering Core HCM, security, business processes, reporting, calculated fields, iLoads, and transactions.',
    description:
      'This flagship Workday Software Training is 40+ hours of instructor-led training (online, classroom, or one-to-one) with two months of Workday tenant access. You start with the Workday framework, navigation, and Nova architecture, then configure organizations, staffing models, jobs and positions, and compensation. Live labs cover security groups, domain policies, business processes, standard and custom reports, calculated fields, iLoads and data conversion, and day-to-day transactions (hire, transfer, terminate, delegate). Enroll for the live session and get self-paced videos free, with recordings after every class, PDF materials, and 24x7 support. Designed for HRMS, PeopleSoft, and HR-domain professionals targeting Workday HCM Consultant, Security, Compensation, Business Process Admin, and Business Analyst roles.',
    level: 'Beginner',
    durationMin,
    priceCents: PRICE_CENTS,
    rating: 4.6,
    published: true,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    language: 'English',
    currency: 'INR',
    categoryId: category.id,
    instructorId: instructor.id,
    learningOutcomes: [
      'Navigate Workday landing pages, prompts, and the Core HCM framework',
      'Configure supervisory organizations, staffing models, jobs, and positions',
      'Set up compensation components, grades, plans, and compensation events',
      'Implement role-based security groups and domain security policies',
      'Customize business processes for hire, change job, and related transactions',
      'Build custom reports, filters, and calculated fields (ESI / EMI)',
      'Run iLoads, data conversion, and implementation tasks',
      'Complete hire, staffing movement, termination, and delegation in a live tenant',
    ],
    requirements: [
      'HRMS or PeopleSoft background is helpful, not mandatory',
      'Interest in the HR domain and enterprise HCM',
      'Attend live online / classroom / one-to-one sessions (40+ hours)',
      'A computer with internet access for Workday tenant labs',
    ],
    courseFeatures: [
      'Live instructor-led training — 40+ hours',
      'Two months Workday tenant access',
      'Live session enrollment includes self-paced videos free',
      'Every session recorded and shared',
      'Premium PDF materials and certification assistance',
      'Real-time assignments and case studies',
      'Lifetime access to video library and materials',
      '24x7 support team',
    ],
    handsOnProjects: [
      {
        title: 'Tenant navigation and org design',
        description: 'Live: log into the tenant, configure landing pages, and build a supervisory organization hierarchy.',
        skills: ['Navigation', 'Supervisory Orgs', 'Tenant'],
        duration: '1 live session',
      },
      {
        title: 'Staffing model and compensation setup',
        description: 'Live: configure position management, job profiles, grades, and a compensation event.',
        skills: ['Staffing Models', 'Job Profiles', 'Compensation'],
        duration: '1 live session',
      },
      {
        title: 'Security and hire business process',
        description: 'Live: role-based security, domain policies, and a customized hire business process.',
        skills: ['Security Groups', 'Domain Policies', 'Business Process'],
        duration: '1 live session',
      },
      {
        title: 'Reporting, calculated fields, and iLoad capstone',
        description: 'Live capstone: custom report, calculated fields, iLoad, and a hire-to-terminate transaction path.',
        skills: ['Reports', 'Calculated Fields', 'iLoads', 'Transactions'],
        duration: '2 live sessions',
      },
    ],
    caseStudies: [
      {
        title: 'Global supervisory org rollout',
        description: 'How a multi-country HR team structures supervisory orgs, staffing models, and security together.',
      },
      {
        title: 'Hire-to-terminate with audit-ready reports',
        description: 'Customize hire and termination business processes, then evidence them with custom reports.',
      },
    ],
    certifications: [
      {
        title: 'Workday HCM Core pathway',
        issuer: 'Workday / Cloud Certification',
        description: 'Live modules map to Core HCM topics: orgs, staffing, jobs, compensation, security, and business processes. Official Workday certification is employer-sponsored; we prepare you for partner hiring and interviews.',
      },
      {
        title: 'Workday Reporting & Security prep',
        issuer: 'Workday / Cloud Certification',
        description: 'Reports, calculated fields, domain security, and implementation tasks map to reporting and security consultant interviews.',
      },
    ],
  }

  const course = await prisma.course.upsert({
    where: { slug: SLUG },
    update: courseData,
    create: { slug: SLUG, ...courseData },
  })

  await prisma.module.deleteMany({ where: { courseId: course.id } })

  let lessonCount = 0
  for (let i = 0; i < CURRICULUM.length; i++) {
    const mod = CURRICULUM[i]
    const created = await prisma.module.create({
      data: {
        title: mod.title,
        order: i + 1,
        courseId: course.id,
        Lesson: {
          create: mod.lessons.map((lesson, j) => ({
            title: lesson.title,
            duration: Math.max(5, Math.round(lesson.duration * durationScale)),
            order: j + 1,
            kind: lesson.kind,
          })),
        },
      },
      include: { Lesson: true },
    })
    lessonCount += created.Lesson.length
  }

  console.log(`✓ Course: ${course.title}`)
  console.log(`  slug: /courses/${SLUG}`)
  console.log(`  modules: ${CURRICULUM.length}, lessons: ${lessonCount}`)
  console.log(`  duration: ${durationMin} min (~${Math.round(durationMin / 60)}h live)`)
  console.log(`  price: ₹${PRICE_CENTS / 100}`)
  console.log(`  mode: Live instructor-led`)
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
