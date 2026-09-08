import type { Instructor } from '@/types';

type CategoryKey =
  | 'artificial-intelligence'
  | 'cloud-computing'
  | 'cybersecurity'
  | 'data-analytics'
  | 'enterprise-applications'
  | 'software-engineering'
  | 'default';

export interface InstructorProfile {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  company: string;
  expertise: string[];
  years: number;
  companies: string[];
  ratingAverage: number;
  ratingCount: number;
  previousRoles: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  certifications: string[];
}

const FIRST = [
  'Aarav', 'Aditi', 'Ananya', 'Arjun', 'Diya', 'Ishaan', 'Kavya', 'Rohan', 'Neha', 'Vihaan',
  'Priya', 'Kabir', 'Meera', 'Dev', 'Saanvi', 'Reyansh', 'Anika', 'Vivaan', 'Myra', 'Ayaan',
  'Riya', 'Shaurya', 'Tara', 'Advait', 'Isha', 'Krish', 'Pooja', 'Yash', 'Nisha', 'Aryan',
  'Sneha', 'Harsh', 'Kriti', 'Nikhil', 'Shruti', 'Varun', 'Pallavi', 'Manish', 'Ritu', 'Siddharth',
  'Anjali', 'Gaurav', 'Divya', 'Abhinav', 'Sonal', 'Rajesh', 'Deepa', 'Amit', 'Swati', 'Kunal',
  'Farah', 'Imran', 'Zara', 'Omar', 'Leila', 'Samir', 'Nadia', 'Hassan', 'Aisha', 'Bilal',
  'Elena', 'Marcus', 'Sofia', 'Daniel', 'Maya', 'Ethan', 'Olivia', 'Noah', 'Chloe', 'Liam',
  'Hannah', 'James', 'Grace', 'Benjamin', 'Ava', 'Lucas', 'Emma', 'Owen', 'Zoe', 'Nathan',
  'Lakshmi', 'Suresh', 'Radhika', 'Pranav', 'Gayatri', 'Vikram', 'Malini', 'Raghav', 'Sunita', 'Ajay',
  'Fatima', 'Karthik', 'Bhavna', 'Naveen', 'Jyoti', 'Ashwin', 'Megha', 'Ramesh', 'Preeti', 'Sanjay',
  'Tanvi', 'Mohit', 'Kirti', 'Anirudh', 'Shalini', 'Vivek', 'Amrita', 'Harshit', 'Nandini', 'Rohit',
  'Sakshi', 'Dhruv', 'Payal', 'Tejas', 'Ira', 'Arnav', 'Mira', 'Kian', 'Esha', 'Parth',
  'Trisha', 'Aakash', 'Simran', 'Uday', 'Chitra', 'Jatin', 'Rhea', 'Sameer', 'Vandana', 'Nikita',
];

const LAST = [
  'Sharma', 'Patel', 'Reddy', 'Iyer', 'Mehta', 'Kapoor', 'Nair', 'Singh', 'Joshi', 'Gupta',
  'Banerjee', 'Chatterjee', 'Desai', 'Malhotra', 'Rao', 'Pillai', 'Khan', 'Ahmed', 'Fernandes', 'D’Souza',
  'Menon', 'Bhat', 'Saxena', 'Verma', 'Agarwal', 'Chopra', 'Bansal', 'Kulkarni', 'Shetty', 'Trivedi',
  'Mukherjee', 'Das', 'Pandey', 'Thakur', 'Jain', 'Bose', 'Ghosh', 'Naidu', 'Hegde', 'Kaur',
  'Williams', 'Chen', 'Park', 'Garcia', 'Nguyen', 'Brooks', 'Foster', 'Hayes', 'Morgan', 'Reed',
];

const AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c17226555e?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80',
];

const COMPANIES = [
  'Accenture', 'Deloitte', 'Microsoft', 'Amazon', 'Google', 'Infosys', 'TCS', 'Wipro',
  'IBM', 'Oracle', 'SAP', 'Salesforce', 'Capgemini', 'Cognizant', 'PwC', 'EY',
  'Cisco', 'VMware', 'ServiceNow', 'Adobe', 'Uber', 'Flipkart', 'Razorpay', 'Freshworks',
];

type CatPack = {
  titles: string[];
  expertise: string[][];
  roleTitles: string[];
  certs: string[];
  focus: string;
};

const BY_CATEGORY: Record<CategoryKey, CatPack> = {
  'artificial-intelligence': {
    titles: [
      'Lead Generative AI Instructor',
      'Senior LLM Engineering Coach',
      'AI Solutions Architect & Mentor',
      'GenAI Adoption Lead',
      'Principal ML / RAG Instructor',
    ],
    expertise: [
      ['LLM Apps', 'RAG', 'Prompt Engineering', 'LangChain', 'Eval Design'],
      ['Agentic AI', 'Tool Calling', 'Vector DBs', 'Python', 'Azure OpenAI'],
      ['MLOps', 'Fine-tuning', 'Guardrails', 'FastAPI', 'Observability'],
    ],
    roleTitles: ['AI Solutions Architect', 'GenAI Engineer', 'ML Engineer', 'AI Product Lead'],
    certs: ['Azure AI-900', 'AWS ML Specialty', 'Google Professional ML Engineer', 'DeepLearning.AI'],
    focus: 'production GenAI systems, RAG pipelines, and enterprise AI adoption',
  },
  'cloud-computing': {
    titles: [
      'Principal Cloud Architect Instructor',
      'AWS Solutions Architect Mentor',
      'Azure DevOps & Platform Coach',
      'Kubernetes Platform Instructor',
      'Multi-Cloud Infrastructure Lead',
    ],
    expertise: [
      ['AWS', 'Terraform', 'Kubernetes', 'CI/CD', 'Networking'],
      ['Azure', 'AKS', 'DevOps', 'IaC', 'Observability'],
      ['GCP', 'GKE', 'Cloud Security', 'Cost Optimization', 'SRE'],
    ],
    roleTitles: ['Cloud Architect', 'DevOps Engineer', 'Platform Engineer', 'SRE'],
    certs: ['AWS Solutions Architect Pro', 'Azure Administrator', 'CKA', 'Terraform Associate'],
    focus: 'cloud architecture, platform engineering, and reliable production deployments',
  },
  cybersecurity: {
    titles: [
      'Zero Trust Security Instructor',
      'Cloud Security & DevSecOps Mentor',
      'Senior Cyber Defense Coach',
      'Identity & Access Specialist Trainer',
      'SOC & Threat Intel Instructor',
    ],
    expertise: [
      ['Zero Trust', 'IAM', 'SIEM', 'Cloud Security', 'DevSecOps'],
      ['Threat Modeling', 'SOC Ops', 'Incident Response', 'OWASP', 'Compliance'],
      ['Network Security', 'Vulnerability Mgmt', 'Pentest Basics', 'KMS', 'Secrets'],
    ],
    roleTitles: ['Security Engineer', 'Cloud Security Architect', 'SOC Analyst', 'DevSecOps Lead'],
    certs: ['CompTIA Security+', 'CISSP', 'AWS Security Specialty', 'Azure Security Engineer'],
    focus: 'practical cyber defense, cloud security controls, and secure delivery pipelines',
  },
  'data-analytics': {
    titles: [
      'Lead Data Analytics Instructor',
      'Business Intelligence Mentor',
      'Senior Data Engineering Coach',
      'Power BI & Analytics Trainer',
      'Analytics Translation Specialist',
    ],
    expertise: [
      ['SQL', 'Power BI', 'Python', 'Data Modeling', 'Dashboards'],
      ['Spark', 'Databricks', 'ETL', 'Warehouse Design', 'dbt'],
      ['Excel', 'Storytelling', 'KPI Design', 'Stakeholder Comms', 'Forecasting'],
    ],
    roleTitles: ['Data Analyst', 'BI Developer', 'Data Engineer', 'Analytics Lead'],
    certs: ['Power BI Data Analyst', 'Google Data Analytics', 'Databricks Associate', 'AWS Data Analytics'],
    focus: 'analytics that drive decisions—from clean data pipelines to executive-ready insights',
  },
  'enterprise-applications': {
    titles: [
      'Enterprise Apps Transformation Coach',
      'Salesforce Solution Architect Mentor',
      'Workday / ERP Delivery Instructor',
      'CRM Implementation Lead Trainer',
      'Business Process Automation Mentor',
    ],
    expertise: [
      ['Salesforce', 'Apex', 'Flows', 'Integration', 'Admin'],
      ['Workday', 'ERP', 'Process Design', 'Change Mgmt', 'Reporting'],
      ['ServiceNow', 'ITSM', 'Workflow', 'Stakeholder Mgmt', 'UAT'],
    ],
    roleTitles: ['Salesforce Consultant', 'ERP Analyst', 'Business Systems Lead', 'Solution Architect'],
    certs: ['Salesforce Admin', 'Salesforce Platform App Builder', 'ITIL Foundation', 'Agile BA'],
    focus: 'enterprise platforms, process redesign, and successful go-lives for business teams',
  },
  'software-engineering': {
    titles: [
      'Full-Stack Engineering Instructor',
      'Senior Software Architecture Mentor',
      'Modern Web Development Coach',
      'Backend Systems Lead Trainer',
      'Product Engineering Instructor',
    ],
    expertise: [
      ['React', 'Node.js', 'TypeScript', 'APIs', 'Testing'],
      ['System Design', 'PostgreSQL', 'Docker', 'CI/CD', 'Clean Code'],
      ['Next.js', 'GraphQL', 'Auth', 'Performance', 'Observability'],
    ],
    roleTitles: ['Full-Stack Engineer', 'Backend Lead', 'Frontend Engineer', 'Tech Lead'],
    certs: ['AWS Developer Associate', 'Professional Scrum Developer', 'CKAD', 'MongoDB Associate'],
    focus: 'shipping reliable full-stack products with modern engineering practices',
  },
  default: {
    titles: [
      'Lead Industry Instructor',
      'Senior Technology Mentor',
      'Professional Skills Coach',
      'Career-Ready Tech Trainer',
      'Applied Learning Specialist',
    ],
    expertise: [
      ['Problem Solving', 'Delivery', 'Collaboration', 'Tools', 'Interview Prep'],
      ['Agile', 'Documentation', 'Stakeholder Comms', 'Labs', 'Portfolio'],
      ['Cloud Basics', 'Data Literacy', 'Automation', 'Security Hygiene', 'AI Assist'],
    ],
    roleTitles: ['Consultant', 'Specialist', 'Analyst', 'Engineer'],
    certs: ['PMP', 'Scrum Master', 'ITIL Foundation', 'Google Career Certificate'],
    focus: 'job-ready skills, hands-on labs, and interview-ready project work',
  },
};

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function resolveInstructorCategory(course: {
  slug?: string;
  title?: string;
  category?: { slug?: string; name?: string } | null;
}): CategoryKey {
  const slug = (course.category?.slug || '').toLowerCase();
  if (slug in BY_CATEGORY) return slug as CategoryKey;

  const name = (course.category?.name || '').toLowerCase();
  const title = `${course.title || ''} ${course.slug || ''}`.toLowerCase();
  const blob = `${name} ${title}`;

  if (blob.includes('artificial') || blob.includes(' genai') || blob.includes('llm') || blob.includes('prompt') || /(^|-)ai(-|$)/.test(course.slug || '')) {
    return 'artificial-intelligence';
  }
  if (blob.includes('cloud') || blob.includes('aws') || blob.includes('azure') || blob.includes('kubernetes')) {
    return 'cloud-computing';
  }
  if (blob.includes('cyber') || blob.includes('security') || blob.includes('zero-trust') || blob.includes('devsecops')) {
    return 'cybersecurity';
  }
  if (blob.includes('data') || blob.includes('analytics') || blob.includes('spark') || blob.includes('databricks') || blob.includes('power-bi')) {
    return 'data-analytics';
  }
  if (blob.includes('salesforce') || blob.includes('workday') || blob.includes('enterprise') || blob.includes('servicenow')) {
    return 'enterprise-applications';
  }
  if (blob.includes('software') || blob.includes('full-stack') || blob.includes('web') || blob.includes('react') || blob.includes('node')) {
    return 'software-engineering';
  }
  return 'default';
}

/** Stable unique index for a course slug across a large name pool. */
export function instructorIndexForSlug(slug: string, poolSize = FIRST.length * LAST.length): number {
  return hashString(slug) % poolSize;
}

export function buildInstructorProfile(opts: {
  index: number;
  category: CategoryKey;
  courseTitle?: string;
}): InstructorProfile {
  const { index, category, courseTitle } = opts;
  const pack = BY_CATEGORY[category];
  const first = FIRST[index % FIRST.length];
  const last = LAST[Math.floor(index / FIRST.length) % LAST.length];
  // Avoid accidental same first+last collisions for nearby indices
  const name = `${first} ${last}`;

  const years = 8 + (index % 12);
  const title = pack.titles[index % pack.titles.length];
  const expertise = pack.expertise[index % pack.expertise.length];
  const companies = [
    COMPANIES[index % COMPANIES.length],
    COMPANIES[(index + 5) % COMPANIES.length],
    COMPANIES[(index + 11) % COMPANIES.length],
    COMPANIES[(index + 17) % COMPANIES.length],
  ];
  const company = companies[0];
  const avatar = AVATARS[index % AVATARS.length];
  const ratingAverage = Math.round((4.5 + (index % 5) * 0.1) * 10) / 10;
  const ratingCount = 900 + ((index * 137) % 4200);

  const r0 = pack.roleTitles[index % pack.roleTitles.length];
  const r1 = pack.roleTitles[(index + 1) % pack.roleTitles.length];
  const r2 = pack.roleTitles[(index + 2) % pack.roleTitles.length];

  const previousRoles = [
    {
      title: r0,
      company: companies[0],
      duration: `${2019 + (index % 3)} – Present`,
      description: `Leads delivery and mentoring focused on ${pack.focus}.`,
    },
    {
      title: r1,
      company: companies[1],
      duration: `${2015 + (index % 3)} – ${2019 + (index % 3)}`,
      description: 'Owned end-to-end initiatives and coached cross-functional teams.',
    },
    {
      title: r2,
      company: companies[2],
      duration: `${2011 + (index % 3)} – ${2015 + (index % 3)}`,
      description: 'Built foundational delivery experience across client programs.',
    },
  ];

  const certifications = [
    pack.certs[index % pack.certs.length],
    pack.certs[(index + 1) % pack.certs.length],
    pack.certs[(index + 2) % pack.certs.length],
    pack.certs[(index + 3) % pack.certs.length],
  ];

  const topic = courseTitle ? ` for ${courseTitle}` : '';
  const bio =
    `${years}+ years in IT specializing in ${pack.focus}. ` +
    `${name.split(' ')[0]} has delivered programs at ${companies.slice(0, 3).join(', ')}, ` +
    `and now trains professionals${topic} with hands-on labs and interview-ready projects.`;

  return {
    name,
    title,
    bio,
    avatar,
    company,
    expertise,
    years,
    companies,
    ratingAverage,
    ratingCount,
    previousRoles,
    certifications,
  };
}

export function getInstructorProfileForCourse(course: {
  slug: string;
  title?: string;
  category?: { slug?: string; name?: string } | null;
}): InstructorProfile {
  const category = resolveInstructorCategory(course);
  const index = instructorIndexForSlug(course.slug);
  return buildInstructorProfile({ index, category, courseTitle: course.title });
}

export function toUiInstructor(profile: InstructorProfile, id?: string): Instructor {
  return {
    id: id || `instructor-${hashString(profile.name)}`,
    name: profile.name,
    title: profile.title,
    bio: profile.bio,
    profileImageUrl: profile.avatar,
    expertise: profile.expertise,
    experience: {
      years: profile.years,
      companies: profile.companies,
    },
    socialLinks: {},
    courseIds: [],
    rating: {
      average: profile.ratingAverage,
      count: profile.ratingCount,
    },
    professionalBackground: {
      previousRoles: profile.previousRoles,
      certifications: profile.certifications,
    },
  };
}
