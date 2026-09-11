/**
 * Seed legacy Cloud Certification training URLs as live courses + blog guides.
 */
import { PrismaClient, LessonKind } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

type LessonSeed = { title: string; duration: number; kind: LessonKind }
type ModuleSeed = { title: string; lessons: LessonSeed[] }

function T(title: string, duration = 16): LessonSeed {
  return { title, duration, kind: 'VIDEO' }
}
function Lab(title: string, duration = 50): LessonSeed {
  return { title, duration, kind: 'ASSIGNMENT' }
}
function Q(title: string, duration = 20): LessonSeed {
  return { title, duration, kind: 'QUIZ' }
}

async function seedCurriculum(courseId: string, curriculum: ModuleSeed[], liveMinutes: number) {
  const lessonMinutes = curriculum.reduce(
    (sum, mod) => sum + mod.lessons.reduce((s, l) => s + l.duration, 0),
    0
  )
  const scale = liveMinutes / lessonMinutes
  await prisma.module.deleteMany({ where: { courseId } })
  let lessonCount = 0
  for (let i = 0; i < curriculum.length; i++) {
    const mod = curriculum[i]
    const created = await prisma.module.create({
      data: {
        title: mod.title,
        order: i + 1,
        courseId,
        Lesson: {
          create: mod.lessons.map((lesson, j) => ({
            title: lesson.title,
            duration: Math.max(5, Math.round(lesson.duration * scale)),
            order: j + 1,
            kind: lesson.kind,
          })),
        },
      },
      include: { Lesson: true },
    })
    lessonCount += created.Lesson.length
  }
  return lessonCount
}

async function upsertCategory(name: string, slug: string) {
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  })
}

const UIPATH_CURRICULUM: ModuleSeed[] = [
  {
    title: 'Lesson 01 — RPA Concepts & UiPath Install',
    lessons: [
      T('Introduction to RPA'),
      T('RPA growth trends'),
      T('Different RPA tools'),
      T('Install UiPath Community Edition'),
      Lab('Live lab: Install Studio and create the first project'),
    ],
  },
  {
    title: 'Lesson 02 — UiPath Studio Projects',
    lessons: [
      T('Overview of UiPath Studio, Robot, and Orchestrator'),
      T('Types of projects'),
      T('Sequence and flowchart'),
      T('State machine'),
      Lab('Live lab: Sequence vs flowchart vs state machine'),
    ],
  },
  {
    title: 'Lesson 03 — UI Automation & System Activities',
    lessons: [
      T('Demonstration of UI automation'),
      T('System activities'),
      T('Variables, arguments, and control flow'),
      T('Selectors and UI Explorer'),
      Lab('Live lab: Automate a desktop and a web app'),
    ],
  },
  {
    title: 'Lesson 04 — Recorder, User Events & Scraping',
    lessons: [
      T('Understand user events'),
      T('Recorder and types of recording'),
      T('Screen and data scraping'),
      T('Excel, PDF, Outlook, and SAP compatibility'),
      Lab('Live lab: Record, scrape, and write to Excel'),
      Q('UiPath foundations knowledge check'),
    ],
  },
  {
    title: 'Lesson 05 — Orchestrator, Robots & Capstone',
    lessons: [
      T('Attended vs unattended robots'),
      T('Publishing, queues, scheduling, and monitoring'),
      T('Exception handling, debugging, and AI Center overview'),
      Lab('Capstone live lab: Publish a process and run from Orchestrator', 90),
      Q('Final live assessment — UiPath'),
    ],
  },
]

const BLUEPRISM_CURRICULUM: ModuleSeed[] = [
  {
    title: 'Lesson 01 — RPA & Blue Prism Overview',
    lessons: [
      T('RPA working principles and virtual workforce'),
      T('Blue Prism architecture and control room'),
      T('Overview of workflow vs UiPath and Automation Anywhere'),
      Lab('Live lab: Navigate Blue Prism and create a process'),
    ],
  },
  {
    title: 'Lesson 02 — Process Studio',
    lessons: [
      T('Overview of Process Studio'),
      T('Different kinds of process flow'),
      T('Inputs and outputs scope'),
      T('Data items as inputs'),
      Lab('Live lab: Build a Process Studio flow with inputs/outputs'),
    ],
  },
  {
    title: 'Lesson 03 — Business Object Studio',
    lessons: [
      T('Business objects'),
      T('Creating a business object'),
      T('Action stage, inputs, and outputs'),
      T('Read, terminate, attach and detach'),
      Lab('Live lab: Object Studio action with inputs and outputs'),
    ],
  },
  {
    title: 'Lesson 04 — Application Modeller',
    lessons: [
      T('Application Modeller'),
      T('Spying elements and attribute selection'),
      T('Windows, browser, mainframe, and Java interfaces'),
      Lab('Live lab: Spy an application and read a field'),
      Q('Object Studio knowledge check'),
    ],
  },
  {
    title: 'Lesson 05 — Multi-bot Deployment & Capstone',
    lessons: [
      T('Control room, queues, and scheduling'),
      T('Multi-bot architecture and enterprise deployment'),
      T('Exception handling and production runbooks'),
      Lab('Capstone live lab: Process + object + control-room run', 90),
      Q('Final live assessment — Blue Prism'),
    ],
  },
]

const MULESOFT_CURRICULUM: ModuleSeed[] = [
  {
    title: 'Lesson 01 — Anypoint Platform & ESB',
    lessons: [
      T('What is MuleSoft and Anypoint Platform'),
      T('API-led connectivity and ESB concepts'),
      T('Anypoint Studio overview'),
      Lab('Live lab: Install Studio and run Hello Mule'),
    ],
  },
  {
    title: 'Lesson 02 — Mule Applications & Flows',
    lessons: [
      T('Mule applications, flows, and sub-flows'),
      T('Connectors: HTTP, Database, File, Salesforce'),
      T('Anypoint Connector DevKit overview'),
      Lab('Live lab: HTTP listener to database connector'),
    ],
  },
  {
    title: 'Lesson 03 — DataWeave & Transformations',
    lessons: [
      T('DataWeave basics'),
      T('JSON, XML, and CSV transformations'),
      T('Error handling and scopes'),
      Lab('Live lab: Transform and enrich a payload'),
    ],
  },
  {
    title: 'Lesson 04 — RAML & API Design',
    lessons: [
      T('Design APIs with RAML'),
      T('API Manager and Anypoint Exchange'),
      T('Security: client ID, OAuth, and policies'),
      Lab('Live lab: Design, publish, and implement a RAML API'),
      Q('Anypoint foundations knowledge check'),
    ],
  },
  {
    title: 'Lesson 05 — CloudHub, CI & Capstone',
    lessons: [
      T('Deploy to CloudHub and Runtime Manager'),
      T('Logging, monitoring, and CloudHub workers'),
      T('MuleSoft Certified Developer exam map'),
      Lab('Capstone live lab: API + connector + CloudHub deploy', 90),
      Q('Final live assessment — MuleSoft'),
    ],
  },
]

const MASTER_WORKDAY_CURRICULUM: ModuleSeed[] = [
  {
    title: 'Course 1 — Workday HCM',
    lessons: [
      T('Workday HCM framework and navigation'),
      T('Organizations, staffing models, jobs, and positions'),
      T('Compensation, security, and business processes'),
      Lab('Live lab: Supervisory org, hire BP, and security'),
    ],
  },
  {
    title: 'Course 2 — Workday Integration',
    lessons: [
      T('Integration Cloud Platform and web services'),
      T('EIB, Core Connector Worker, and document transformation'),
      T('Workday Studio overview'),
      Lab('Live lab: Core Connector Worker and launch integration'),
    ],
  },
  {
    title: 'Course 3 — Workday Finance',
    lessons: [
      T('Workday Financial Management overview'),
      T('Record to report and related financial processes'),
      Lab('Live lab: Finance navigation and a sample report'),
    ],
  },
  {
    title: 'Course 4 — Workday Payroll',
    lessons: [
      T('Payroll configuration overview'),
      T('Payroll calculations and integrations'),
      Lab('Live lab: Payroll calendar and a sample result'),
    ],
  },
  {
    title: 'Course 5 — Reporting & Calculated Fields',
    lessons: [
      T('Standard vs custom reports'),
      T('Calculated fields: ESI, EMI, and report-specific fields'),
      Lab('Live lab: Advanced report with calculated fields'),
    ],
  },
  {
    title: 'Course 6 — HCM Transactions & Capstone',
    lessons: [
      T('Hire, transfer, terminate, and delegation'),
      T('iLoads and implementation tasks'),
      Lab('Capstone live lab: Hire-to-terminate with report evidence', 90),
      Q('Final live assessment — Workday Master'),
    ],
  },
]

async function main() {
  console.log('Seeding legacy training URLs...\n')

  const software = await upsertCategory('Software Engineering', 'software-engineering')
  const enterprise = await upsertCategory('Enterprise Applications', 'enterprise-applications')

  const uipathInstructor = await prisma.instructor.upsert({
    where: { id: 'uipath-pillar-instructor' },
    update: {
      name: 'Ananya Rao',
      bio: 'UiPath Certified Developer with 9+ years in RPA. Delivers live Studio, Orchestrator, recorder, and scraping batches.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Ananya+Rao&background=FA4616&color=fff&size=256',
    },
    create: {
      id: 'uipath-pillar-instructor',
      name: 'Ananya Rao',
      bio: 'UiPath Certified Developer with 9+ years in RPA. Delivers live Studio, Orchestrator, recorder, and scraping batches.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Ananya+Rao&background=FA4616&color=fff&size=256',
    },
  })

  const bpInstructor = await prisma.instructor.upsert({
    where: { id: 'blueprism-pillar-instructor' },
    update: {
      name: 'Vikram Shah',
      bio: 'Blue Prism developer and control-room lead with 10+ years in enterprise RPA deployments.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Vikram+Shah&background=003DA5&color=fff&size=256',
    },
    create: {
      id: 'blueprism-pillar-instructor',
      name: 'Vikram Shah',
      bio: 'Blue Prism developer and control-room lead with 10+ years in enterprise RPA deployments.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Vikram+Shah&background=003DA5&color=fff&size=256',
    },
  })

  const workdayInstructor = await prisma.instructor.upsert({
    where: { id: 'workday-pillar-instructor' },
    update: {},
    create: {
      id: 'workday-pillar-instructor',
      name: 'Sneha Menon',
      bio: 'Workday HCM Solution Architect with 11+ years in HRIS and enterprise HCM.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Sneha+Menon&background=F59E0B&color=fff&size=256',
    },
  })

  const muleInstructor = await prisma.instructor.upsert({
    where: { id: 'mulesoft-pillar-instructor' },
    update: {
      name: 'Nisha Patel',
      bio: 'MuleSoft Certified Developer and Architect with 11+ years in Anypoint Platform, RAML, and CloudHub.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Nisha+Patel&background=00A0DF&color=fff&size=256',
    },
    create: {
      id: 'mulesoft-pillar-instructor',
      name: 'Nisha Patel',
      bio: 'MuleSoft Certified Developer and Architect with 11+ years in Anypoint Platform, RAML, and CloudHub.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Nisha+Patel&background=00A0DF&color=fff&size=256',
    },
  })

  const liveFeatures = [
    'Live instructor-led training — 40+ hours',
    'Live session enrollment includes self-paced videos free',
    'Every session recorded and shared',
    'Premium PDF materials and interview Q&A',
    'Real-time assignments and case studies',
    'Lifetime access to video library and materials',
    '24x7 support team',
  ]

  const courses = [
    {
      slug: 'uipath-training-online',
      instructorId: uipathInstructor.id,
      categoryId: software.id,
      curriculum: UIPATH_CURRICULUM,
      data: {
        title: 'UiPath Training Online',
        summary:
          'Live instructor-led UiPath program — 40+ hours covering Studio, sequences, recorders, scraping, Orchestrator, and a production-style bot.',
        description:
          'This UiPath Training Online is 40+ hours of instructor-led RPA training. You install Community Edition, build sequences, flowcharts, and state machines, then automate UI and system activities with selectors. Live labs cover recorders, user events, scraping, Excel/PDF, Orchestrator queues, and attended vs unattended robots. Designed for graduates and IT professionals targeting UiPath Developer roles. No prior RPA experience required.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
        learningOutcomes: [
          'Install UiPath Community Edition and explain Studio, Robot, and Orchestrator',
          'Build sequence, flowchart, and state-machine projects',
          'Automate UI and system activities with selectors',
          'Use recorders, scraping, Excel, and PDF activities',
          'Publish and schedule attended/unattended robots',
        ],
        requirements: [
          'No prior RPA experience required',
          'A Windows computer to install UiPath Community Edition',
          'Attend live sessions (40+ hours)',
        ],
        courseFeatures: [...liveFeatures, 'Latest UiPath tool provided for practice'],
        handsOnProjects: [
          {
            title: 'First UiPath bot',
            description: 'Live: Excel-to-form automation in Studio.',
            skills: ['Studio', 'Excel', 'UI Automation'],
            duration: '1 live session',
          },
          {
            title: 'Orchestrator publish',
            description: 'Live: package, queue, and run an unattended job.',
            skills: ['Orchestrator', 'Queues'],
            duration: '1 live session',
          },
        ],
        caseStudies: [
          {
            title: 'Invoice scraping',
            description: 'Shared-services team scrapes invoices and writes to Excel with UiPath.',
          },
        ],
        certifications: [
          {
            title: 'UiPath Certified Professional pathway',
            issuer: 'UiPath / Cloud Certification',
            description: 'Studio, Robot, and Orchestrator map to Associate / Developer exam topics.',
          },
        ],
      },
    },
    {
      slug: 'blue-prism-training-online',
      instructorId: bpInstructor.id,
      categoryId: software.id,
      curriculum: BLUEPRISM_CURRICULUM,
      data: {
        title: 'Blue Prism Training Online',
        summary:
          'Live instructor-led Blue Prism program — 40+ hours with Process Studio, Object Studio, Application Modeller, control room, and two months of tool access.',
        description:
          'This Blue Prism Training Online is 40+ hours of instructor-led RPA training with tool access for practice. You learn Process Studio flows, business objects, Application Modeller spy models, attach/detach, and multi-bot control-room deployment. Live labs mirror enterprise back-office processes. Designed for IT and operations professionals targeting Blue Prism Developer roles.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
        learningOutcomes: [
          'Explain Blue Prism architecture and the virtual workforce',
          'Build Process Studio flows with inputs and outputs',
          'Create business objects and action stages',
          'Spy applications with Application Modeller',
          'Schedule multi-bot work from the control room',
        ],
        requirements: [
          'Basic programming is helpful, not mandatory',
          'Attend live sessions (40+ hours)',
          'A computer with internet access for the Blue Prism lab',
        ],
        courseFeatures: [...liveFeatures, 'Two months Blue Prism tool / tenant-style access'],
        handsOnProjects: [
          {
            title: 'Process Studio flow',
            description: 'Live: inputs, outputs, and a decision stage.',
            skills: ['Process Studio'],
            duration: '1 live session',
          },
          {
            title: 'Spy and read',
            description: 'Live: Application Modeller spy plus Object Studio read.',
            skills: ['Application Modeller', 'Object Studio'],
            duration: '1 live session',
          },
        ],
        caseStudies: [
          {
            title: 'Multi-bot operations',
            description: 'Control-room scheduling for a high-volume rule-based process.',
          },
        ],
        certifications: [
          {
            title: 'Blue Prism Developer pathway',
            issuer: 'SS&C Blue Prism / Cloud Certification',
            description: 'Process Studio, Object Studio, and Application Modeller map to developer exam topics.',
          },
        ],
      },
    },
    {
      slug: 'mulesoft-training',
      instructorId: muleInstructor.id,
      categoryId: software.id,
      curriculum: MULESOFT_CURRICULUM,
      data: {
        title: 'MuleSoft Training',
        summary:
          'Live instructor-led MuleSoft program — 40+ hours covering Anypoint Studio, connectors, DataWeave, RAML, API Manager, and CloudHub.',
        description:
          'This MuleSoft Training is 40+ hours of instructor-led integration training. You start with Anypoint Platform and API-led connectivity, then build Mule apps in Studio with HTTP, Database, and Salesforce connectors. Live labs cover DataWeave, RAML API design, policies, and CloudHub deployment. Designed for developers targeting MuleSoft Certified Developer roles. Basic Java familiarity is helpful.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        learningOutcomes: [
          'Explain Anypoint Platform and API-led connectivity',
          'Build Mule apps with connectors in Anypoint Studio',
          'Transform payloads with DataWeave',
          'Design and implement RAML APIs',
          'Deploy and monitor apps on CloudHub',
        ],
        requirements: [
          'Basic Java or integration knowledge is helpful',
          'Attend live sessions (40+ hours)',
          'A computer with internet access for Anypoint Studio',
        ],
        courseFeatures: [...liveFeatures, 'Anypoint Studio labs and certification assistance'],
        handsOnProjects: [
          {
            title: 'HTTP to database flow',
            description: 'Live: listener, connector, and error handling.',
            skills: ['Studio', 'Connectors'],
            duration: '1 live session',
          },
          {
            title: 'RAML to CloudHub',
            description: 'Live: design an API and deploy to CloudHub.',
            skills: ['RAML', 'CloudHub'],
            duration: '1 live session',
          },
        ],
        caseStudies: [
          {
            title: 'Salesforce + ERP integration',
            description: 'API-led connectivity between CRM and a backend system on CloudHub.',
          },
        ],
        certifications: [
          {
            title: 'MuleSoft Certified Developer — Level 1',
            issuer: 'Salesforce MuleSoft / Cloud Certification',
            description: 'Studio, DataWeave, RAML, and CloudHub map to MCD Level 1 topics.',
          },
        ],
      },
    },
    {
      slug: 'master-workday-training',
      instructorId: workdayInstructor.id,
      categoryId: enterprise.id,
      curriculum: MASTER_WORKDAY_CURRICULUM,
      data: {
        title: 'Master Workday Training',
        summary:
          'Workday Master Certification program — live HCM, Integration, Finance, Payroll, reporting, and HCM transactions with tenant labs (US / UK / product landing).',
        description:
          'The Workday Master Certification program is designed to make you an expert across Workday HCM, Integration (EIB, Core Connectors, Studio), Finance, Payroll, reporting and calculated fields, and HCM transactions. Instructor-led live training plus self-paced videos, projects, and tenant access. Official Workday certification is employer-sponsored; we prepare you for partner hiring in the US, UK, and globally.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        learningOutcomes: [
          'Configure Core HCM: orgs, staffing, jobs, compensation, security, and business processes',
          'Build EIB and Core Connector Worker integrations and launch them',
          'Navigate Finance and Payroll modules',
          'Create custom reports and calculated fields',
          'Complete hire-to-terminate transactions with iLoads',
        ],
        requirements: [
          'HRMS or PeopleSoft background is helpful',
          'Attend live instructor-led sessions',
          'A computer with internet access for tenant labs',
        ],
        courseFeatures: [
          'Live instructor-led training — 40+ hours',
          'Workday HCM, Integration, Finance, Payroll, Reporting, Transactions',
          'Tenant access for labs',
          '7-day free trial path (no credit card on the marketing landing)',
          'Job assistance, resume, and interview prep',
          'Lifetime access to video library and materials',
        ],
        handsOnProjects: [
          {
            title: 'HCM configuration sprint',
            description: 'Live: org, staffing, security, and hire BP.',
            skills: ['HCM', 'Security', 'Business Process'],
            duration: '2 live sessions',
          },
          {
            title: 'Core Connector Worker',
            description: 'Live: field overrides, maps, and launch.',
            skills: ['Integrations', 'Core Connectors'],
            duration: '1 live session',
          },
        ],
        caseStudies: [
          {
            title: 'Global master rollout',
            description: 'How US and UK shared-services teams combine HCM, integrations, and reporting.',
          },
        ],
        certifications: [
          {
            title: 'Workday Master Certification pathway',
            issuer: 'Workday / Cloud Certification',
            description: 'Maps to HCM, Integration, Finance, Payroll, and reporting interview tracks. Official certs are partner-sponsored.',
          },
        ],
      },
    },
  ]

  for (const item of courses) {
    const durationMin = 40 * 60
    const courseData = {
      ...item.data,
      level: 'Beginner',
      durationMin,
      priceCents: item.slug === 'master-workday-training' ? 59900 * 100 : 24999 * 100,
      rating: 4.6,
      published: true,
      featured: true,
      language: 'English',
      currency: 'INR',
      categoryId: item.categoryId,
      instructorId: item.instructorId,
    }

    const course = await prisma.course.upsert({
      where: { slug: item.slug },
      update: courseData,
      create: { slug: item.slug, ...courseData },
    })
    const lessons = await seedCurriculum(course.id, item.curriculum, durationMin)
    console.log(`✓ ${course.title}  /courses/${item.slug}  modules=${item.curriculum.length} lessons=${lessons}`)
  }

  let author = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!author) {
    author = await prisma.user.create({
      data: {
        email: 'content@cloudcertification.io',
        name: 'Cloud Certification',
        role: 'ADMIN',
      },
    })
  }

  const posts = [
    {
      slug: 'different-rpa-vendors',
      title: 'Why Get Certified With Different RPA Vendors',
      excerpt:
        'Compare OpenSpan, WorkFusion, UiPath, Automation Anywhere, and Blue Prism — and why multi-vendor RPA skills help your career.',
      tags: ['RPA', 'UiPath', 'Blue Prism', 'Automation Anywhere'],
      content: `
<p>Robotic process automation lets software robots drive digital tasks so people can focus on complex work. Several vendors grew from early 2000s libraries into the platforms enterprises hire for today.</p>
<h2>Blue Prism</h2>
<p>Blue Prism is a virtual workforce powered by software robots. It uses a visual designer, strong control-room operations, and is built for high availability and failover in large enterprises.</p>
<h2>UiPath</h2>
<p>UiPath is web/desktop oriented with a visual workflow designer. Teams can automate with little programming using flowcharts, recorders, and Orchestrator.</p>
<h2>Automation Anywhere</h2>
<p>Automation Anywhere sits between coded and no-code styles. Recorders and Excel automation make it popular with freshers and citizen developers.</p>
<h2>OpenSpan and WorkFusion</h2>
<p>OpenSpan and WorkFusion round out the vendor landscape with desktop integration and AI-assisted workforce automation.</p>
<p>Ready to train? See our <a href="/courses/robotic-process-automation">RPA</a>, <a href="/courses/uipath-training-online">UiPath</a>, and <a href="/courses/blue-prism-training-online">Blue Prism</a> live programs.</p>
`,
    },
    {
      slug: 'blueprism-vs-automation-anywhere',
      title: 'Blue Prism vs Automation Anywhere',
      excerpt:
        'Architecture, coding need, and who should pick Blue Prism, Automation Anywhere, or UiPath.',
      tags: ['RPA', 'Blue Prism', 'Automation Anywhere', 'UiPath'],
      content: `
<p>UiPath, Blue Prism, and Automation Anywhere dominate the RPA market. The right tool depends on architecture, coding skill, and how you operate bots in production.</p>
<h2>Architecture</h2>
<p>Blue Prism and Automation Anywhere are typically server-based. UiPath is often described as a web-based architecture with Studio plus Orchestrator.</p>
<h2>Coding</h2>
<p>UiPath is designed for users with or without coding skills. Blue Prism needs a basis of programming to manage business objects. Automation Anywhere needs a little coding to use some activities, and is easier for freshers than Blue Prism.</p>
<h2>Speed of build</h2>
<p>UiPath’s visual design is faster for many desktop/web automations. Blue Prism is strong when IT and operations share object libraries and control-room scheduling.</p>
<p>Train on both stacks in our <a href="/courses/blue-prism-training-online">Blue Prism</a> and <a href="/courses/robotic-process-automation">RPA</a> live courses.</p>
`,
    },
    {
      slug: 'guide-to-best-workday-certification',
      title: 'A Comprehensive Guide to Best Workday Certification',
      excerpt:
        'How official Workday certification works (partner-sponsored) and how Cloud Certification training prepares you for HCM roles.',
      tags: ['Workday', 'Certification', 'HCM'],
      content: `
<p>Workday has a certifications program that tests skills on Workday products. Completing it lets you designate yourself as certified — but the path is not a public exam you buy yourself.</p>
<h2>Who can get certified</h2>
<ul>
<li>You get certified by being an employee of Workday or a Workday partner organization.</li>
<li>Most partners require certification as a condition of employment.</li>
<li>Workday or the partner pays for training, not the worker.</li>
<li>New consultants typically attend Core HCM boot camp in the first month.</li>
<li>Customer certifications branded Workday Pro are for employees of Workday customers, not independent contractors.</li>
</ul>
<p>We offer live <a href="/courses/workday-software-training">Workday Software Training</a> and the <a href="/courses/master-workday-training">Master Workday</a> program so you can interview-ready for partner hiring in the US, UK, and globally.</p>
`,
    },
    {
      slug: 'free-workday-training-in-australia',
      title: 'Free Workday Training in Australia',
      excerpt:
        'Start a free Workday trial path in Australia — HCM, Payroll, Finance, Integration, and Master program with tenant labs.',
      tags: ['Workday', 'Australia', 'Free Training'],
      content: `
<p>Grow your Workday career in Australia with no prerequisites. Official Workday certification is still partner-sponsored, but you can train with Cloud Certification first.</p>
<h2>What’s included</h2>
<ul>
<li>Free 7-day trial path (no credit card required on the marketing landing)</li>
<li>Workday HCM, Payroll, Finance, and Integration overviews</li>
<li>Master program: multiple modules, projects, and case studies</li>
<li>Tenant labs, resume prep, and interview questions</li>
</ul>
<p>Continue with <a href="/courses/workday-software-training">Workday Software Training</a> or the <a href="/courses/master-workday-training">Master Workday Training</a> live program.</p>
`,
    },
    {
      slug: 'guide-on-database-setup-in-pega',
      title: 'Guide on Database Setup in Pega',
      excerpt:
        'JDK, disk, memory, SQL Server collation, and Personal Edition install steps for a Pega platform database.',
      tags: ['Pega', 'Database', 'PRPC'],
      content: `
<p>This guide covers database setup for Pega Platform / PRPC Personal Edition so you can load the initial rulebase and do simple development.</p>
<h2>Requirements</h2>
<ul>
<li>Windows or Linux</li>
<li>Java JDK installed</li>
<li>At least 10 GB disk and about 1.25 GB memory available</li>
<li>A database user tablespace of at least 5 GB (grow as development and users increase)</li>
</ul>
<h2>SQL Server notes</h2>
<p>When you configure Microsoft SQL Server, set collation to Windows or binary. Binary sort can shorten sort time if you do not need language-specific sorting.</p>
<h2>Personal Edition install (high level)</h2>
<ol>
<li>Download PRPC Personal Edition (for example PRPC_PE_win64.zip).</li>
<li>Run the install script (install.bat on Windows).</li>
<li>Check port availability; enter a different port if needed.</li>
<li>Click Start and watch Output / Error tabs.</li>
<li>When confirmed, exit the installer. If Launch PRPC is selected, log in from the browser window with the provided credentials.</li>
</ol>
<p>Want instructor-led Pega next? Contact us via the <a href="/contact">contact page</a> or browse <a href="/courses">courses</a>.</p>
`,
    },
  ]

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content.trim(),
        tags: post.tags,
        published: true,
        featured: true,
        metaTitle: post.title,
        metaDescription: post.excerpt,
        publishedAt: new Date(),
        authorId: author.id,
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content.trim(),
        tags: post.tags,
        published: true,
        featured: true,
        metaTitle: post.title,
        metaDescription: post.excerpt,
        publishedAt: new Date(),
        authorId: author.id,
      },
    })
    console.log(`✓ Blog /blog/${post.slug}`)
  }
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
