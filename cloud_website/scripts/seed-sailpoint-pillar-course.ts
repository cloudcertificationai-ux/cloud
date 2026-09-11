/**
 * Upsert SailPoint Live Training as a flagship live (pillar) course.
 * Curriculum from Cloud Certification SailPoint Live / IdentityIQ outline.
 * Live instructor-led, 40+ hours, price INR 24,999.
 */
import { PrismaClient, LessonKind } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const SLUG = 'sailpoint-live-training'
const CATEGORY = { name: 'Enterprise Applications', slug: 'enterprise-applications' }
const MIN_LIVE_MINUTES = 40 * 60 // 40+ hours of live training
const PRICE_CENTS = 24999 * 100 // ₹24,999

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
    title: 'Lesson 01 — IAM & SailPoint IdentityIQ Overview',
    lessons: [
      T('What is Identity and Access Management (IAM)', 18),
      T('Why enterprises need Identity Governance (IGA)', 16),
      T('What is SailPoint IdentityIQ', 18),
      T('SailPoint modules: Compliance Manager and Lifecycle Manager', 20),
      T('Identity Cube overview', 16),
      T('SailPoint market trends and job roles', 14),
      T('Prerequisites: Java, MySQL, and IAM basics', 12),
    ],
  },
  {
    title: 'Lesson 02 — Architecture, Installation & Deployment',
    lessons: [
      T('IdentityIQ product architecture', 20),
      T('Framework relationships and core functionalities', 18),
      T('Supported databases and systems', 16),
      T('Installation of SailPoint IdentityIQ', 22),
      T('IdentityIQ virtual machine and lab setup', 18),
      T('iiq.properties, logging, and host configuration', 18),
      Lab('Live lab: Stand up an IdentityIQ lab instance', 55),
    ],
  },
  {
    title: 'Lesson 03 — IdentityIQ Settings & Configuration',
    lessons: [
      T('IdentityIQ Global Settings & Configuration', 20),
      T('System setup and the administrator console', 16),
      T('Notifications, work item policy, and UI preferences', 16),
      T('Audit configuration and syslog', 16),
      T('Email configuration and templates', 16),
      T('Extended attributes', 14),
    ],
  },
  {
    title: 'Lesson 04 — Login Configuration & Identity Mappings',
    lessons: [
      T('Login configuration and IdentityIQ login features', 18),
      T('Identity mappings', 20),
      T('Account mapping and attributes', 20),
      T('Workgroups and data collection', 16),
      Lab('Live lab: Configure login, identity mappings, and workgroups', 50),
    ],
  },
  {
    title: 'Lesson 05 — Lifecycle Manager & Setup',
    lessons: [
      T('Introduction to Lifecycle Manager', 18),
      T('Configuring Lifecycle Manager', 18),
      T('Key features of Lifecycle Manager', 16),
      T('Lifecycle configuration', 18),
      T('Full-text searching configuration', 16),
      T('Creating direct links to IdentityIQ', 16),
      T('Access request process', 18),
      Lab('Live lab: Enable LCM, quicklinks, and an access request path', 50),
    ],
  },
  {
    title: 'Lesson 06 — Application Onboarding',
    lessons: [
      T('What is an application in IdentityIQ', 16),
      T('Application configuration and editing', 18),
      T('Authoritative vs non-authoritative onboarding', 20),
      T('Active Directory and LDAP applications', 20),
      T('JDBC applications', 18),
      T('Logical and multiplex applications', 16),
      T('Okta and other connector patterns', 16),
      Lab('Live lab: Onboard an authoritative application and test connection', 55),
    ],
  },
  {
    title: 'Lesson 07 — Aggregation, Correlation & Identity Cubes',
    lessons: [
      T('Account and entitlement aggregation', 20),
      T('Correlation configuration', 18),
      T('Identity refresh and identity cubes', 18),
      T('Delta aggregation and partitioning overview', 16),
      Lab('Live lab: Aggregate, correlate, and inspect identity cubes', 50),
      Q('Foundations knowledge check — IAM, config, onboarding', 20),
    ],
  },
  {
    title: 'Lesson 08 — IdentityIQ Encryption',
    lessons: [
      T('Working with IdentityIQ encryption', 18),
      T('Keystore, master password, and iiq.dat', 18),
      T('Encrypted Data Synchronization task', 16),
      T('Re-encrypting passwords after a new key', 16),
      Lab('Live lab: Review encryption settings and keystore commands', 40),
    ],
  },
  {
    title: 'Lesson 09 — Provisioning & Password Management',
    lessons: [
      T('Provisioning policies and joiner / mover / leaver', 22),
      T('Connected vs manual fulfillment', 16),
      T('IdentityIQ application password management', 18),
      T('Password policies and retry / retry intervals', 16),
      Lab('Live lab: Provisioning policy and application password management', 50),
    ],
  },
  {
    title: 'Lesson 10 — Roles (RBAC) in IdentityIQ',
    lessons: [
      T('Role-based access control in IIQ', 18),
      T('Role types: organizational, business, and IT', 18),
      T('Role modeling and inheritance', 16),
      T('Birthright vs requested roles', 16),
      Lab('Live lab: Create business and IT roles', 45),
    ],
  },
  {
    title: 'Lesson 11 — Policies, SOD & Risk',
    lessons: [
      T('Policy types in IdentityIQ', 16),
      T('Separation of duties (SOD) policies', 20),
      T('Risk scores and policy violations', 16),
      T('Work items for policy violations', 14),
      Lab('Live lab: SOD policy and violation work item', 45),
    ],
  },
  {
    title: 'Lesson 12 — Certifications & Compliance',
    lessons: [
      T('Access certifications overview', 18),
      T('Manager, application owner, and targeted certifications', 20),
      T('Certification campaigns and decisions', 18),
      T('Compliance Manager overview', 16),
      Lab('Live lab: Run a manager certification campaign', 50),
      Q('Governance knowledge check — roles, policies, certifications', 20),
    ],
  },
  {
    title: 'Lesson 13 — Workflows, Workflow XML & Forms',
    lessons: [
      T('IdentityIQ workflows overview', 18),
      T('Workflow XML structure and steps', 20),
      T('Forms, approval steps, and work items', 18),
      T('LCM workflows: joiner, mover, leaver, and access request', 22),
      Lab('Live lab: Customize an LCM approval workflow and form', 55),
    ],
  },
  {
    title: 'Lesson 14 — IdentityIQ Console & Administration',
    lessons: [
      T('Launching the IdentityIQ console', 16),
      T('Command syntax and redirecting command output', 18),
      T('Import / export objects from console', 16),
      T('Tasks, requests, and the administrator console', 18),
      T('Groups and populations', 16),
      Lab('Live lab: Console commands, tasks, and populations', 50),
    ],
  },
  {
    title: 'Lesson 15 — Reporting',
    lessons: [
      T('Basics of IdentityIQ reporting', 16),
      T('Configuring standard reports', 16),
      T('My Reports tab and scheduling', 14),
      T('Custom report development overview', 18),
      Lab('Live lab: Configure and run a governance report', 40),
    ],
  },
  {
    title: 'Lesson 16 — Troubleshooting, Debugging & Capstone',
    lessons: [
      T('Logging options and Log4J', 16),
      T('Debugging page and best practices', 16),
      T('Common aggregation and provisioning failures', 18),
      Lab('Capstone live lab: Onboard app, LCM request, certification, and report', 90),
      Q('Final live assessment — SailPoint IdentityIQ', 30),
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
  console.log('Seeding SailPoint Live Training pillar course...\n')

  const category = await prisma.category.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name },
    create: CATEGORY,
  })

  const instructor = await prisma.instructor.upsert({
    where: { id: 'sailpoint-pillar-instructor' },
    update: {
      name: 'Rahul Iyer',
      bio: 'SailPoint IdentityIQ Solution Architect with 12+ years in IAM and identity governance. Delivers live IdentityIQ implementation batches covering onboarding, lifecycle, certifications, workflows, and production operations.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Iyer&background=0F766E&color=fff&size=256',
    },
    create: {
      id: 'sailpoint-pillar-instructor',
      name: 'Rahul Iyer',
      bio: 'SailPoint IdentityIQ Solution Architect with 12+ years in IAM and identity governance. Delivers live IdentityIQ implementation batches covering onboarding, lifecycle, certifications, workflows, and production operations.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Iyer&background=0F766E&color=fff&size=256',
    },
  })

  const courseData = {
    title: 'SailPoint Live Training',
    summary:
      'Live instructor-led SailPoint IdentityIQ program — 40+ hours covering IAM, application onboarding, lifecycle, certifications, workflows, console, and reporting for IdentityIQ-ready roles.',
    description:
      'This flagship SailPoint Live Training is 40+ hours of instructor-led IdentityIQ training (online, classroom, or one-to-one). You start with IAM and IdentityIQ architecture, stand up a lab instance, then master global settings, login configuration, identity mappings, and Lifecycle Manager. Live labs cover application onboarding (AD, LDAP, JDBC), aggregation and correlation, encryption, provisioning, password management, RBAC roles, SOD policies, certifications, workflows and forms, the IdentityIQ console, reporting, and troubleshooting. Enroll for the live session and get self-paced videos free, with recordings after every class, PDF materials, interview Q&A, resume support, and the latest SailPoint tool access. Designed for IT professionals targeting IdentityIQ Administrator, Engineer, and Implementer roles. Basic Java, MySQL, and access-management knowledge is recommended; prior IIQ experience is an advantage, not a requirement.',
    level: 'Beginner',
    durationMin,
    priceCents: PRICE_CENTS,
    rating: 4.6,
    published: true,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    language: 'English',
    currency: 'INR',
    categoryId: category.id,
    instructorId: instructor.id,
    learningOutcomes: [
      'Explain IAM, IGA, and how IdentityIQ Compliance Manager and Lifecycle Manager fit together',
      'Install and configure IdentityIQ, global settings, login, and identity mappings',
      'Onboard authoritative and non-authoritative applications and run aggregation and correlation',
      'Configure Lifecycle Manager, access requests, provisioning, and password management',
      'Model RBAC roles, SOD policies, risk, and access certification campaigns',
      'Customize workflows, forms, and work items for joiner / mover / leaver',
      'Operate the IdentityIQ console, tasks, groups, populations, and reports',
      'Troubleshoot logging, aggregation, and provisioning issues in a live lab',
    ],
    requirements: [
      'Basic knowledge of Java and MySQL',
      'Basic knowledge of Access Management',
      'Prior SailPoint IIQ or IAM tool experience is an added advantage',
      'Attend live online / classroom / one-to-one sessions (40+ hours)',
      'A computer with internet access for the IdentityIQ lab',
    ],
    courseFeatures: [
      'Live instructor-led training — 40+ hours',
      'Live session enrollment includes self-paced videos free',
      'Every session recorded and shared',
      'Latest SailPoint IdentityIQ tool access',
      'Premium PDF materials, interview Q&A, and resume building',
      'Real-time assignments and case studies',
      'Lifetime access to video library and materials',
      '24x7 support team',
    ],
    handsOnProjects: [
      {
        title: 'IdentityIQ lab installation',
        description: 'Live: install IdentityIQ, configure host settings, and verify the administrator console.',
        skills: ['Installation', 'iiq.properties', 'Admin console'],
        duration: '1 live session',
      },
      {
        title: 'Application onboarding and identity cubes',
        description: 'Live: onboard an authoritative application, aggregate accounts, and correlate identity cubes.',
        skills: ['Connectors', 'Aggregation', 'Correlation'],
        duration: '1 live session',
      },
      {
        title: 'Lifecycle access request with approval',
        description: 'Live: enable LCM, configure a provisioning policy, and complete an approved access request.',
        skills: ['Lifecycle Manager', 'Provisioning', 'Workflows'],
        duration: '1 live session',
      },
      {
        title: 'Certification and reporting capstone',
        description: 'Live capstone: roles, SOD policy, manager certification campaign, and a governance report.',
        skills: ['RBAC', 'Certifications', 'Reporting'],
        duration: '2 live sessions',
      },
    ],
    caseStudies: [
      {
        title: 'Enterprise joiner-mover-leaver',
        description: 'How a shared-services IAM team automates hire, transfer, and termination with IdentityIQ LCM.',
      },
      {
        title: 'Access certification for audit',
        description: 'Run manager certifications and SOD evidence so audit can sign off on identity governance.',
      },
    ],
    certifications: [
      {
        title: 'SailPoint Certified IdentityIQ Associate',
        issuer: 'SailPoint',
        description: 'Live modules map to Associate topics: IdentityIQ introduction, implementation, and administration essentials.',
      },
      {
        title: 'SailPoint Certified IdentityIQ Professional',
        issuer: 'SailPoint',
        description: 'Advanced labs map to Professional topics: onboarding, lifecycle, certifications, workflows, and operations.',
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
