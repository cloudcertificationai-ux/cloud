import {
  Course,
  Instructor,
  CourseCategory,
  StudentTestimonial,
  SuccessMetrics,
  CohortInfo,
  EnterpriseSolution,
  CompanyLogo,
  CaseStudy,
} from '@/types';

export const categories: CourseCategory[] = [
  {
    id: '1',
    name: 'Web Development',
    slug: 'web-development',
    description: 'Master job-ready full-stack development skills for high-demand tech roles',
    color: '#3B82F6',
  },
  {
    id: '2',
    name: 'Data Science',
    slug: 'data-science',
    description: 'Build career-advancing expertise in AI, ML, and data analytics for Fortune 500 companies',
    color: '#10B981',
  },
  {
    id: '3',
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Develop industry-certified security skills for leadership roles in enterprise protection',
    color: '#F59E0B',
  },
  {
    id: '4',
    name: 'Cloud Computing',
    slug: 'cloud-computing',
    description: 'Gain cloud architecture expertise for senior engineering and DevOps leadership positions',
    color: '#8B5CF6',
  },
];

export const instructors: Instructor[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Senior Full Stack Developer',
    bio: 'Former Google engineer with 8+ years of experience in web development and cloud architecture. Sarah has led development teams at major tech companies and specializes in building scalable web applications. She is passionate about teaching modern development practices and helping students transition into successful tech careers with average salary increases of 75%.',
    profileImageUrl: '/instructors/sarah-johnson.jpg',
    expertise: ['React', 'Node.js', 'AWS', 'TypeScript'],
    experience: {
      years: 8,
      companies: ['Google', 'Microsoft', 'Stripe'],
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarah-johnson',
      github: 'https://github.com/sarah-johnson',
    },
    courseIds: ['1', '2'],
    rating: {
      average: 4.9,
      count: 1247,
    },
    credentials: ['AWS Certified Solutions Architect', 'Google Cloud Professional', 'Certified Scrum Master'],
    professionalBackground: {
      currentRole: 'Senior Full Stack Developer & Technical Instructor',
      previousRoles: [
        {
          title: 'Senior Software Engineer',
          company: 'Google',
          duration: '2019-2023',
          description: 'Led development of Google Cloud Console features, mentored junior developers, and improved system performance by 40%'
        },
        {
          title: 'Full Stack Developer',
          company: 'Microsoft',
          duration: '2017-2019',
          description: 'Developed Azure portal components and contributed to open-source projects'
        },
        {
          title: 'Software Developer',
          company: 'Stripe',
          duration: '2015-2017',
          description: 'Built payment processing systems and API integrations'
        }
      ],
      education: [
        {
          degree: 'Master of Science in Computer Science',
          institution: 'Stanford University',
          year: '2015'
        },
        {
          degree: 'Bachelor of Science in Software Engineering',
          institution: 'UC Berkeley',
          year: '2013'
        }
      ],
      certifications: [
        'AWS Certified Solutions Architect - Professional',
        'Google Cloud Professional Cloud Architect',
        'Certified Kubernetes Administrator (CKA)',
        'MongoDB Certified Developer'
      ],
      achievements: [
        'Led team that reduced Google Cloud Console load time by 40%',
        'Contributed to 15+ open-source projects with 10K+ GitHub stars',
        'Speaker at React Conf 2022 and AWS re:Invent 2023',
        'Mentored 50+ developers who successfully transitioned to senior roles'
      ]
    }
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    title: 'Data Science Lead',
    bio: 'PhD in Machine Learning with experience at top tech companies and research institutions. Dr. Chen has published 25+ research papers and led data science teams that have built recommendation systems serving millions of users. He specializes in making complex ML concepts accessible to learners at all levels and has helped 200+ professionals transition into senior data science roles with an average salary increase of 85%.',
    profileImageUrl: '/instructors/michael-chen.jpg',
    expertise: ['Python', 'Machine Learning', 'Deep Learning', 'Statistics'],
    experience: {
      years: 12,
      companies: ['Facebook', 'Netflix', 'Stanford University'],
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/michael-chen',
      twitter: 'https://twitter.com/michael_chen_ml',
    },
    courseIds: ['3', '4'],
    rating: {
      average: 4.8,
      count: 892,
    },
    credentials: ['PhD in Machine Learning', 'Google Cloud ML Engineer', 'TensorFlow Developer Certificate'],
    professionalBackground: {
      currentRole: 'Principal Data Scientist & ML Research Lead',
      previousRoles: [
        {
          title: 'Senior Data Scientist',
          company: 'Facebook (Meta)',
          duration: '2020-2024',
          description: 'Led recommendation algorithms team, improved user engagement by 25%, managed $10M+ ML infrastructure budget'
        },
        {
          title: 'Data Science Manager',
          company: 'Netflix',
          duration: '2018-2020',
          description: 'Built personalization systems serving 200M+ users, led team of 12 data scientists'
        },
        {
          title: 'Research Scientist',
          company: 'Stanford University',
          duration: '2015-2018',
          description: 'Conducted cutting-edge research in deep learning and computer vision'
        }
      ],
      education: [
        {
          degree: 'PhD in Machine Learning',
          institution: 'Stanford University',
          year: '2015'
        },
        {
          degree: 'Master of Science in Statistics',
          institution: 'MIT',
          year: '2011'
        },
        {
          degree: 'Bachelor of Science in Mathematics',
          institution: 'Caltech',
          year: '2009'
        }
      ],
      certifications: [
        'Google Cloud Professional ML Engineer',
        'TensorFlow Developer Certificate',
        'AWS Certified Machine Learning - Specialty',
        'Microsoft Azure AI Engineer Associate'
      ],
      achievements: [
        'Published 25+ peer-reviewed papers in top ML conferences (NeurIPS, ICML, ICLR)',
        'Netflix recommendation system improved user retention by 15%',
        'Keynote speaker at PyData, Strata Data Conference, and MLConf',
        'Mentored 100+ data scientists, 80% received promotions within 2 years',
        'Patent holder for 8 machine learning innovations'
      ]
    }
  },
];

export const sampleCourses: Course[] = [
  {
    id: '1',
    title: 'Complete React Developer Bootcamp',
    slug: 'complete-react-developer-bootcamp',
    shortDescription:
      'Master job-ready React skills and land senior developer roles at top tech companies',
    longDescription:
      'A comprehensive React course covering hooks, context, routing, testing, and deployment. Build 5 real-world projects including an e-commerce app that showcases enterprise-level development skills. This program is designed to fast-track your career advancement with industry-recognized certifications and hands-on experience that Fortune 500 companies value.',
    category: categories[0],
    level: 'Intermediate',
    duration: {
      hours: 120,
      weeks: 16,
    },
    price: {
      amount: 299,
      currency: 'USD',
      originalPrice: 399,
    },
    rating: {
      average: 4.7,
      count: 2341,
    },
    thumbnailUrl: '/courses/react-bootcamp.jpg',
    instructorIds: ['1'],
    curriculum: [
      {
        id: '1',
        title: 'React Fundamentals',
        description:
          'Learn the basics of React including components, props, and state',
        order: 1,
        lessons: [
          {
            id: '1',
            title: 'Introduction to React',
            type: 'Video',
            duration: 45,
            isPreview: true,
          },
          {
            id: '2',
            title: 'Your First Component',
            type: 'Video',
            duration: 30,
            isPreview: false,
          },
        ],
        estimatedHours: 8,
      },
    ],
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    mode: 'Self-Paced',
    enrollmentCount: 15420,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01'),
    cohorts: [
      {
        id: 'cohort-1',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-06-15'),
        enrollmentDeadline: new Date('2025-02-10'),
        maxStudents: 50,
        currentEnrollment: 32,
        status: 'Open',
        timeZone: 'EST',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '7:00 PM - 9:00 PM'
        }
      },
      {
        id: 'cohort-2',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-07-01'),
        enrollmentDeadline: new Date('2025-02-25'),
        maxStudents: 50,
        currentEnrollment: 18,
        status: 'Open',
        timeZone: 'PST',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: '6:00 PM - 9:00 PM'
        }
      }
    ]
  },
  {
    id: '2',
    title: 'Full Stack JavaScript Mastery',
    slug: 'full-stack-javascript-mastery',
    shortDescription:
      'Build complete web applications and advance to senior full-stack engineer positions',
    longDescription:
      'Learn to build full-stack applications from scratch using the MERN stack. Includes authentication, database design, and deployment. This career-focused program prepares you for leadership roles in software engineering with real-world projects that demonstrate enterprise-level expertise to hiring managers.',
    category: categories[0],
    level: 'Advanced',
    duration: {
      hours: 180,
      weeks: 24,
    },
    price: {
      amount: 399,
      currency: 'USD',
    },
    rating: {
      average: 4.8,
      count: 1876,
    },
    thumbnailUrl: '/courses/fullstack-js.jpg',
    instructorIds: ['1'],
    curriculum: [],
    tags: ['Node.js', 'Express', 'MongoDB', 'Full Stack'],
    mode: 'Live',
    enrollmentCount: 8932,
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-11-15'),
    cohorts: [
      {
        id: 'cohort-3',
        startDate: new Date('2025-02-20'),
        endDate: new Date('2025-08-20'),
        enrollmentDeadline: new Date('2025-02-15'),
        maxStudents: 30,
        currentEnrollment: 25,
        status: 'Starting Soon',
        timeZone: 'EST',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '8:00 PM - 10:00 PM'
        }
      }
    ]
  },
];

export const testimonials: StudentTestimonial[] = [
  {
    id: '1',
    studentName: 'Alex Rodriguez',
    studentPhoto: '/testimonials/alex-rodriguez.jpg',
    courseCompleted: 'Complete React Developer Bootcamp',
    rating: 5,
    testimonialText:
      'This course completely transformed my career trajectory. I went from a junior developer to a senior React developer at a Fortune 500 company in just 6 months! The industry-focused curriculum and real-world projects gave me the confidence to lead technical initiatives.',
    careerOutcome: {
      previousRole: 'Junior Developer',
      currentRole: 'Senior React Developer',
      salaryIncrease: '85%',
      companyName: 'TechCorp',
    },
    isVerified: true,
    dateCompleted: new Date('2024-08-15'),
  },
  {
    id: '2',
    studentName: 'Emily Zhang',
    studentPhoto: '/testimonials/emily-zhang.jpg',
    courseCompleted: 'Data Science Fundamentals',
    rating: 5,
    testimonialText:
      'The hands-on projects and real-world examples made complex concepts easy to understand. The career pathway guidance helped me transition from business analysis to data science leadership. I now lead a team of 8 data scientists and my expertise is recognized across the organization.',
    careerOutcome: {
      previousRole: 'Business Analyst',
      currentRole: 'Senior Data Scientist & Team Lead',
      salaryIncrease: '120%',
      companyName: 'DataTech Solutions',
    },
    isVerified: true,
    dateCompleted: new Date('2024-09-20'),
  },
];

export const successMetrics: SuccessMetrics = {
  totalStudents: 50000,
  averageSalaryIncrease: '65%',
  jobPlacementRate: 92,
  courseCompletionRate: 87,
  averageRating: 4.7,
  industryPartners: [
    'Google',
    'Microsoft',
    'Amazon',
    'Netflix',
    'Spotify',
    'Airbnb',
    'Uber',
    'Meta',
  ],
};

// Enterprise Solutions Data
export const enterpriseSolutions: EnterpriseSolution[] = [
  {
    id: '1',
    title: 'Custom Training Programs',
    description: 'Industry-certified learning experiences designed specifically for your organization\'s technology stack and career advancement goals.',
    features: [
      'Customized curriculum with Fortune 500 best practices',
      'Industry-specific case studies from market leaders',
      'Flexible scheduling for working professionals',
      'Dedicated learning consultants with enterprise experience',
      'Progress tracking and ROI measurement reporting'
    ],
    icon: '🎯',
    pricing: '$5,000 per cohort',
    category: 'training'
  },
  {
    id: '2',
    title: 'Learning Hub+ Platform',
    description: 'Enterprise-grade learning management system with advanced analytics and white-label options.',
    features: [
      'Advanced learning analytics',
      'Custom branding and white-labeling',
      'SSO and enterprise integrations',
      'Compliance and certification tracking',
      '24/7 technical support'
    ],
    icon: '🏢',
    pricing: '$50,000 annually',
    category: 'platform'
  },
  {
    id: '3',
    title: 'Skills Assessment & Consulting',
    description: 'Comprehensive skills gap analysis and strategic learning roadmap development for your workforce.',
    features: [
      'Skills gap analysis',
      'Learning strategy development',
      'ROI measurement and optimization',
      'Change management support',
      'Executive reporting dashboards'
    ],
    icon: '📊',
    pricing: '$25,000 per engagement',
    category: 'consulting'
  },
  {
    id: '4',
    title: 'Industry Certifications',
    description: 'Accredited certification programs recognized by Fortune 500 companies and leading industry bodies for career advancement.',
    features: [
      'Industry-recognized certifications valued by top employers',
      'Proctored examinations with enterprise-grade security',
      'Digital badge credentials for LinkedIn and professional profiles',
      'Continuing education credits for professional development',
      'Exclusive alumni network access with industry leaders'
    ],
    icon: '🏆',
    pricing: '$2,500 per certification',
    category: 'certification'
  },
  {
    id: '5',
    title: 'Executive Leadership Development',
    description: 'Strategic technology leadership programs for C-suite executives and senior management.',
    features: [
      'Executive-level curriculum',
      'Peer networking opportunities',
      'Strategic technology planning',
      'Digital transformation guidance',
      'Board-ready reporting'
    ],
    icon: '👔',
    pricing: '$15,000 per executive',
    category: 'training'
  },
  {
    id: '6',
    title: 'Team Upskilling Bootcamps',
    description: 'Intensive skill-building programs designed to rapidly upskill existing teams in emerging technologies.',
    features: [
      'Accelerated learning programs',
      'Hands-on project work',
      'Mentorship and coaching',
      'Team collaboration exercises',
      'Post-training support'
    ],
    icon: '🚀',
    pricing: '$8,000 per team',
    category: 'training'
  }
];

export const fortune500Clients: CompanyLogo[] = [
  {
    id: '1',
    name: 'Microsoft',
    logoUrl: '/partners/microsoft-logo.svg',
    category: 'fortune500',
    description: 'Global technology leader'
  },
  {
    id: '2',
    name: 'Amazon',
    logoUrl: '/partners/amazon-logo.svg',
    category: 'fortune500',
    description: 'E-commerce and cloud computing giant'
  },
  {
    id: '3',
    name: 'Google',
    logoUrl: '/partners/google-logo.svg',
    category: 'fortune500',
    description: 'Search and advertising technology leader'
  },
  {
    id: '4',
    name: 'Meta',
    logoUrl: '/partners/meta-logo.svg',
    category: 'fortune500',
    description: 'Social media and virtual reality innovator'
  },
  {
    id: '5',
    name: 'Netflix',
    logoUrl: '/partners/netflix-logo.svg',
    category: 'fortune500',
    description: 'Streaming entertainment leader'
  },
  {
    id: '6',
    name: 'Spotify',
    logoUrl: '/partners/spotify-logo.svg',
    category: 'fortune500',
    description: 'Music streaming platform'
  },
  {
    id: '7',
    name: 'Airbnb',
    logoUrl: '/partners/airbnb-logo.svg',
    category: 'fortune500',
    description: 'Travel and hospitality platform'
  },
  {
    id: '8',
    name: 'Uber',
    logoUrl: '/partners/uber-logo.svg',
    category: 'fortune500',
    description: 'Ride-sharing and delivery services'
  }
];

export const enterpriseCaseStudies: CaseStudy[] = [
  {
    id: '1',
    companyName: 'TechCorp Global',
    companyLogo: '/case-studies/techcorp-logo.svg',
    industry: 'Financial Services',
    challenge: 'Legacy technology stack hindering digital transformation initiatives and employee productivity.',
    solution: 'Implemented comprehensive cloud computing and modern web development training for 500+ engineers.',
    results: [
      {
        metric: 'Deployment Speed',
        value: '300%',
        description: 'Faster application deployment cycles'
      },
      {
        metric: 'Developer Productivity',
        value: '45%',
        description: 'Increase in code delivery velocity'
      },
      {
        metric: 'System Reliability',
        value: '99.9%',
        description: 'Uptime achieved post-migration'
      },
      {
        metric: 'Cost Reduction',
        value: '$2.5M',
        description: 'Annual infrastructure savings'
      }
    ],
    testimonial: {
      quote: 'The training program transformed our engineering culture and accelerated our digital transformation by 18 months.',
      author: 'Sarah Mitchell',
      title: 'CTO, TechCorp Global'
    },
    isPublic: true
  },
  {
    id: '2',
    companyName: 'DataDriven Inc.',
    companyLogo: '/case-studies/datadriven-logo.svg',
    industry: 'Healthcare Technology',
    challenge: 'Need to build internal data science capabilities to leverage growing healthcare data assets.',
    solution: 'Custom data science bootcamp for 150 analysts and engineers, focusing on healthcare applications.',
    results: [
      {
        metric: 'ML Models Deployed',
        value: '25+',
        description: 'Production machine learning models'
      },
      {
        metric: 'Data Processing Speed',
        value: '80%',
        description: 'Improvement in data pipeline efficiency'
      },
      {
        metric: 'Revenue Impact',
        value: '$12M',
        description: 'Additional revenue from new data products'
      },
      {
        metric: 'Team Growth',
        value: '200%',
        description: 'Expansion of data science team'
      }
    ],
    testimonial: {
      quote: 'Our team went from basic analytics to deploying sophisticated ML models that directly impact patient outcomes.',
      author: 'Dr. James Chen',
      title: 'Head of Data Science, DataDriven Inc.'
    },
    isPublic: true
  },
  {
    id: '3',
    companyName: 'SecureBank',
    companyLogo: '/case-studies/securebank-logo.svg',
    industry: 'Banking & Finance',
    challenge: 'Increasing cybersecurity threats requiring rapid upskilling of security teams across multiple regions.',
    solution: 'Global cybersecurity certification program for 300+ security professionals with hands-on labs.',
    results: [
      {
        metric: 'Security Incidents',
        value: '65%',
        description: 'Reduction in successful attacks'
      },
      {
        metric: 'Response Time',
        value: '40%',
        description: 'Faster incident response'
      },
      {
        metric: 'Compliance Score',
        value: '98%',
        description: 'Regulatory compliance achievement'
      },
      {
        metric: 'Team Retention',
        value: '95%',
        description: 'Security team retention rate'
      }
    ],
    testimonial: {
      quote: 'The comprehensive training program significantly strengthened our security posture and team capabilities.',
      author: 'Maria Rodriguez',
      title: 'CISO, SecureBank'
    },
    isPublic: true
  }
];

// Export all data for easy access
export const mockData = {
  categories,
  instructors,
  courses: sampleCourses,
  testimonials,
  successMetrics,
  enterpriseSolutions,
  fortune500Clients,
  enterpriseCaseStudies,
};
