import type { Course } from '@/types';
import type { CareerPath } from '@/components/CareerPathway';

export type DemandLevel = 'Rising' | 'High' | 'Very High' | 'Explosive';

export interface TrendPoint {
  label: string;
  value: number; // 0–100 Google Trends-style interest
}

export interface OfficialCert {
  title: string;
  issuer: string;
  description: string;
  badge?: string;
}

export interface HiringCompany {
  name: string;
  roles: string[];
}

export interface CourseAboutInsights {
  aboutExtended: string;
  demandLevel: DemandLevel;
  demandSummary: string;
  demandStats: { label: string; value: string; hint: string }[];
  targetRoles: { title: string; level: string; salary: string }[];
  googleTrends: {
    keyword: string;
    region: string;
    points: TrendPoint[];
    insight: string;
  };
  officialCerts: OfficialCert[];
  hiringCompanies: HiringCompany[];
  careerPaths: CareerPath[];
}

type CategoryKey =
  | 'artificial-intelligence'
  | 'cloud-computing'
  | 'cybersecurity'
  | 'data-analytics'
  | 'enterprise-applications'
  | 'software-engineering'
  | 'default';

const TREND_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function trendCurve(base: number[], amp = 1): TrendPoint[] {
  return TREND_MONTHS.map((label, i) => ({
    label,
    value: Math.min(100, Math.round(base[i] * amp)),
  }));
}

const BY_CATEGORY: Record<CategoryKey, Omit<CourseAboutInsights, 'aboutExtended'>> = {
  'artificial-intelligence': {
    demandLevel: 'Explosive',
    demandSummary:
      'Generative AI hiring is among the fastest-growing tech tracks in 2025–2026. Roles that combine LLM apps, RAG, and production MLOps are short-staffed across product and consulting firms.',
    demandStats: [
      { label: 'Role growth YoY', value: '+62%', hint: 'LinkedIn / Naukri GenAI titles' },
      { label: 'Open roles (India)', value: '18k+', hint: 'Active GenAI / LLM postings' },
      { label: 'Avg. package uplift', value: '25–40%', hint: 'Vs. general software roles' },
      { label: 'Skill scarcity', value: 'Very High', hint: 'Production RAG + eval talent' },
    ],
    targetRoles: [
      { title: 'Generative AI Engineer', level: 'Mid', salary: '₹12–28 LPA' },
      { title: 'LLM / RAG Engineer', level: 'Mid–Senior', salary: '₹15–35 LPA' },
      { title: 'AI/ML Engineer', level: 'Mid', salary: '₹10–24 LPA' },
      { title: 'Prompt / AI Solutions Engineer', level: 'Entry–Mid', salary: '₹8–18 LPA' },
      { title: 'AI Product Engineer', level: 'Mid', salary: '₹14–30 LPA' },
      { title: 'AI Solutions Architect', level: 'Senior', salary: '₹28–55 LPA' },
    ],
    googleTrends: {
      keyword: 'Generative AI / LLM Engineer',
      region: 'India + Global',
      points: trendCurve([28, 32, 38, 45, 52, 58, 64, 71, 78, 85, 92, 98]),
      insight:
        'Search interest for Generative AI engineering roles has roughly tripled over the last 12 months, with peaks around major model releases and enterprise GenAI RFPs.',
    },
    officialCerts: [
      {
        title: 'Google Cloud — Generative AI Leader / ML Engineer path',
        issuer: 'Google Cloud',
        description: 'Prep support for Google Cloud GenAI & ML professional tracks used by enterprise clients.',
      },
      {
        title: 'AWS Certified AI Practitioner / ML Specialty',
        issuer: 'Amazon Web Services',
        description: 'Aligned labs and mentor sessions for AWS AI certification readiness.',
      },
      {
        title: 'Microsoft Azure AI Engineer Associate (AI-102)',
        issuer: 'Microsoft',
        description: 'Azure OpenAI, Cognitive Services, and responsible AI mapped to exam objectives.',
      },
      {
        title: 'NVIDIA DLI — Generative AI / RAG',
        issuer: 'NVIDIA',
        description: 'Hands-on DLI-style labs for GPU-accelerated GenAI and retrieval systems.',
      },
    ],
    hiringCompanies: [
      { name: 'Google', roles: ['GenAI Engineer', 'ML Engineer'] },
      { name: 'Microsoft', roles: ['Azure AI Engineer', 'Applied Scientist'] },
      { name: 'Amazon', roles: ['Applied AI Engineer', 'ML Engineer'] },
      { name: 'IBM', roles: ['AI Engineer', 'Watson / GenAI Consultant'] },
      { name: 'Accenture', roles: ['GenAI Developer', 'AI Consultant'] },
      { name: 'Deloitte', roles: ['AI Engineer', 'AI Risk Consultant'] },
      { name: 'Infosys', roles: ['GenAI Developer', 'AI Specialist'] },
      { name: 'TCS', roles: ['AI Engineer', 'LLM Developer'] },
      { name: 'Cognizant', roles: ['GenAI Engineer', 'AI Solutions'] },
      { name: 'Capgemini', roles: ['AI Engineer', 'Data & AI Consultant'] },
      { name: 'Wipro', roles: ['GenAI Developer', 'ML Engineer'] },
      { name: 'NVIDIA', roles: ['Solutions Architect', 'AI Engineer'] },
    ],
    careerPaths: [
      {
        id: 'genai-eng',
        title: 'Generative AI Engineer',
        description: 'Build production LLM apps with RAG, tools, and evaluation.',
        level: 'mid',
        salaryRange: { min: 1200000, max: 2800000, currency: '₹' },
        timeToRole: '4–8 months',
        demandLevel: 'very-high',
        skills: ['RAG', 'LangChain', 'Prompt systems', 'Python'],
        companies: ['Google', 'Microsoft', 'Accenture', 'IBM'],
        growthRate: '40%+ annually',
        jobOpenings: 8500,
        nextRoles: ['AI Solutions Architect', 'Staff AI Engineer'],
      },
      {
        id: 'llm-eng',
        title: 'LLM / RAG Engineer',
        description: 'Specialize in retrieval quality, fine-tuning, and observability.',
        level: 'senior',
        salaryRange: { min: 1800000, max: 3500000, currency: '₹' },
        timeToRole: '8–14 months',
        demandLevel: 'very-high',
        skills: ['Embeddings', 'Vector DBs', 'Eval harnesses', 'LoRA'],
        companies: ['Amazon', 'NVIDIA', 'Deloitte', 'Infosys'],
        growthRate: '35% annually',
        jobOpenings: 4200,
        nextRoles: ['Principal AI Engineer', 'AI Platform Lead'],
      },
    ],
  },

  'cloud-computing': {
    demandLevel: 'Very High',
    demandSummary:
      'Cloud architects and DevOps engineers remain core hiring needs as enterprises migrate and modernize platforms on AWS, Azure, and GCP.',
    demandStats: [
      { label: 'Role growth YoY', value: '+28%', hint: 'Cloud architect / DevOps titles' },
      { label: 'Open roles (India)', value: '22k+', hint: 'Cloud & platform engineering' },
      { label: 'Avg. package uplift', value: '20–35%', hint: 'With multi-cloud skills' },
      { label: 'Skill scarcity', value: 'High', hint: 'Landing zones + FinOps' },
    ],
    targetRoles: [
      { title: 'Cloud Solutions Architect', level: 'Senior', salary: '₹18–40 LPA' },
      { title: 'DevOps / Platform Engineer', level: 'Mid–Senior', salary: '₹12–28 LPA' },
      { title: 'Site Reliability Engineer', level: 'Mid', salary: '₹14–32 LPA' },
      { title: 'Cloud Security Engineer', level: 'Mid', salary: '₹15–30 LPA' },
    ],
    googleTrends: {
      keyword: 'Cloud Architect / AWS Azure',
      region: 'India + Global',
      points: trendCurve([48, 50, 52, 55, 58, 60, 63, 66, 70, 74, 78, 82]),
      insight: 'Cloud architecture search interest stays high year-round, with spikes around certification cycles and enterprise migration RFPs.',
    },
    officialCerts: [
      { title: 'AWS Solutions Architect Associate / Professional', issuer: 'Amazon Web Services', description: 'Exam-aligned architecture labs and mock tests.' },
      { title: 'Microsoft Azure Administrator / Architect', issuer: 'Microsoft', description: 'AZ-104 / AZ-305 readiness with hands-on landing zones.' },
      { title: 'Google Cloud Professional Cloud Architect', issuer: 'Google Cloud', description: 'GCP architecture case studies and practice exams.' },
    ],
    hiringCompanies: [
      { name: 'Amazon', roles: ['Cloud Architect', 'DevOps'] },
      { name: 'Microsoft', roles: ['Azure Engineer', 'SRE'] },
      { name: 'Google', roles: ['Cloud Engineer', 'SRE'] },
      { name: 'Accenture', roles: ['Cloud Consultant'] },
      { name: 'Infosys', roles: ['Cloud Developer'] },
      { name: 'TCS', roles: ['Cloud Engineer'] },
      { name: 'Deloitte', roles: ['Cloud Architect'] },
      { name: 'Capgemini', roles: ['Cloud Consultant'] },
    ],
    careerPaths: [
      {
        id: 'cloud-arch',
        title: 'Cloud Solutions Architect',
        description: 'Design secure, scalable multi-account cloud platforms.',
        level: 'senior',
        salaryRange: { min: 1800000, max: 4000000, currency: '₹' },
        timeToRole: '6–12 months',
        demandLevel: 'very-high',
        skills: ['AWS/Azure', 'IaC', 'Networking', 'Security'],
        companies: ['Amazon', 'Accenture', 'Deloitte'],
        growthRate: '22% annually',
        jobOpenings: 6100,
        nextRoles: ['Principal Architect', 'Cloud Practice Lead'],
      },
    ],
  },

  cybersecurity: {
    demandLevel: 'Very High',
    demandSummary: 'Cybersecurity talent demand remains elevated with SOC, cloud security, and ethical hacking roles across BFSI and IT services.',
    demandStats: [
      { label: 'Role growth YoY', value: '+32%', hint: 'SOC / Cloud Sec titles' },
      { label: 'Open roles (India)', value: '12k+', hint: 'Security analyst & engineer' },
      { label: 'Avg. package uplift', value: '18–30%', hint: 'With certs + labs' },
      { label: 'Skill scarcity', value: 'High', hint: 'Cloud + AppSec combo' },
    ],
    targetRoles: [
      { title: 'SOC Analyst', level: 'Entry–Mid', salary: '₹5–12 LPA' },
      { title: 'Cybersecurity Engineer', level: 'Mid', salary: '₹10–22 LPA' },
      { title: 'Penetration Tester', level: 'Mid', salary: '₹12–25 LPA' },
      { title: 'Cloud Security Engineer', level: 'Mid–Senior', salary: '₹15–32 LPA' },
    ],
    googleTrends: {
      keyword: 'Cybersecurity / Ethical Hacking',
      region: 'India + Global',
      points: trendCurve([42, 45, 48, 50, 55, 58, 62, 65, 70, 74, 78, 84]),
      insight: 'Interest in cybersecurity careers continues to climb with rising breach news and compliance mandates.',
    },
    officialCerts: [
      { title: 'CompTIA Security+', issuer: 'CompTIA', description: 'Foundational security certification prep.' },
      { title: 'CEH / OSCP Track Support', issuer: 'EC-Council / Offensive Security', description: 'Lab-heavy prep for ethical hacking certifications.' },
      { title: 'ISC2 SSCP / CISSP pathway', issuer: 'ISC2', description: 'Guidance for professional security certifications.' },
    ],
    hiringCompanies: [
      { name: 'Deloitte', roles: ['Cyber Analyst'] },
      { name: 'Accenture', roles: ['Security Consultant'] },
      { name: 'IBM', roles: ['Security Engineer'] },
      { name: 'TCS', roles: ['SOC Analyst'] },
      { name: 'Infosys', roles: ['Cybersecurity'] },
      { name: 'Wipro', roles: ['Security Engineer'] },
      { name: 'Cognizant', roles: ['AppSec Engineer'] },
      { name: 'Capgemini', roles: ['SOC Analyst'] },
    ],
    careerPaths: [],
  },

  'data-analytics': {
    demandLevel: 'High',
    demandSummary: 'Data analytics and data science roles stay strong as companies invest in BI, ML, and decision intelligence.',
    demandStats: [
      { label: 'Role growth YoY', value: '+24%', hint: 'Analyst / DS titles' },
      { label: 'Open roles (India)', value: '16k+', hint: 'Analytics & BI' },
      { label: 'Avg. package uplift', value: '15–28%', hint: 'With SQL + Python + BI' },
      { label: 'Skill scarcity', value: 'Medium–High', hint: 'Analytics + GenAI' },
    ],
    targetRoles: [
      { title: 'Data Analyst', level: 'Entry–Mid', salary: '₹5–14 LPA' },
      { title: 'Business Intelligence Analyst', level: 'Mid', salary: '₹8–18 LPA' },
      { title: 'Data Scientist', level: 'Mid', salary: '₹12–28 LPA' },
      { title: 'Analytics Engineer', level: 'Mid', salary: '₹12–24 LPA' },
    ],
    googleTrends: {
      keyword: 'Data Science / Data Analyst',
      region: 'India + Global',
      points: trendCurve([55, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76]),
      insight: 'Data career searches remain consistently high, with growing interest in analytics + AI hybrid roles.',
    },
    officialCerts: [
      { title: 'Google Data Analytics Certificate', issuer: 'Google', description: 'Career-certificate aligned curriculum support.' },
      { title: 'Microsoft Power BI Data Analyst', issuer: 'Microsoft', description: 'PL-300 exam-oriented practice.' },
      { title: 'AWS Data Analytics Specialty path', issuer: 'Amazon Web Services', description: 'Cloud analytics architecture readiness.' },
    ],
    hiringCompanies: [
      { name: 'Accenture', roles: ['Data Analyst'] },
      { name: 'Deloitte', roles: ['Analytics Consultant'] },
      { name: 'IBM', roles: ['Data Scientist'] },
      { name: 'Infosys', roles: ['BI Analyst'] },
      { name: 'TCS', roles: ['Data Engineer'] },
      { name: 'Cognizant', roles: ['Analytics'] },
      { name: 'Amazon', roles: ['Business Analyst'] },
      { name: 'Microsoft', roles: ['Data Analyst'] },
    ],
    careerPaths: [],
  },

  'enterprise-applications': {
    demandLevel: 'High',
    demandSummary: 'Enterprise app specialists (Salesforce, SAP, Workday) remain in demand for digital transformation programs.',
    demandStats: [
      { label: 'Role growth YoY', value: '+18%', hint: 'CRM / ERP consultants' },
      { label: 'Open roles (India)', value: '9k+', hint: 'Salesforce / Workday / SAP' },
      { label: 'Avg. package uplift', value: '20–35%', hint: 'With platform certs' },
      { label: 'Skill scarcity', value: 'High', hint: 'Certified consultants' },
    ],
    targetRoles: [
      { title: 'Salesforce Developer / Admin', level: 'Mid', salary: '₹8–22 LPA' },
      { title: 'Workday Consultant', level: 'Mid', salary: '₹12–28 LPA' },
      { title: 'SAP Functional Consultant', level: 'Mid–Senior', salary: '₹10–25 LPA' },
      { title: 'Enterprise Solutions Lead', level: 'Senior', salary: '₹22–40 LPA' },
    ],
    googleTrends: {
      keyword: 'Salesforce / Workday Consultant',
      region: 'India + Global',
      points: trendCurve([40, 42, 44, 46, 48, 50, 53, 56, 58, 62, 65, 68]),
      insight: 'Enterprise platform certifications continue to drive steady search and hiring demand.',
    },
    officialCerts: [
      { title: 'Salesforce Administrator / Developer', issuer: 'Salesforce', description: 'Trailhead-aligned exam prep and project labs.' },
      { title: 'Workday HCM / Integration pathway', issuer: 'Workday', description: 'Implementation-focused coaching for client projects.' },
      { title: 'SAP Certification prep support', issuer: 'SAP', description: 'Module-specific readiness with practice scenarios.' },
    ],
    hiringCompanies: [
      { name: 'Accenture', roles: ['Salesforce Consultant'] },
      { name: 'Deloitte', roles: ['Workday Consultant'] },
      { name: 'IBM', roles: ['SAP Consultant'] },
      { name: 'Infosys', roles: ['Salesforce Developer'] },
      { name: 'TCS', roles: ['ERP Consultant'] },
      { name: 'Cognizant', roles: ['CRM Developer'] },
      { name: 'Capgemini', roles: ['Enterprise Apps'] },
      { name: 'Wipro', roles: ['Salesforce Admin'] },
    ],
    careerPaths: [],
  },

  'software-engineering': {
    demandLevel: 'High',
    demandSummary: 'Full-stack and cloud-native engineers remain core to product teams, especially with TypeScript, Next.js, and API skills.',
    demandStats: [
      { label: 'Role growth YoY', value: '+20%', hint: 'Full-stack / backend' },
      { label: 'Open roles (India)', value: '30k+', hint: 'Software engineering' },
      { label: 'Avg. package uplift', value: '15–25%', hint: 'With strong portfolio' },
      { label: 'Skill scarcity', value: 'Medium', hint: 'Production TypeScript' },
    ],
    targetRoles: [
      { title: 'Full Stack Developer', level: 'Mid', salary: '₹8–20 LPA' },
      { title: 'Frontend Engineer (React/Next)', level: 'Mid', salary: '₹8–18 LPA' },
      { title: 'Backend Engineer', level: 'Mid', salary: '₹10–22 LPA' },
      { title: 'Software Engineer II / III', level: 'Mid–Senior', salary: '₹15–35 LPA' },
    ],
    googleTrends: {
      keyword: 'Full Stack Developer / Next.js',
      region: 'India + Global',
      points: trendCurve([50, 52, 54, 56, 58, 60, 63, 66, 68, 72, 75, 78]),
      insight: 'Interest in modern full-stack stacks (TypeScript, Next.js) continues a steady upward trend.',
    },
    officialCerts: [
      { title: 'Meta Front-End / Full-Stack Certificate support', issuer: 'Meta / Coursera path', description: 'Portfolio + assessment aligned coaching.' },
      { title: 'AWS Cloud Practitioner / Developer Associate', issuer: 'Amazon Web Services', description: 'Deploy and operate full-stack apps on AWS.' },
    ],
    hiringCompanies: [
      { name: 'Amazon', roles: ['SDE'] },
      { name: 'Microsoft', roles: ['Software Engineer'] },
      { name: 'Google', roles: ['SWE'] },
      { name: 'Infosys', roles: ['Full Stack'] },
      { name: 'TCS', roles: ['Developer'] },
      { name: 'Accenture', roles: ['Application Developer'] },
      { name: 'Cognizant', roles: ['Full Stack'] },
      { name: 'Wipro', roles: ['Software Engineer'] },
    ],
    careerPaths: [],
  },

  default: {
    demandLevel: 'High',
    demandSummary: 'This skill area continues to see strong employer demand across product companies and IT services.',
    demandStats: [
      { label: 'Role growth YoY', value: '+20%', hint: 'Industry average' },
      { label: 'Open roles', value: '10k+', hint: 'Related titles' },
      { label: 'Package uplift', value: '15–25%', hint: 'With projects + certs' },
      { label: 'Skill scarcity', value: 'Medium–High', hint: 'Job-ready talent' },
    ],
    targetRoles: [
      { title: 'Associate Engineer', level: 'Entry', salary: '₹4–10 LPA' },
      { title: 'Software / Domain Specialist', level: 'Mid', salary: '₹8–18 LPA' },
      { title: 'Senior Specialist / Lead', level: 'Senior', salary: '₹18–35 LPA' },
    ],
    googleTrends: {
      keyword: 'Professional certification training',
      region: 'India + Global',
      points: trendCurve([40, 42, 45, 48, 50, 54, 58, 60, 64, 68, 72, 75]),
      insight: 'Search interest for job-ready professional certifications continues to rise through the year.',
    },
    officialCerts: [
      { title: 'Industry certification prep support', issuer: 'Partner vendors', description: 'We map your learning path to official vendor exams where applicable.' },
      { title: 'Cloud Certification Completion Certificate', issuer: 'Cloud Certification', description: 'Shareable certificate on successful course completion.' },
    ],
    hiringCompanies: [
      { name: 'Accenture', roles: ['Consultant'] },
      { name: 'Infosys', roles: ['Engineer'] },
      { name: 'TCS', roles: ['Developer'] },
      { name: 'Deloitte', roles: ['Analyst'] },
      { name: 'Cognizant', roles: ['Associate'] },
      { name: 'Wipro', roles: ['Engineer'] },
      { name: 'Capgemini', roles: ['Consultant'] },
      { name: 'IBM', roles: ['Specialist'] },
    ],
    careerPaths: [],
  },
};

function resolveCategoryKey(course: Course): CategoryKey {
  const slug = (course.category?.slug || '').toLowerCase();
  if (slug in BY_CATEGORY) return slug as CategoryKey;
  // soft match by name
  const name = (course.category?.name || '').toLowerCase();
  if (name.includes('artificial') || name.includes('ai')) return 'artificial-intelligence';
  if (name.includes('cloud')) return 'cloud-computing';
  if (name.includes('cyber') || name.includes('security')) return 'cybersecurity';
  if (name.includes('data')) return 'data-analytics';
  if (name.includes('salesforce') || name.includes('workday') || name.includes('enterprise')) return 'enterprise-applications';
  if (name.includes('software') || name.includes('full stack')) return 'software-engineering';
  return 'default';
}

export function getCourseAboutInsights(course: Course): CourseAboutInsights {
  const key = resolveCategoryKey(course);
  const base = BY_CATEGORY[key];

  const aboutExtended =
    `${course.longDescription || course.shortDescription} ` +
    `This is a ${course.level?.toLowerCase() || 'professional'}-level program designed for working professionals. ` +
    `Expect a demanding, project-heavy pace (~${course.duration?.hours || 40} hours) with labs, assessments, and portfolio work so you can interview for real roles—not just collect slides.`;

  // GenAI slug-specific keyword tweak
  const googleTrends = { ...base.googleTrends };
  if (course.slug?.includes('generative-ai') || course.slug?.includes('genai')) {
    googleTrends.keyword = 'Generative AI Engineering / RAG';
  }

  return {
    ...base,
    aboutExtended,
    googleTrends,
  };
}
