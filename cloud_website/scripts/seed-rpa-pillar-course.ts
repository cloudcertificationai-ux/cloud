/**
 * Upsert Robotic Process Automation Training as a flagship live (pillar) course.
 * Curriculum from Cloud Certification RPA outline (UiPath, Blue Prism, Automation Anywhere).
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

const SLUG = 'robotic-process-automation'
const CATEGORY = { name: 'Software Engineering', slug: 'software-engineering' }
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
    title: 'Lesson 01 — RPA Concepts & Installation',
    lessons: [
      T('Introduction to Robotic Process Automation', 18),
      T('RPA working principles and bot vs human tasks', 16),
      T('RPA growth trends and industry use cases', 16),
      T('Different RPA tools: UiPath, Blue Prism, Automation Anywhere', 18),
      T('Install UiPath Community Edition', 18),
      Lab('Live lab: Install UiPath Studio and create the first project', 50),
    ],
  },
  {
    title: 'Lesson 02 — Getting Started with UiPath Automation',
    lessons: [
      T('Overview of UiPath Studio, Robot, and Orchestrator', 18),
      T('Types of projects', 14),
      T('Sequence and flowchart', 18),
      T('State machine', 16),
      T('Data variables and scope', 16),
      Lab('Live lab: Sequence vs flowchart vs state machine', 50),
    ],
  },
  {
    title: 'Lesson 03 — UI Automation & System Activities',
    lessons: [
      T('Demonstration of UI automation', 18),
      T('System activities', 16),
      T('Different control flow', 16),
      T('Selectors and UI Explorer basics', 18),
      Lab('Live lab: Automate a desktop and a web application', 55),
    ],
  },
  {
    title: 'Lesson 04 — User Events, Recorder & Scraping',
    lessons: [
      T('Understand user events', 16),
      T('Recorder and different types of recording', 18),
      T('Perform scraping (screen and data)', 18),
      T('Excel and PDF automation overview', 16),
      Lab('Live lab: Record, scrape, and write to Excel', 55),
      Q('UiPath foundations knowledge check', 20),
    ],
  },
  {
    title: 'Lesson 05 — UiPath Orchestrator & Robots',
    lessons: [
      T('Attended vs unattended robots', 16),
      T('Publishing packages and queues', 18),
      T('Scheduling and monitoring in Orchestrator', 16),
      T('Exception handling and logging best practices', 16),
      Lab('Live lab: Publish a process and run it from Orchestrator', 50),
    ],
  },
  {
    title: 'Lesson 06 — Introduction to Blue Prism',
    lessons: [
      T('Overview of Blue Prism and the virtual workforce', 18),
      T('Overview of Process Studio', 16),
      T('Different kinds of process flow', 16),
      T('Inputs and outputs scope', 16),
      T('Data items as inputs', 14),
      Lab('Live lab: Build a simple Process Studio flow', 50),
    ],
  },
  {
    title: 'Lesson 07 — Blue Prism Business Object Studio',
    lessons: [
      T('Business objects', 16),
      T('Creating a business object', 16),
      T('Action stage', 16),
      T('Action inputs and outputs', 16),
      T('Read, terminate, attach and detach', 18),
      Lab('Live lab: Object Studio action with inputs and outputs', 50),
    ],
  },
  {
    title: 'Lesson 08 — Blue Prism Application Modeller',
    lessons: [
      T('Application Modeller overview', 16),
      T('Spying elements', 18),
      T('Attribute selection', 16),
      T('Windows, browser, and Java interfaces', 16),
      T('Multi-bot architecture and enterprise deployment overview', 16),
      Lab('Live lab: Spy an application and read a field', 55),
      Q('Blue Prism knowledge check', 20),
    ],
  },
  {
    title: 'Lesson 09 — Automation Anywhere Overview',
    lessons: [
      T('Overview of workflow and life cycle in Automation Anywhere', 18),
      T('Types of recorder', 16),
      T('Excel automation', 16),
      T('When to choose UiPath vs Blue Prism vs Automation Anywhere', 16),
      Lab('Live lab: Recorder and Excel automation walkthrough', 45),
    ],
  },
  {
    title: 'Lesson 10 — Real-time Project & Capstone',
    lessons: [
      T('Industrial best practices for RPA delivery', 16),
      T('Process assessment and bot design checklist', 16),
      T('Exception handling, credentials, and production readiness', 16),
      Lab('Capstone live lab: End-to-end bot — scrape, Excel, and control-room run', 90),
      Q('Final live assessment — Robotic Process Automation', 30),
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
  console.log('Seeding Robotic Process Automation pillar course...\n')

  const category = await prisma.category.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name },
    create: CATEGORY,
  })

  const instructor = await prisma.instructor.upsert({
    where: { id: 'rpa-pillar-instructor' },
    update: {
      name: 'Karan Desai',
      bio: 'RPA Solution Architect with 10+ years in UiPath, Blue Prism, and Automation Anywhere. Delivers live batches covering Studio, Object Studio, Orchestrator, and production bot deployments.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Karan+Desai&background=4F46E5&color=fff&size=256',
    },
    create: {
      id: 'rpa-pillar-instructor',
      name: 'Karan Desai',
      bio: 'RPA Solution Architect with 10+ years in UiPath, Blue Prism, and Automation Anywhere. Delivers live batches covering Studio, Object Studio, Orchestrator, and production bot deployments.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Karan+Desai&background=4F46E5&color=fff&size=256',
    },
  })

  const courseData = {
    title: 'Robotic Process Automation Training',
    summary:
      'Live instructor-led RPA program — 40+ hours covering UiPath, Blue Prism, and Automation Anywhere, from installation and recorders to Orchestrator, Object Studio, and a real-time project.',
    description:
      'This flagship Robotic Process Automation Training is 40+ hours of instructor-led training (online, classroom, or one-to-one). You start with RPA principles, market tools, and UiPath Community Edition setup, then build sequences, flowcharts, and state machines. Live labs cover UI automation, system activities, recorders, scraping, Excel, Orchestrator, and robots. The Blue Prism track includes Process Studio, Business Objects, Application Modeller, spying, attach/detach, and multi-bot deployment. You also get an Automation Anywhere overview (recorders and Excel) plus a capstone project that mirrors a real back-office process. Enroll for the live session and get self-paced videos free, with the latest RPA tools for practice, recordings, PDF materials, interview Q&A, and 24x7 support. Designed for graduates and IT professionals targeting RPA Developer, Bot Developer, and Automation Engineer roles. No prior RPA experience required.',
    level: 'Beginner',
    durationMin,
    priceCents: PRICE_CENTS,
    rating: 4.6,
    published: true,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    language: 'English',
    currency: 'INR',
    categoryId: category.id,
    instructorId: instructor.id,
    learningOutcomes: [
      'Explain RPA principles, growth trends, and when to use UiPath, Blue Prism, or Automation Anywhere',
      'Install UiPath Community Edition and build sequence, flowchart, and state-machine projects',
      'Automate UI and system activities with variables, control flow, and selectors',
      'Use recorders, user events, and scraping for Excel and web data',
      'Publish and run attended/unattended robots from Orchestrator',
      'Design Blue Prism processes, business objects, and Application Modeller spy models',
      'Apply Automation Anywhere recorders and Excel automation patterns',
      'Deliver a real-time capstone bot with exception handling and production practices',
    ],
    requirements: [
      'No prior RPA experience required',
      'Basic computer literacy; programming is helpful but not mandatory',
      'Attend live online / classroom / one-to-one sessions (40+ hours)',
      'A Windows computer with internet access to install UiPath Community Edition',
    ],
    courseFeatures: [
      'Live instructor-led training — 40+ hours',
      'Live session enrollment includes self-paced videos free',
      'Latest RPA tools provided for practice',
      'Every session recorded and shared',
      'Premium PDF materials, interview Q&A, and resume building',
      'Real-time assignments and case studies',
      'Lifetime access to video library and materials',
      '24x7 support team',
    ],
    handsOnProjects: [
      {
        title: 'UiPath first bot',
        description: 'Live: install Community Edition and automate a sequence that reads Excel and types into a form.',
        skills: ['UiPath Studio', 'Excel', 'UI Automation'],
        duration: '1 live session',
      },
      {
        title: 'Recorder and scraping',
        description: 'Live: record a web flow, scrape a data table, and write results to Excel.',
        skills: ['Recorder', 'Scraping', 'Selectors'],
        duration: '1 live session',
      },
      {
        title: 'Blue Prism object and process',
        description: 'Live: spy an application, build a business object, and call it from Process Studio.',
        skills: ['Process Studio', 'Object Studio', 'Application Modeller'],
        duration: '1 live session',
      },
      {
        title: 'Production-style capstone',
        description: 'Live capstone: end-to-end bot with queues/control room, exception handling, and a runbook.',
        skills: ['Orchestrator', 'Exception handling', 'Deployment'],
        duration: '2 live sessions',
      },
    ],
    caseStudies: [
      {
        title: 'Back-office invoice processing',
        description: 'How a shared-services team uses UiPath to scrape invoices, update Excel, and post to an ERP screen.',
      },
      {
        title: 'Multi-bot Blue Prism operations',
        description: 'Object Studio reuse and control-room scheduling for a high-volume, rule-based process.',
      },
    ],
    certifications: [
      {
        title: 'UiPath Certified Professional pathway',
        issuer: 'UiPath / Cloud Certification',
        description: 'Studio, Robot, Orchestrator, recorders, and scraping map to Associate / Developer exam topics.',
      },
      {
        title: 'Blue Prism Developer pathway',
        issuer: 'SS&C Blue Prism / Cloud Certification',
        description: 'Process Studio, Object Studio, and Application Modeller map to Blue Prism developer interview and exam topics.',
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
