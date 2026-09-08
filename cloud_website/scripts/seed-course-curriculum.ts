/**
 * Seed curriculum for courses missing modules.
 * - Specific curricula for known courses
 * - Category-based templates for everything else
 * Idempotent per course: replaces existing modules when --force is passed,
 * otherwise only fills courses with zero modules.
 */
import { PrismaClient, LessonKind } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

type LessonSeed = { title: string; duration: number; kind: LessonKind; order: number }
type ModuleSeed = { title: string; order: number; lessons: LessonSeed[] }

function L(title: string, duration: number, kind: LessonKind, order: number): LessonSeed {
  return { title, duration, kind, order }
}

function M(title: string, order: number, lessons: Omit<LessonSeed, 'order'>[]): ModuleSeed {
  return {
    title,
    order,
    lessons: lessons.map((l, i) => ({ ...l, order: i + 1 })),
  }
}

/** Specific curricula by slug */
const SPECIFIC: Record<string, ModuleSeed[]> = {
  'generative-ai-engineering-bootcamp-2026': [
    M('Foundations of Generative AI', 1, [
      { title: 'Welcome & Course Roadmap', duration: 12, kind: 'VIDEO' },
      { title: 'How LLMs Work — Tokens, Context & Sampling', duration: 28, kind: 'VIDEO' },
      { title: 'The 2026 GenAI Stack Overview', duration: 22, kind: 'VIDEO' },
      { title: 'Reading: Key Papers & Industry Reports', duration: 18, kind: 'ARTICLE' },
      { title: 'Module 1 Knowledge Check', duration: 15, kind: 'QUIZ' },
    ]),
    M('Prompt Systems & Structured Outputs', 2, [
      { title: 'Prompt Patterns for Production Apps', duration: 32, kind: 'VIDEO' },
      { title: 'System Prompts, Tools & JSON Schemas', duration: 35, kind: 'VIDEO' },
      { title: 'Lab: Build a Prompt Library', duration: 45, kind: 'ASSIGNMENT' },
      { title: 'Evaluation Rubrics for Prompt Quality', duration: 20, kind: 'ARTICLE' },
      { title: 'Module 2 Quiz', duration: 12, kind: 'QUIZ' },
    ]),
    M('RAG Pipelines Deep Dive', 3, [
      { title: 'RAG Architecture — Chunking, Embeddings & Retrieval', duration: 40, kind: 'VIDEO' },
      { title: 'Vector Databases: Pinecone, pgvector & FAISS', duration: 38, kind: 'VIDEO' },
      { title: 'Hybrid Search & Reranking Strategies', duration: 30, kind: 'VIDEO' },
      { title: 'Lab: End-to-End RAG with LangChain', duration: 60, kind: 'ASSIGNMENT' },
      { title: 'Debugging Hallucinations in RAG', duration: 25, kind: 'VIDEO' },
      { title: 'Module 3 Assessment', duration: 20, kind: 'QUIZ' },
    ]),
    M('Fine-Tuning & Model Adaptation', 4, [
      { title: 'When to Fine-Tune vs Prompt vs RAG', duration: 24, kind: 'VIDEO' },
      { title: 'LoRA / QLoRA Hands-On', duration: 48, kind: 'VIDEO' },
      { title: 'Dataset Preparation & Quality Filters', duration: 35, kind: 'VIDEO' },
      { title: 'Lab: Fine-Tune a Domain Model', duration: 70, kind: 'ASSIGNMENT' },
      { title: 'Module 4 Quiz', duration: 15, kind: 'QUIZ' },
    ]),
    M('LLM Evaluation & Observability', 5, [
      { title: 'Offline Metrics: BLEU, ROUGE, BERTScore & Beyond', duration: 28, kind: 'VIDEO' },
      { title: 'LLM-as-Judge & Human Eval Pipelines', duration: 32, kind: 'VIDEO' },
      { title: 'Production Tracing with LangSmith / OpenTelemetry', duration: 30, kind: 'VIDEO' },
      { title: 'Lab: Build an Eval Harness', duration: 55, kind: 'ASSIGNMENT' },
      { title: 'Module 5 Knowledge Check', duration: 12, kind: 'QUIZ' },
    ]),
    M('Security, Guardrails & Governance', 6, [
      { title: 'Prompt Injection & Data Leakage Risks', duration: 26, kind: 'VIDEO' },
      { title: 'Content Filters, Moderation & Policy Engines', duration: 30, kind: 'VIDEO' },
      { title: 'PII Redaction & Enterprise Compliance', duration: 22, kind: 'ARTICLE' },
      { title: 'Lab: Add Guardrails to a Chat API', duration: 50, kind: 'ASSIGNMENT' },
      { title: 'Module 6 Quiz', duration: 12, kind: 'QUIZ' },
    ]),
    M('Shipping Production GenAI Apps', 7, [
      { title: 'API Design for LLM Services', duration: 28, kind: 'VIDEO' },
      { title: 'Cost, Latency & Caching Strategies', duration: 34, kind: 'VIDEO' },
      { title: 'Streaming UIs & Tool Calling in Next.js', duration: 40, kind: 'VIDEO' },
      { title: 'Capstone: Deploy a Secure GenAI Product', duration: 90, kind: 'ASSIGNMENT' },
      { title: 'Final Assessment', duration: 25, kind: 'QUIZ' },
      { title: 'Career Paths & Interview Prep', duration: 20, kind: 'VIDEO' },
    ]),
  ],

  'ai-for-business-analysts-2026': [
    M('AI Foundations for Analysts', 1, [
      { title: 'Welcome: Why AI Matters for Business Analysts', duration: 15, kind: 'VIDEO' },
      { title: 'AI vs ML vs Generative AI — BA Perspective', duration: 25, kind: 'VIDEO' },
      { title: 'Where AI Fits in the BA Lifecycle', duration: 22, kind: 'VIDEO' },
      { title: 'Reading: AI Opportunity Canvas for BAs', duration: 18, kind: 'ARTICLE' },
      { title: 'Module 1 Quiz', duration: 12, kind: 'QUIZ' },
    ]),
    M('Prompting & AI Tools for Analysis', 2, [
      { title: 'Prompt Patterns for Requirements & Research', duration: 28, kind: 'VIDEO' },
      { title: 'Using ChatGPT / Copilot for Stakeholder Docs', duration: 30, kind: 'VIDEO' },
      { title: 'Lab: Draft BRD & User Stories with AI', duration: 45, kind: 'ASSIGNMENT' },
      { title: 'Fact-Checking AI Output — Analyst Checklist', duration: 20, kind: 'ARTICLE' },
      { title: 'Module 2 Quiz', duration: 12, kind: 'QUIZ' },
    ]),
    M('Data Analysis with AI Assistants', 3, [
      { title: 'Exploratory Analysis with AI Copilots', duration: 32, kind: 'VIDEO' },
      { title: 'Turning Spreadsheets into Insights Faster', duration: 28, kind: 'VIDEO' },
      { title: 'Lab: KPI Dashboard Brief from Raw Data', duration: 50, kind: 'ASSIGNMENT' },
      { title: 'Narrating Insights for Executives', duration: 24, kind: 'VIDEO' },
      { title: 'Module 3 Assessment', duration: 15, kind: 'QUIZ' },
    ]),
    M('Process Mining & Automation Opportunities', 4, [
      { title: 'Spotting Automation Candidates with AI', duration: 26, kind: 'VIDEO' },
      { title: 'Mapping As-Is / To-Be with GenAI Support', duration: 30, kind: 'VIDEO' },
      { title: 'Lab: Process Improvement Proposal', duration: 55, kind: 'ASSIGNMENT' },
      { title: 'Risk, Bias & Compliance for BA Work', duration: 22, kind: 'ARTICLE' },
      { title: 'Module 4 Quiz', duration: 12, kind: 'QUIZ' },
    ]),
    M('Stakeholder Communication & Delivery', 5, [
      { title: 'AI-Assisted Workshops & Interviews', duration: 24, kind: 'VIDEO' },
      { title: 'Building Decks, Specs & Change Notes Faster', duration: 28, kind: 'VIDEO' },
      { title: 'Lab: End-to-End BA Case Study with AI', duration: 70, kind: 'ASSIGNMENT' },
      { title: 'Final Assessment', duration: 20, kind: 'QUIZ' },
      { title: 'Career Paths: BA → AI BA / Product Analyst', duration: 18, kind: 'VIDEO' },
    ]),
  ],
}

function templateFor(title: string, categorySlug: string | null): ModuleSeed[] {
  const short = title.replace(/\s*2026\s*/g, ' ').trim()
  const cat = (categorySlug || '').toLowerCase()

  if (cat.includes('artificial') || cat.includes('ai')) {
    return [
      M(`Introduction to ${short}`, 1, [
        { title: 'Course Welcome & Learning Path', duration: 12, kind: 'VIDEO' },
        { title: 'Core Concepts & Industry Context', duration: 28, kind: 'VIDEO' },
        { title: 'Tools & Environment Setup', duration: 22, kind: 'VIDEO' },
        { title: 'Reading: Key References', duration: 15, kind: 'ARTICLE' },
        { title: 'Module 1 Quiz', duration: 12, kind: 'QUIZ' },
      ]),
      M('Hands-on Techniques', 2, [
        { title: 'Practical Workflows Walkthrough', duration: 35, kind: 'VIDEO' },
        { title: 'Best Practices & Common Pitfalls', duration: 28, kind: 'VIDEO' },
        { title: 'Lab: Guided Project Part 1', duration: 50, kind: 'ASSIGNMENT' },
        { title: 'Module 2 Quiz', duration: 12, kind: 'QUIZ' },
      ]),
      M('Applied Projects', 3, [
        { title: 'Real-World Use Cases', duration: 30, kind: 'VIDEO' },
        { title: 'Lab: Guided Project Part 2', duration: 60, kind: 'ASSIGNMENT' },
        { title: 'Evaluation & Quality Checks', duration: 25, kind: 'VIDEO' },
        { title: 'Module 3 Assessment', duration: 15, kind: 'QUIZ' },
      ]),
      M('Delivery & Career Prep', 4, [
        { title: 'Production & Deployment Basics', duration: 28, kind: 'VIDEO' },
        { title: 'Capstone Project', duration: 70, kind: 'ASSIGNMENT' },
        { title: 'Final Assessment', duration: 20, kind: 'QUIZ' },
        { title: 'Interview & Portfolio Tips', duration: 18, kind: 'VIDEO' },
      ]),
    ]
  }

  if (cat.includes('cloud')) {
    return [
      M('Cloud Fundamentals', 1, [
        { title: 'Welcome & Architecture Overview', duration: 15, kind: 'VIDEO' },
        { title: 'Core Services & Shared Responsibility', duration: 30, kind: 'VIDEO' },
        { title: 'Lab: Account & IAM Setup', duration: 40, kind: 'ASSIGNMENT' },
        { title: 'Module 1 Quiz', duration: 12, kind: 'QUIZ' },
      ]),
      M('Build & Deploy', 2, [
        { title: 'Compute, Storage & Networking', duration: 35, kind: 'VIDEO' },
        { title: 'IaC & Automation Basics', duration: 32, kind: 'VIDEO' },
        { title: 'Lab: Deploy a Sample Workload', duration: 55, kind: 'ASSIGNMENT' },
        { title: 'Module 2 Quiz', duration: 12, kind: 'QUIZ' },
      ]),
      M('Secure & Operate', 3, [
        { title: 'Security, Monitoring & Cost', duration: 30, kind: 'VIDEO' },
        { title: 'Lab: Hardening & Observability', duration: 50, kind: 'ASSIGNMENT' },
        { title: 'Capstone Architecture Review', duration: 60, kind: 'ASSIGNMENT' },
        { title: 'Final Assessment', duration: 20, kind: 'QUIZ' },
      ]),
    ]
  }

  if (cat.includes('cyber') || cat.includes('security')) {
    return [
      M('Security Foundations', 1, [
        { title: 'Threat Landscape Overview', duration: 20, kind: 'VIDEO' },
        { title: 'Core Security Controls', duration: 28, kind: 'VIDEO' },
        { title: 'Lab: Baseline Hardening', duration: 45, kind: 'ASSIGNMENT' },
        { title: 'Module 1 Quiz', duration: 12, kind: 'QUIZ' },
      ]),
      M('Detection & Response', 2, [
        { title: 'Monitoring & SOC Workflows', duration: 32, kind: 'VIDEO' },
        { title: 'Lab: Investigate an Incident', duration: 55, kind: 'ASSIGNMENT' },
        { title: 'Module 2 Assessment', duration: 15, kind: 'QUIZ' },
      ]),
      M('Advanced Practice', 3, [
        { title: 'Attack Simulation Walkthrough', duration: 35, kind: 'VIDEO' },
        { title: 'Capstone: Defense Report', duration: 70, kind: 'ASSIGNMENT' },
        { title: 'Final Assessment', duration: 20, kind: 'QUIZ' },
      ]),
    ]
  }

  if (cat.includes('data') || cat.includes('analytics')) {
    return [
      M('Data Foundations', 1, [
        { title: 'Welcome & Analytics Mindset', duration: 12, kind: 'VIDEO' },
        { title: 'Data Types, Quality & Pipelines', duration: 28, kind: 'VIDEO' },
        { title: 'Lab: Clean a Sample Dataset', duration: 45, kind: 'ASSIGNMENT' },
        { title: 'Module 1 Quiz', duration: 12, kind: 'QUIZ' },
      ]),
      M('Analysis & Visualization', 2, [
        { title: 'Exploratory Analysis Techniques', duration: 32, kind: 'VIDEO' },
        { title: 'Building Dashboards that Matter', duration: 30, kind: 'VIDEO' },
        { title: 'Lab: KPI Dashboard', duration: 55, kind: 'ASSIGNMENT' },
        { title: 'Module 2 Quiz', duration: 12, kind: 'QUIZ' },
      ]),
      M('Insights to Action', 3, [
        { title: 'Storytelling with Data', duration: 25, kind: 'VIDEO' },
        { title: 'Capstone Analytics Project', duration: 70, kind: 'ASSIGNMENT' },
        { title: 'Final Assessment', duration: 18, kind: 'QUIZ' },
      ]),
    ]
  }

  if (cat.includes('workday') || cat.includes('enterprise') || cat.includes('salesforce') || cat.includes('sap')) {
    return [
      M('Platform Foundations', 1, [
        { title: 'Course Intro & Navigation', duration: 15, kind: 'VIDEO' },
        { title: 'Core Objects & Security Basics', duration: 30, kind: 'VIDEO' },
        { title: 'Lab: Tenant / Org Walkthrough', duration: 40, kind: 'ASSIGNMENT' },
        { title: 'Module 1 Quiz', duration: 12, kind: 'QUIZ' },
      ]),
      M('Configuration & Processes', 2, [
        { title: 'Business Process Configuration', duration: 35, kind: 'VIDEO' },
        { title: 'Lab: Build a Sample Process', duration: 55, kind: 'ASSIGNMENT' },
        { title: 'Reporting Essentials', duration: 28, kind: 'VIDEO' },
        { title: 'Module 2 Quiz', duration: 12, kind: 'QUIZ' },
      ]),
      M('Implementation Practice', 3, [
        { title: 'Integrations Overview', duration: 30, kind: 'VIDEO' },
        { title: 'Capstone Implementation Scenario', duration: 75, kind: 'ASSIGNMENT' },
        { title: 'Final Assessment', duration: 20, kind: 'QUIZ' },
      ]),
    ]
  }

  // default / software / career
  return [
    M(`Getting Started with ${short}`, 1, [
      { title: 'Welcome & Course Roadmap', duration: 12, kind: 'VIDEO' },
      { title: 'Core Concepts Explained', duration: 28, kind: 'VIDEO' },
      { title: 'Setup & Tooling', duration: 22, kind: 'VIDEO' },
      { title: 'Module 1 Quiz', duration: 12, kind: 'QUIZ' },
    ]),
    M('Core Skills Practice', 2, [
      { title: 'Deep Dive Lessons', duration: 35, kind: 'VIDEO' },
      { title: 'Lab: Guided Exercise', duration: 50, kind: 'ASSIGNMENT' },
      { title: 'Best Practices Checklist', duration: 18, kind: 'ARTICLE' },
      { title: 'Module 2 Quiz', duration: 12, kind: 'QUIZ' },
    ]),
    M('Project & Assessment', 3, [
      { title: 'Real-World Application', duration: 30, kind: 'VIDEO' },
      { title: 'Capstone Project', duration: 70, kind: 'ASSIGNMENT' },
      { title: 'Final Assessment', duration: 20, kind: 'QUIZ' },
      { title: 'Next Steps & Career Tips', duration: 15, kind: 'VIDEO' },
    ]),
  ]
}

async function seedCourse(
  course: { id: string; slug: string; title: string; categorySlug: string | null },
  force: boolean
) {
  const existing = await prisma.module.count({ where: { courseId: course.id } })
  if (existing > 0 && !force) {
    return { skipped: true, modules: existing, lessons: 0 }
  }

  if (existing > 0 && force) {
    await prisma.module.deleteMany({ where: { courseId: course.id } })
  }

  const curriculum = SPECIFIC[course.slug] ?? templateFor(course.title, course.categorySlug)
  let lessons = 0
  for (const mod of curriculum) {
    const created = await prisma.module.create({
      data: {
        title: mod.title,
        order: mod.order,
        courseId: course.id,
        Lesson: {
          create: mod.lessons.map((l) => ({
            title: l.title,
            duration: l.duration,
            order: l.order,
            kind: l.kind,
          })),
        },
      },
      include: { Lesson: true },
    })
    lessons += created.Lesson.length
  }
  return { skipped: false, modules: curriculum.length, lessons }
}

async function main() {
  const force = process.argv.includes('--force')
  const onlySlug = process.argv.find((a) => a.startsWith('--slug='))?.slice(7)

  const courses = await prisma.course.findMany({
    where: {
      published: true,
      ...(onlySlug ? { slug: onlySlug } : {}),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      Category: { select: { slug: true } },
      _count: { select: { Module: true } },
    },
    orderBy: { title: 'asc' },
  })

  let seeded = 0
  let skipped = 0
  let totalLessons = 0

  for (const c of courses) {
    // Prefer filling empty ones; with --force redo all (or filtered slug)
    if (!force && c._count.Module > 0 && !onlySlug) {
      skipped++
      continue
    }
    if (!force && c._count.Module > 0 && onlySlug) {
      // still allow --slug without --force to skip if already filled
      skipped++
      console.log(`↷ skip (has modules): ${c.slug}`)
      continue
    }

    const result = await seedCourse(
      {
        id: c.id,
        slug: c.slug,
        title: c.title,
        categorySlug: c.Category?.slug ?? null,
      },
      force || Boolean(onlySlug && c._count.Module === 0)
    )

    if (result.skipped) {
      skipped++
      continue
    }
    seeded++
    totalLessons += result.lessons
    console.log(`✓ ${c.slug} — ${result.modules} modules, ${result.lessons} lessons`)
  }

  console.log(`\nDone. Seeded ${seeded} courses (${totalLessons} lessons). Skipped ${skipped}.`)
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
