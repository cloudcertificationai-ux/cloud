/**
 * Ensure every category has 15 published courses (upsert by slug).
 * Tops up existing categories without deleting current courses.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const TARGET = 15

type CourseDef = {
  title: string
  slug: string
  summary: string
  hours: number
  price: number
  rating: number
  featured: boolean
  img: string
  level: string
}

const IMAGES = [
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80',
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80',
  'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
]

/** Extra courses per category slug (used to top up to TARGET). */
const EXTRA_BY_CATEGORY: Record<string, CourseDef[]> = {
  'artificial-intelligence': [
    { title: 'Computer Vision for Enterprise 2026', slug: 'computer-vision-enterprise-2026', summary: 'Build vision pipelines for inspection, OCR, and video analytics.', hours: 70, price: 38900, rating: 4.7, featured: true, img: IMAGES[0], level: 'Intermediate' },
    { title: 'MLOps & Model Deployment Mastery', slug: 'mlops-model-deployment-2026', summary: 'Ship, monitor, and retrain ML models in production.', hours: 75, price: 41900, rating: 4.8, featured: true, img: IMAGES[1], level: 'Advanced' },
    { title: 'Responsible AI & Governance', slug: 'responsible-ai-governance-2026', summary: 'Policies, bias testing, and compliance for enterprise AI.', hours: 40, price: 24900, rating: 4.6, featured: false, img: IMAGES[2], level: 'Beginner' },
    { title: 'NLP & Text Intelligence Bootcamp', slug: 'nlp-text-intelligence-2026', summary: 'Classification, NER, summarization, and search with modern NLP.', hours: 65, price: 35900, rating: 4.7, featured: false, img: IMAGES[3], level: 'Intermediate' },
    { title: 'Deep Learning with PyTorch Pro', slug: 'deep-learning-pytorch-pro-2026', summary: 'Neural nets, transfer learning, and GPU training workflows.', hours: 90, price: 44900, rating: 4.8, featured: true, img: IMAGES[4], level: 'Advanced' },
    { title: 'AI Product Management Essentials', slug: 'ai-product-management-2026', summary: 'Scope AI features, metrics, and go-to-market for PMs.', hours: 35, price: 22900, rating: 4.6, featured: false, img: IMAGES[5], level: 'Beginner' },
    { title: 'Speech AI & Multimodal Systems', slug: 'speech-ai-multimodal-2026', summary: 'ASR, TTS, and multimodal models for real products.', hours: 55, price: 32900, rating: 4.7, featured: false, img: IMAGES[6], level: 'Intermediate' },
    { title: 'Vector Databases & Semantic Search', slug: 'vector-databases-semantic-search-2026', summary: 'Embeddings, indexing, and RAG retrieval at scale.', hours: 45, price: 27900, rating: 4.8, featured: true, img: IMAGES[7], level: 'Intermediate' },
    { title: 'AI for Business Analysts', slug: 'ai-for-business-analysts-2026', summary: 'Use GenAI tools for research, reporting, and decisions.', hours: 30, price: 18900, rating: 4.5, featured: false, img: IMAGES[8], level: 'Beginner' },
    { title: 'Fine-Tuning LLMs for Domain Data', slug: 'fine-tuning-llms-domain-2026', summary: 'LoRA, datasets, evals, and safe domain adaptation.', hours: 60, price: 39900, rating: 4.8, featured: true, img: IMAGES[9], level: 'Advanced' },
    { title: 'AI Security & Red Teaming', slug: 'ai-security-red-teaming-2026', summary: 'Prompt injection, jailbreaks, and AI threat modeling.', hours: 50, price: 34900, rating: 4.7, featured: false, img: IMAGES[10], level: 'Advanced' },
    { title: 'Recommendation Systems in Practice', slug: 'recommendation-systems-2026', summary: 'Collaborative filtering, ranking, and personalization.', hours: 55, price: 31900, rating: 4.6, featured: false, img: IMAGES[11], level: 'Intermediate' },
  ],
  cybersecurity: [
    { title: 'Certified Ethical Hacker Path 2026', slug: 'ethical-hacker-path-2026', summary: 'Recon, exploitation, and reporting for ethical hacking roles.', hours: 90, price: 42900, rating: 4.8, featured: true, img: IMAGES[5], level: 'Intermediate' },
    { title: 'SOC Analyst Operations Bootcamp', slug: 'soc-analyst-operations-2026', summary: 'SIEM, triage, playbooks, and 24x7 security operations.', hours: 70, price: 35900, rating: 4.7, featured: true, img: IMAGES[6], level: 'Beginner' },
    { title: 'Cloud Security on AWS & Azure', slug: 'cloud-security-aws-azure-2026', summary: 'IAM, encryption, CSPM, and secure cloud architectures.', hours: 80, price: 39900, rating: 4.8, featured: true, img: IMAGES[3], level: 'Advanced' },
    { title: 'Penetration Testing Professional', slug: 'penetration-testing-professional-2026', summary: 'Web, API, and network pentests with professional reports.', hours: 85, price: 44900, rating: 4.8, featured: true, img: IMAGES[4], level: 'Advanced' },
    { title: 'Zero Trust Architecture Design', slug: 'zero-trust-architecture-2026', summary: 'Design identity-centric zero trust for enterprises.', hours: 50, price: 32900, rating: 4.6, featured: false, img: IMAGES[7], level: 'Intermediate' },
    { title: 'Application Security (AppSec) Pro', slug: 'application-security-appsec-2026', summary: 'OWASP, SAST/DAST, secure SDLC, and threat modeling.', hours: 65, price: 37900, rating: 4.7, featured: false, img: IMAGES[8], level: 'Intermediate' },
    { title: 'Incident Response & Forensics', slug: 'incident-response-forensics-2026', summary: 'Contain breaches, collect evidence, and recover systems.', hours: 60, price: 36900, rating: 4.7, featured: true, img: IMAGES[9], level: 'Advanced' },
    { title: 'Identity & Access Management (IAM)', slug: 'identity-access-management-2026', summary: 'SSO, MFA, PAM, and modern identity governance.', hours: 45, price: 28900, rating: 4.6, featured: false, img: IMAGES[10], level: 'Intermediate' },
    { title: 'Cybersecurity GRC & Compliance', slug: 'cybersecurity-grc-compliance-2026', summary: 'ISO 27001, SOC 2, risk registers, and audits.', hours: 40, price: 25900, rating: 4.5, featured: false, img: IMAGES[11], level: 'Beginner' },
    { title: 'Malware Analysis Fundamentals', slug: 'malware-analysis-fundamentals-2026', summary: 'Static/dynamic analysis for SOC and threat intel teams.', hours: 55, price: 33900, rating: 4.7, featured: false, img: IMAGES[12], level: 'Advanced' },
    { title: 'DevSecOps Pipeline Security', slug: 'devsecops-pipeline-security-2026', summary: 'Secure CI/CD, secrets, containers, and supply chain.', hours: 50, price: 31900, rating: 4.7, featured: true, img: IMAGES[13], level: 'Intermediate' },
    { title: 'Network Security & Firewalls', slug: 'network-security-firewalls-2026', summary: 'Segmentation, VPN, IDS/IPS, and secure networking.', hours: 55, price: 29900, rating: 4.6, featured: false, img: IMAGES[14], level: 'Beginner' },
    { title: 'Threat Intelligence Analyst', slug: 'threat-intelligence-analyst-2026', summary: 'CTI frameworks, IOCs, and actionable intel reporting.', hours: 45, price: 30900, rating: 4.6, featured: false, img: IMAGES[0], level: 'Intermediate' },
  ],
  'data-analytics': [
    { title: 'Power BI Data Analyst Professional', slug: 'power-bi-data-analyst-pro-2026', summary: 'Model, visualize, and publish enterprise Power BI reports.', hours: 60, price: 29900, rating: 4.8, featured: true, img: IMAGES[7], level: 'Intermediate' },
    { title: 'SQL for Data Analytics Mastery', slug: 'sql-data-analytics-mastery-2026', summary: 'Advanced SQL for reporting, warehousing, and interviews.', hours: 50, price: 24900, rating: 4.8, featured: true, img: IMAGES[8], level: 'Beginner' },
    { title: 'Python for Data Analysis', slug: 'python-data-analysis-2026', summary: 'Pandas, NumPy, and analytics workflows for business data.', hours: 55, price: 26900, rating: 4.7, featured: true, img: IMAGES[9], level: 'Beginner' },
    { title: 'Tableau Desktop Specialist Path', slug: 'tableau-desktop-specialist-2026', summary: 'Interactive dashboards and storytelling with Tableau.', hours: 45, price: 27900, rating: 4.7, featured: false, img: IMAGES[10], level: 'Intermediate' },
    { title: 'Data Engineering with Spark & Airflow', slug: 'data-engineering-spark-airflow-2026', summary: 'Build reliable ETL/ELT pipelines for analytics platforms.', hours: 80, price: 42900, rating: 4.8, featured: true, img: IMAGES[11], level: 'Advanced' },
    { title: 'Modern Data Warehouse on Snowflake', slug: 'snowflake-data-warehouse-2026', summary: 'Model, load, and govern data on Snowflake.', hours: 65, price: 38900, rating: 4.7, featured: true, img: IMAGES[12], level: 'Intermediate' },
    { title: 'Excel to Analytics Career Accelerator', slug: 'excel-analytics-career-2026', summary: 'Advanced Excel, Power Query, and business reporting.', hours: 35, price: 14900, rating: 4.6, featured: false, img: IMAGES[13], level: 'Beginner' },
    { title: 'dbt Analytics Engineering', slug: 'dbt-analytics-engineering-2026', summary: 'Transform warehouse data with dbt tests and docs.', hours: 50, price: 31900, rating: 4.8, featured: false, img: IMAGES[14], level: 'Intermediate' },
    { title: 'Business Intelligence Strategy', slug: 'business-intelligence-strategy-2026', summary: 'KPI frameworks, data products, and BI governance.', hours: 40, price: 23900, rating: 4.5, featured: false, img: IMAGES[0], level: 'Beginner' },
    { title: 'BigQuery Analytics Professional', slug: 'bigquery-analytics-pro-2026', summary: 'SQL analytics and cost control on Google BigQuery.', hours: 55, price: 34900, rating: 4.7, featured: true, img: IMAGES[1], level: 'Intermediate' },
    { title: 'Statistics for Data Professionals', slug: 'statistics-data-professionals-2026', summary: 'Inference, experiments, and metrics that drive decisions.', hours: 45, price: 22900, rating: 4.6, featured: false, img: IMAGES[2], level: 'Intermediate' },
    { title: 'Looker & LookML Fundamentals', slug: 'looker-lookml-fundamentals-2026', summary: 'Semantic models and governed dashboards in Looker.', hours: 40, price: 28900, rating: 4.6, featured: false, img: IMAGES[3], level: 'Intermediate' },
  ],
  'enterprise-applications': [
    { title: 'SAP S/4HANA Functional Consultant', slug: 'sap-s4hana-functional-2026', summary: 'Core S/4HANA modules for finance and logistics roles.', hours: 90, price: 49900, rating: 4.7, featured: true, img: IMAGES[8], level: 'Intermediate' },
    { title: 'Salesforce Administrator 2026', slug: 'salesforce-administrator-2026', summary: 'Configure Salesforce for sales, service, and automation.', hours: 60, price: 32900, rating: 4.8, featured: true, img: IMAGES[9], level: 'Beginner' },
    { title: 'Salesforce Platform Developer I', slug: 'salesforce-platform-developer-2026', summary: 'Apex, LWC, and integrations for Salesforce apps.', hours: 80, price: 39900, rating: 4.8, featured: true, img: IMAGES[10], level: 'Intermediate' },
    { title: 'Oracle Cloud ERP Fundamentals', slug: 'oracle-cloud-erp-2026', summary: 'Oracle Fusion ERP modules for enterprise finance ops.', hours: 70, price: 42900, rating: 4.6, featured: false, img: IMAGES[11], level: 'Intermediate' },
    { title: 'ServiceNow CSA Certification Path', slug: 'servicenow-csa-path-2026', summary: 'ITSM workflows, catalog, and ServiceNow admin skills.', hours: 55, price: 35900, rating: 4.7, featured: true, img: IMAGES[12], level: 'Beginner' },
    { title: 'Microsoft Dynamics 365 Finance', slug: 'dynamics-365-finance-2026', summary: 'Configure D365 Finance for modern ERP teams.', hours: 75, price: 44900, rating: 4.6, featured: false, img: IMAGES[13], level: 'Intermediate' },
    { title: 'SAP ABAP on HANA Developer', slug: 'sap-abap-hana-developer-2026', summary: 'ABAP development for S/4HANA customizations.', hours: 85, price: 46900, rating: 4.7, featured: true, img: IMAGES[14], level: 'Advanced' },
    { title: 'Workday HCM Core Consultant', slug: 'workday-hcm-core-consultant-2026', summary: 'Workday HCM configuration for HR transformation.', hours: 65, price: 47900, rating: 4.7, featured: true, img: IMAGES[0], level: 'Intermediate' },
    { title: 'Salesforce Marketing Cloud Pro', slug: 'salesforce-marketing-cloud-2026', summary: 'Journeys, email studio, and marketing automation.', hours: 50, price: 34900, rating: 4.6, featured: false, img: IMAGES[1], level: 'Intermediate' },
    { title: 'Enterprise Integration with MuleSoft', slug: 'mulesoft-enterprise-integration-2026', summary: 'APIs and integrations across ERP and CRM systems.', hours: 60, price: 38900, rating: 4.7, featured: false, img: IMAGES[2], level: 'Advanced' },
    { title: 'NetSuite ERP Administrator', slug: 'netsuite-erp-administrator-2026', summary: 'Administer NetSuite for mid-market finance teams.', hours: 55, price: 36900, rating: 4.5, featured: false, img: IMAGES[3], level: 'Intermediate' },
    { title: 'ERP Implementation Project Management', slug: 'erp-implementation-pm-2026', summary: 'Plan and deliver ERP rollouts with change management.', hours: 40, price: 27900, rating: 4.5, featured: false, img: IMAGES[4], level: 'Beginner' },
  ],
  'software-engineering': [
    { title: 'Full Stack JavaScript Developer 2026', slug: 'full-stack-javascript-2026', summary: 'React, Node, and databases for production web apps.', hours: 100, price: 39900, rating: 4.8, featured: true, img: IMAGES[11], level: 'Intermediate' },
    { title: 'React & Next.js Professional', slug: 'react-nextjs-professional-2026', summary: 'Modern React patterns, App Router, and performance.', hours: 70, price: 32900, rating: 4.8, featured: true, img: IMAGES[12], level: 'Intermediate' },
    { title: 'Java Spring Boot Microservices', slug: 'java-spring-boot-microservices-2026', summary: 'Build scalable microservices with Spring Boot.', hours: 90, price: 38900, rating: 4.7, featured: true, img: IMAGES[13], level: 'Advanced' },
    { title: 'Python Backend Engineering', slug: 'python-backend-engineering-2026', summary: 'FastAPI/Django APIs, auth, and production services.', hours: 75, price: 34900, rating: 4.7, featured: true, img: IMAGES[14], level: 'Intermediate' },
    { title: 'System Design Interview Mastery', slug: 'system-design-interview-2026', summary: 'Design scalable systems for FAANG-style interviews.', hours: 50, price: 29900, rating: 4.9, featured: true, img: IMAGES[0], level: 'Advanced' },
    { title: 'DevOps for Software Engineers', slug: 'devops-software-engineers-2026', summary: 'CI/CD, Docker, Kubernetes basics for developers.', hours: 60, price: 31900, rating: 4.7, featured: false, img: IMAGES[1], level: 'Intermediate' },
    { title: 'TypeScript for Enterprise Apps', slug: 'typescript-enterprise-apps-2026', summary: 'Strong typing patterns for large codebases.', hours: 40, price: 22900, rating: 4.6, featured: false, img: IMAGES[2], level: 'Beginner' },
    { title: 'Mobile App Development with Flutter', slug: 'flutter-mobile-development-2026', summary: 'Cross-platform mobile apps with Flutter and Dart.', hours: 70, price: 33900, rating: 4.6, featured: false, img: IMAGES[3], level: 'Intermediate' },
    { title: 'API Design & GraphQL', slug: 'api-design-graphql-2026', summary: 'REST/GraphQL design, versioning, and documentation.', hours: 45, price: 25900, rating: 4.7, featured: false, img: IMAGES[4], level: 'Intermediate' },
    { title: 'Clean Code & Architecture', slug: 'clean-code-architecture-2026', summary: 'SOLID, testing, and maintainable software design.', hours: 35, price: 19900, rating: 4.6, featured: false, img: IMAGES[5], level: 'Beginner' },
    { title: 'Go Programming for Backend', slug: 'go-programming-backend-2026', summary: 'Build high-performance services with Go.', hours: 55, price: 30900, rating: 4.7, featured: false, img: IMAGES[6], level: 'Intermediate' },
    { title: 'Testing & QA Automation', slug: 'testing-qa-automation-2026', summary: 'Unit, integration, and E2E automation for quality.', hours: 50, price: 27900, rating: 4.6, featured: false, img: IMAGES[7], level: 'Beginner' },
    { title: 'Event-Driven Architecture', slug: 'event-driven-architecture-2026', summary: 'Kafka, queues, and eventual consistency patterns.', hours: 55, price: 35900, rating: 4.7, featured: true, img: IMAGES[8], level: 'Advanced' },
    { title: 'Frontend Performance Optimization', slug: 'frontend-performance-2026', summary: 'Core Web Vitals, caching, and rendering strategies.', hours: 35, price: 21900, rating: 4.6, featured: false, img: IMAGES[9], level: 'Intermediate' },
  ],
  hello: [
    { title: 'Career Launch: Tech Foundations', slug: 'career-launch-tech-foundations-2026', summary: 'Foundational IT skills to start your tech career.', hours: 40, price: 14900, rating: 4.5, featured: false, img: IMAGES[0], level: 'Beginner' },
    { title: 'Professional Communication for Tech', slug: 'professional-communication-tech-2026', summary: 'Present, write, and collaborate in tech teams.', hours: 25, price: 9900, rating: 4.5, featured: false, img: IMAGES[1], level: 'Beginner' },
    { title: 'LinkedIn & Personal Branding', slug: 'linkedin-personal-branding-2026', summary: 'Build a job-ready professional brand online.', hours: 20, price: 7900, rating: 4.4, featured: false, img: IMAGES[2], level: 'Beginner' },
    { title: 'Interview Prep Crash Course', slug: 'interview-prep-crash-course-2026', summary: 'Behavioral and technical interview practice.', hours: 30, price: 12900, rating: 4.6, featured: true, img: IMAGES[3], level: 'Beginner' },
    { title: 'Agile & Scrum Essentials', slug: 'agile-scrum-essentials-2026', summary: 'Work effectively in agile product teams.', hours: 25, price: 10900, rating: 4.5, featured: false, img: IMAGES[4], level: 'Beginner' },
    { title: 'Digital Literacy for Professionals', slug: 'digital-literacy-professionals-2026', summary: 'Core digital tools for modern workplaces.', hours: 20, price: 6900, rating: 4.3, featured: false, img: IMAGES[5], level: 'Beginner' },
    { title: 'Remote Work Productivity', slug: 'remote-work-productivity-2026', summary: 'Systems for focus and collaboration remotely.', hours: 15, price: 5900, rating: 4.4, featured: false, img: IMAGES[6], level: 'Beginner' },
    { title: 'Introduction to Programming Logic', slug: 'intro-programming-logic-2026', summary: 'Algorithms and problem-solving without jargon.', hours: 35, price: 11900, rating: 4.5, featured: false, img: IMAGES[7], level: 'Beginner' },
    { title: 'Customer Success for Tech Products', slug: 'customer-success-tech-2026', summary: 'Onboarding, retention, and CS metrics basics.', hours: 30, price: 13900, rating: 4.4, featured: false, img: IMAGES[8], level: 'Beginner' },
    { title: 'Tech Resume & Portfolio Workshop', slug: 'tech-resume-portfolio-2026', summary: 'Craft resumes and portfolios that get interviews.', hours: 20, price: 8900, rating: 4.6, featured: true, img: IMAGES[9], level: 'Beginner' },
    { title: 'Business Fundamentals for Engineers', slug: 'business-fundamentals-engineers-2026', summary: 'How tech creates value in real businesses.', hours: 25, price: 9900, rating: 4.4, featured: false, img: IMAGES[10], level: 'Beginner' },
    { title: 'Soft Skills for IT Professionals', slug: 'soft-skills-it-professionals-2026', summary: 'Stakeholder management and teamwork skills.', hours: 20, price: 7900, rating: 4.4, featured: false, img: IMAGES[11], level: 'Beginner' },
    { title: 'Introduction to Cloud Concepts', slug: 'intro-cloud-concepts-hello-2026', summary: 'Cloud basics for absolute beginners.', hours: 25, price: 9900, rating: 4.5, featured: false, img: IMAGES[12], level: 'Beginner' },
  ],
  workday: [
    { title: 'Workday HCM Core Concepts', slug: 'workday-hcm-core-concepts-2026', summary: 'Navigate and configure core Workday HCM.', hours: 50, price: 39900, rating: 4.7, featured: true, img: IMAGES[0], level: 'Beginner' },
    { title: 'Workday Recruiting Specialist', slug: 'workday-recruiting-specialist-2026', summary: 'Configure recruiting workflows in Workday.', hours: 45, price: 37900, rating: 4.6, featured: true, img: IMAGES[1], level: 'Intermediate' },
    { title: 'Workday Compensation Management', slug: 'workday-compensation-2026', summary: 'Plans, grades, and compensation cycles in Workday.', hours: 40, price: 35900, rating: 4.6, featured: false, img: IMAGES[2], level: 'Intermediate' },
    { title: 'Workday Absence & Time Tracking', slug: 'workday-absence-time-2026', summary: 'Time off, schedules, and time tracking setup.', hours: 40, price: 34900, rating: 4.5, featured: false, img: IMAGES[3], level: 'Intermediate' },
    { title: 'Workday Security Administration', slug: 'workday-security-admin-2026', summary: 'Roles, domains, and secure access in Workday.', hours: 45, price: 38900, rating: 4.7, featured: true, img: IMAGES[4], level: 'Advanced' },
    { title: 'Workday Reporting & Prism Analytics', slug: 'workday-reporting-prism-2026', summary: 'Custom reports and Prism analytics for HR data.', hours: 50, price: 40900, rating: 4.7, featured: true, img: IMAGES[5], level: 'Intermediate' },
    { title: 'Workday Integration Consultant', slug: 'workday-integration-consultant-2026', summary: 'EIB, Studio, and REST integrations with Workday.', hours: 60, price: 44900, rating: 4.8, featured: true, img: IMAGES[6], level: 'Advanced' },
    { title: 'Workday Financials Essentials', slug: 'workday-financials-essentials-2026', summary: 'Core financials configuration on Workday.', hours: 55, price: 42900, rating: 4.6, featured: false, img: IMAGES[7], level: 'Intermediate' },
    { title: 'Workday Benefits Administration', slug: 'workday-benefits-admin-2026', summary: 'Benefits plans and enrollment in Workday.', hours: 40, price: 33900, rating: 4.5, featured: false, img: IMAGES[8], level: 'Intermediate' },
    { title: 'Workday Talent & Performance', slug: 'workday-talent-performance-2026', summary: 'Goals, reviews, and talent processes in Workday.', hours: 40, price: 34900, rating: 4.6, featured: false, img: IMAGES[9], level: 'Intermediate' },
    { title: 'Workday Student Administration', slug: 'workday-student-admin-2026', summary: 'Student foundation modules for higher education.', hours: 45, price: 36900, rating: 4.5, featured: false, img: IMAGES[10], level: 'Intermediate' },
    { title: 'Workday Implementation Methodology', slug: 'workday-implementation-methodology-2026', summary: 'Plan and deliver Workday deployments successfully.', hours: 35, price: 29900, rating: 4.5, featured: false, img: IMAGES[11], level: 'Beginner' },
    { title: 'Workday Advanced Studio Integrations', slug: 'workday-advanced-studio-2026', summary: 'Complex Studio patterns for enterprise integrations.', hours: 55, price: 46900, rating: 4.7, featured: true, img: IMAGES[12], level: 'Advanced' },
    { title: 'Workday Calculated Fields Pro', slug: 'workday-calculated-fields-2026', summary: 'Build robust calculated fields for reports and rules.', hours: 30, price: 24900, rating: 4.6, featured: false, img: IMAGES[13], level: 'Intermediate' },
    { title: 'Workday Payroll Fundamentals', slug: 'workday-payroll-fundamentals-2026', summary: 'Payroll configuration basics for Workday teams.', hours: 50, price: 41900, rating: 4.6, featured: false, img: IMAGES[14], level: 'Intermediate' },
  ],
  // Cloud already has 18 — keep a few extras unused unless count drops
  'cloud-computing': [
    { title: 'AWS Networking Specialty Deep Dive', slug: 'aws-networking-specialty-2026', summary: 'Advanced VPC, Transit Gateway, and hybrid networking.', hours: 60, price: 37900, rating: 4.7, featured: false, img: IMAGES[3], level: 'Advanced' },
    { title: 'FinOps Cloud Cost Optimization', slug: 'finops-cloud-cost-optimization-2026', summary: 'Cut cloud spend with FinOps practices and tooling.', hours: 40, price: 27900, rating: 4.6, featured: false, img: IMAGES[4], level: 'Intermediate' },
  ],
}

async function upsertCourse(categoryId: string, c: CourseDef) {
  await prisma.course.upsert({
    where: { slug: c.slug },
    update: {
      title: c.title,
      summary: c.summary,
      description: `${c.summary} Hands-on labs and interview-ready projects for 2026 roles.`,
      level: c.level,
      durationMin: c.hours * 60,
      priceCents: c.price,
      rating: c.rating,
      published: true,
      featured: c.featured,
      thumbnailUrl: c.img,
      categoryId,
      currency: 'INR',
      language: 'English',
    },
    create: {
      title: c.title,
      slug: c.slug,
      summary: c.summary,
      description: `${c.summary} Hands-on labs and interview-ready projects for 2026 roles.`,
      level: c.level,
      durationMin: c.hours * 60,
      priceCents: c.price,
      rating: c.rating,
      published: true,
      featured: c.featured,
      thumbnailUrl: c.img,
      categoryId,
      currency: 'INR',
      language: 'English',
    },
  })
}

async function main() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  for (const cat of categories) {
    const existing = await prisma.course.count({
      where: { categoryId: cat.id, published: true },
    })
    const need = Math.max(0, TARGET - existing)
    const poolCourses = EXTRA_BY_CATEGORY[cat.slug] ?? []

    console.log(`\n${cat.name}: ${existing} published → need ${need} more`)

    if (need === 0) {
      console.log('  ✓ already at target')
      continue
    }

    // Prefer unused slugs not already in this category (or any slug)
    const existingSlugs = new Set(
      (
        await prisma.course.findMany({
          where: { categoryId: cat.id },
          select: { slug: true },
        })
      ).map((c) => c.slug)
    )

    let added = 0
    for (const course of poolCourses) {
      if (added >= need) break
      if (existingSlugs.has(course.slug)) continue
      await upsertCourse(cat.id, course)
      console.log(`  ✓ ${course.title}`)
      added++
    }

    // If still short, generate generic fillers
    let i = 1
    while (added < need) {
      const slug = `${cat.slug}-professional-course-${i}-2026`
      const exists = await prisma.course.findUnique({ where: { slug } })
      if (!exists) {
        await upsertCourse(cat.id, {
          title: `${cat.name} Professional Course ${i}`,
          slug,
          summary: `Industry-ready ${cat.name} skills for 2026 hiring demand.`,
          hours: 40 + (i % 6) * 5,
          price: 19900 + i * 1000,
          rating: 4.5,
          featured: false,
          img: IMAGES[(i - 1) % IMAGES.length],
          level: i % 3 === 0 ? 'Advanced' : i % 2 === 0 ? 'Intermediate' : 'Beginner',
        })
        console.log(`  ✓ ${cat.name} Professional Course ${i}`)
        added++
      }
      i++
      if (i > 50) break
    }

    const finalCount = await prisma.course.count({
      where: { categoryId: cat.id, published: true },
    })
    console.log(`  → now ${finalCount} published`)
  }

  console.log('\nDone.')
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
