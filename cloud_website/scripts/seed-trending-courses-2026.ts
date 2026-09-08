/**
 * Seed 15 professional, market-trending courses for 2026.
 * Upserts by slug — does not wipe existing Hello/workday data.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const CATEGORIES = [
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  { name: 'Cloud Computing', slug: 'cloud-computing' },
  { name: 'Cybersecurity', slug: 'cybersecurity' },
  { name: 'Data & Analytics', slug: 'data-analytics' },
  { name: 'Enterprise Applications', slug: 'enterprise-applications' },
  { name: 'Software Engineering', slug: 'software-engineering' },
] as const

type CourseSeed = {
  title: string
  slug: string
  categorySlug: (typeof CATEGORIES)[number]['slug']
  summary: string
  description: string
  level: string
  durationMin: number
  priceCents: number
  rating: number
  featured: boolean
  thumbnailUrl: string
  learningOutcomes: string[]
  tags: string[]
}

const COURSES: CourseSeed[] = [
  {
    title: 'Generative AI Engineering Bootcamp 2026',
    slug: 'generative-ai-engineering-bootcamp-2026',
    categorySlug: 'artificial-intelligence',
    summary: 'Build production LLM apps with RAG, fine-tuning, and enterprise guardrails.',
    description:
      'Master Generative AI for 2026 hiring demand. Learn prompt systems, RAG pipelines, evaluation, and deployment patterns used by Fortune 500 AI teams.',
    level: 'Intermediate',
    durationMin: 4800,
    priceCents: 49900,
    rating: 4.9,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    learningOutcomes: ['Design RAG systems', 'Evaluate LLM quality', 'Ship secure GenAI apps'],
    tags: ['GenAI', 'LLM', 'RAG', 'OpenAI', 'LangChain'],
  },
  {
    title: 'Agentic AI & Autonomous Workflows',
    slug: 'agentic-ai-autonomous-workflows-2026',
    categorySlug: 'artificial-intelligence',
    summary: 'Design multi-agent systems that plan, tool-call, and automate business processes.',
    description:
      'Learn agent architectures, tool orchestration, memory, and human-in-the-loop controls for reliable enterprise automation.',
    level: 'Advanced',
    durationMin: 3600,
    priceCents: 44900,
    rating: 4.8,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    learningOutcomes: ['Build multi-agent flows', 'Integrate enterprise tools', 'Add safety controls'],
    tags: ['Agents', 'Automation', 'AI Ops'],
  },
  {
    title: 'Prompt Engineering for Enterprise Teams',
    slug: 'prompt-engineering-enterprise-2026',
    categorySlug: 'artificial-intelligence',
    summary: 'Create reliable prompt systems for support, sales, HR, and knowledge ops.',
    description:
      'A practical enterprise course on prompt libraries, evaluation rubrics, and governance for regulated industries.',
    level: 'Beginner',
    durationMin: 1800,
    priceCents: 19900,
    rating: 4.7,
    featured: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    learningOutcomes: ['Write production prompts', 'Set evaluation criteria', 'Govern AI usage'],
    tags: ['Prompt Engineering', 'Enterprise AI'],
  },
  {
    title: 'AWS Cloud Architect Professional 2026',
    slug: 'aws-cloud-architect-professional-2026',
    categorySlug: 'cloud-computing',
    summary: 'Design scalable, secure AWS architectures aligned to 2026 Solutions Architect paths.',
    description:
      'Cover VPC design, serverless, containers, cost optimization, Well-Architected reviews, and enterprise landing zones.',
    level: 'Advanced',
    durationMin: 5400,
    priceCents: 39900,
    rating: 4.8,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    learningOutcomes: ['Design multi-account AWS', 'Optimize cloud cost', 'Pass architect interviews'],
    tags: ['AWS', 'Cloud Architecture', 'Serverless'],
  },
  {
    title: 'Azure Cloud & DevOps Engineer',
    slug: 'azure-cloud-devops-engineer-2026',
    categorySlug: 'cloud-computing',
    summary: 'Deploy Azure landing zones, CI/CD, AKS, and GitOps for enterprise delivery.',
    description:
      'Hands-on Azure training for modern platform teams: IaC with Bicep/Terraform, pipelines, monitoring, and security baselines.',
    level: 'Intermediate',
    durationMin: 4200,
    priceCents: 37900,
    rating: 4.7,
    featured: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a2?w=800&q=80',
    learningOutcomes: ['Automate Azure delivery', 'Operate AKS clusters', 'Implement GitOps'],
    tags: ['Azure', 'DevOps', 'AKS'],
  },
  {
    title: 'Kubernetes & Platform Engineering',
    slug: 'kubernetes-platform-engineering-2026',
    categorySlug: 'cloud-computing',
    summary: 'Build internal developer platforms with Kubernetes, service mesh, and observability.',
    description:
      'From cluster fundamentals to production IDP patterns used by top engineering organizations in 2026.',
    level: 'Advanced',
    durationMin: 4800,
    priceCents: 42900,
    rating: 4.8,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
    learningOutcomes: ['Operate production K8s', 'Design IDPs', 'Improve developer velocity'],
    tags: ['Kubernetes', 'Platform Engineering', 'DevEx'],
  },
  {
    title: 'Zero Trust Cybersecurity Specialist',
    slug: 'zero-trust-cybersecurity-specialist-2026',
    categorySlug: 'cybersecurity',
    summary: 'Implement Zero Trust identity, network, and workload security for hybrid enterprises.',
    description:
      'Map NIST Zero Trust, IAM, microsegmentation, threat detection, and incident response for modern cloud estates.',
    level: 'Intermediate',
    durationMin: 3900,
    priceCents: 35900,
    rating: 4.8,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    learningOutcomes: ['Design Zero Trust', 'Secure identities', 'Respond to incidents'],
    tags: ['Zero Trust', 'IAM', 'Security'],
  },
  {
    title: 'Cloud Security & DevSecOps',
    slug: 'cloud-security-devsecops-2026',
    categorySlug: 'cybersecurity',
    summary: 'Embed security into CI/CD with SAST, SCA, secrets, and policy-as-code.',
    description:
      'Learn shift-left security practices demanded by MNCs: container scanning, compliance automation, and secure SDLC.',
    level: 'Intermediate',
    durationMin: 3300,
    priceCents: 32900,
    rating: 4.7,
    featured: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    learningOutcomes: ['Secure pipelines', 'Automate compliance', 'Reduce vulns in prod'],
    tags: ['DevSecOps', 'AppSec', 'Compliance'],
  },
  {
    title: 'Data Engineering with Databricks & Spark',
    slug: 'data-engineering-databricks-spark-2026',
    categorySlug: 'data-analytics',
    summary: 'Build lakehouse pipelines, medallion architecture, and production ETL/ELT.',
    description:
      'Train for high-demand data engineer roles using Spark, Delta Lake, orchestration, and data quality frameworks.',
    level: 'Intermediate',
    durationMin: 4500,
    priceCents: 38900,
    rating: 4.8,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    learningOutcomes: ['Build lakehouse pipelines', 'Model medallion layers', 'Monitor data quality'],
    tags: ['Databricks', 'Spark', 'ETL'],
  },
  {
    title: 'MLOps & AI Production Systems',
    slug: 'mlops-ai-production-systems-2026',
    categorySlug: 'data-analytics',
    summary: 'Take ML models from notebook to monitored production at scale.',
    description:
      'Cover feature stores, model registries, CI/CD for ML, drift detection, and responsible AI operations.',
    level: 'Advanced',
    durationMin: 4000,
    priceCents: 41900,
    rating: 4.8,
    featured: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83b0?w=800&q=80',
    learningOutcomes: ['Deploy ML services', 'Monitor model drift', 'Automate retraining'],
    tags: ['MLOps', 'ML', 'Production AI'],
  },
  {
    title: 'Power BI & Enterprise Analytics',
    slug: 'power-bi-enterprise-analytics-2026',
    categorySlug: 'data-analytics',
    summary: 'Create executive dashboards, DAX models, and governed self-serve analytics.',
    description:
      'Business-ready analytics program for analysts and managers seeking Power BI expertise in MNC environments.',
    level: 'Beginner',
    durationMin: 2400,
    priceCents: 24900,
    rating: 4.6,
    featured: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    learningOutcomes: ['Build semantic models', 'Write advanced DAX', 'Publish governed reports'],
    tags: ['Power BI', 'Analytics', 'DAX'],
  },
  {
    title: 'SAP S/4HANA Functional Consultant',
    slug: 'sap-s4hana-functional-consultant-2026',
    categorySlug: 'enterprise-applications',
    summary: 'Configure core S/4HANA modules and lead digital transformation projects.',
    description:
      'Career-focused SAP training covering FI/CO, MM, SD fundamentals, Fiori UX, and end-to-end business processes.',
    level: 'Intermediate',
    durationMin: 6000,
    priceCents: 54900,
    rating: 4.7,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    learningOutcomes: ['Configure S/4HANA', 'Map business processes', 'Support go-lives'],
    tags: ['SAP', 'S/4HANA', 'ERP'],
  },
  {
    title: 'Salesforce Administrator & Developer',
    slug: 'salesforce-administrator-developer-2026',
    categorySlug: 'enterprise-applications',
    summary: 'Master Salesforce CRM admin, Apex, Flows, and Lightning for high-demand roles.',
    description:
      'Prepare for Admin and Platform Developer career tracks with real CRM implementation scenarios.',
    level: 'Intermediate',
    durationMin: 4200,
    priceCents: 36900,
    rating: 4.7,
    featured: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    learningOutcomes: ['Administer Salesforce', 'Automate with Flow', 'Extend with Apex'],
    tags: ['Salesforce', 'CRM', 'Apex'],
  },
  {
    title: 'Workday HCM Professional',
    slug: 'workday-hcm-professional-2026',
    categorySlug: 'enterprise-applications',
    summary: 'Implement Workday HCM, security, business processes, and reporting.',
    description:
      'Enterprise HRIS program for consultants targeting Workday implementation and support careers in 2026.',
    level: 'Intermediate',
    durationMin: 4800,
    priceCents: 49900,
    rating: 4.6,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    learningOutcomes: ['Configure HCM cores', 'Manage security roles', 'Build Workday reports'],
    tags: ['Workday', 'HCM', 'HRIS'],
  },
  {
    title: 'Full Stack TypeScript & Next.js Pro',
    slug: 'full-stack-typescript-nextjs-pro-2026',
    categorySlug: 'software-engineering',
    summary: 'Ship modern full-stack apps with Next.js, TypeScript, APIs, and cloud deploy.',
    description:
      'Job-ready engineering track covering React Server Components, auth, databases, testing, and production performance.',
    level: 'Intermediate',
    durationMin: 5100,
    priceCents: 34900,
    rating: 4.9,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    learningOutcomes: ['Build Next.js apps', 'Design typed APIs', 'Deploy to production'],
    tags: ['Next.js', 'TypeScript', 'Full Stack'],
  },
]

async function ensureCategories() {
  const map = new Map<string, string>()
  for (const cat of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    })
    map.set(cat.slug, row.id)
    console.log(`✓ Category: ${cat.name}`)
  }
  return map
}

async function seedCourses(categoryIds: Map<string, string>) {
  for (const course of COURSES) {
    const categoryId = categoryIds.get(course.categorySlug)
    if (!categoryId) throw new Error(`Missing category ${course.categorySlug}`)

    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        summary: course.summary,
        description: course.description,
        level: course.level,
        durationMin: course.durationMin,
        priceCents: course.priceCents,
        rating: course.rating,
        published: true,
        featured: course.featured,
        thumbnailUrl: course.thumbnailUrl,
        learningOutcomes: course.learningOutcomes,
        categoryId,
        currency: 'INR',
        language: 'English',
      },
      create: {
        title: course.title,
        slug: course.slug,
        summary: course.summary,
        description: course.description,
        level: course.level,
        durationMin: course.durationMin,
        priceCents: course.priceCents,
        rating: course.rating,
        published: true,
        featured: course.featured,
        thumbnailUrl: course.thumbnailUrl,
        learningOutcomes: course.learningOutcomes,
        categoryId,
        currency: 'INR',
        language: 'English',
      },
    })
    console.log(`✓ Course: ${course.title}`)
  }
}

async function main() {
  console.log('Seeding 15 trending 2026 courses...\n')
  const categoryIds = await ensureCategories()
  await seedCourses(categoryIds)
  console.log(`\nDone. Categories: ${CATEGORIES.length}, Courses: ${COURSES.length}`)
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
