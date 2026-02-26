import {
  Course,
  Instructor,
  CourseCategory,
  CurriculumModule,
  Lesson,
  StudentTestimonial,
  DataGeneratorOptions,
} from '@/types';

// Utility function to generate random IDs
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Generate random dates within a range
export const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Sample data pools for realistic generation
const sampleTitles = [
  'Complete Web Development Bootcamp',
  'Advanced React Masterclass',
  'Python for Data Science',
  'Machine Learning Fundamentals',
  'Cybersecurity Essentials',
  'Cloud Computing with AWS',
  'Full Stack JavaScript',
  'DevOps Engineering',
  'Mobile App Development',
  'Database Design and Management',
];

const sampleCompanies = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify',
  'Uber', 'Airbnb', 'Tesla', 'Stripe', 'Shopify', 'Slack', 'Zoom',
];

const sampleSkills = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'AWS',
  'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'GraphQL', 'REST API',
  'Machine Learning', 'Data Analysis', 'Cybersecurity', 'DevOps',
];

const sampleNames = [
  'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim',
  'Jessica Williams', 'Robert Taylor', 'Maria Garcia', 'James Wilson',
  'Lisa Anderson', 'Christopher Lee', 'Amanda Brown', 'Daniel Martinez',
];

// Generate a random course category
export const generateCourseCategory = (): CourseCategory => {
  const categories = [
    { name: 'Web Development', color: '#3B82F6' },
    { name: 'Data Science', color: '#10B981' },
    { name: 'Cybersecurity', color: '#F59E0B' },
    { name: 'Cloud Computing', color: '#8B5CF6' },
    { name: 'Mobile Development', color: '#EF4444' },
    { name: 'DevOps', color: '#06B6D4' },
  ];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const id = generateId();
  
  return {
    id,
    name: category.name,
    slug: category.name.toLowerCase().replace(/\s+/g, '-'),
    description: `Learn ${category.name.toLowerCase()} skills and advance your career`,
    color: category.color,
  };
};

// Generate a random lesson
export const generateLesson = (moduleId: string, order: number): Lesson => {
  const types: Lesson['type'][] = ['Video', 'Reading', 'Exercise', 'Quiz'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: generateId(),
    title: `Lesson ${order}: ${sampleTitles[Math.floor(Math.random() * sampleTitles.length)]}`,
    type,
    duration: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
    isPreview: Math.random() < 0.2, // 20% chance of being preview
  };
};

// Generate a random curriculum module
export const generateCurriculumModule = (order: number): CurriculumModule => {
  const lessonCount = Math.floor(Math.random() * 8) + 3; // 3-10 lessons
  const lessons: Lesson[] = [];
  
  for (let i = 1; i <= lessonCount; i++) {
    lessons.push(generateLesson(generateId(), i));
  }
  
  return {
    id: generateId(),
    title: `Module ${order}: Advanced Concepts`,
    description: `Learn advanced concepts and practical applications in module ${order}`,
    order,
    lessons,
    estimatedHours: Math.floor(Math.random() * 20) + 5, // 5-25 hours
  };
};

// Generate a random instructor
export const generateInstructor = (): Instructor => {
  const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
  const experienceYears = Math.floor(Math.random() * 15) + 3; // 3-18 years
  const companyCount = Math.floor(Math.random() * 4) + 2; // 2-5 companies
  const companies = sampleCompanies
    .sort(() => 0.5 - Math.random())
    .slice(0, companyCount);
  
  const skillCount = Math.floor(Math.random() * 6) + 3; // 3-8 skills
  const expertise = sampleSkills
    .sort(() => 0.5 - Math.random())
    .slice(0, skillCount);
  
  return {
    id: generateId(),
    name,
    title: `Senior ${expertise[0]} Developer`,
    bio: `Experienced ${expertise[0]} developer with ${experienceYears}+ years in the industry. Former engineer at ${companies[0]} and ${companies[1]}.`,
    profileImageUrl: `/instructors/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    expertise,
    experience: {
      years: experienceYears,
      companies,
    },
    socialLinks: {
      linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`,
      github: Math.random() < 0.7 ? `https://github.com/${name.toLowerCase().replace(/\s+/g, '-')}` : undefined,
      twitter: Math.random() < 0.5 ? `https://twitter.com/${name.toLowerCase().replace(/\s+/g, '_')}` : undefined,
    },
    courseIds: [], // Will be populated when generating courses
    rating: {
      average: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0
      count: Math.floor(Math.random() * 2000) + 100, // 100-2100
    },
  };
};

// Generate a random course
export const generateCourse = (instructors: Instructor[] = []): Course => {
  const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
  const category = generateCourseCategory();
  const levels: Course['level'][] = ['Beginner', 'Intermediate', 'Advanced'];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const modes: Course['mode'][] = ['Live', 'Self-Paced', 'Hybrid'];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  
  const moduleCount = Math.floor(Math.random() * 8) + 4; // 4-11 modules
  const curriculum: CurriculumModule[] = [];
  
  for (let i = 1; i <= moduleCount; i++) {
    curriculum.push(generateCurriculumModule(i));
  }
  
  const totalHours = curriculum.reduce((sum, module) => sum + module.estimatedHours, 0);
  const weeks = Math.ceil(totalHours / 8); // Assuming 8 hours per week
  
  const basePrice = Math.floor(Math.random() * 400) + 100; // $100-$500
  const hasDiscount = Math.random() < 0.3; // 30% chance of discount
  
  const instructorIds = instructors.length > 0 
    ? [instructors[Math.floor(Math.random() * instructors.length)].id]
    : [generateId()];
  
  const skillCount = Math.floor(Math.random() * 5) + 3; // 3-7 skills
  const tags = sampleSkills
    .sort(() => 0.5 - Math.random())
    .slice(0, skillCount);
  
  // Generate dates with proper ordering
  const createdAt = generateRandomDate(new Date('2023-01-01'), new Date('2024-06-01'));
  const updatedAt = generateRandomDate(createdAt, new Date()); // Ensure updatedAt is after createdAt
  
  // Generate unique slug by combining title with level and a random suffix
  const baseSlug = title.toLowerCase().replace(/\s+/g, '-');
  const uniqueSlug = `${baseSlug}-${level.toLowerCase()}-${generateId().slice(0, 4)}`;
  
  return {
    id: generateId(),
    title,
    slug: uniqueSlug,
    shortDescription: `Master ${title.toLowerCase()} with hands-on projects and real-world applications`,
    longDescription: `A comprehensive ${title.toLowerCase()} course covering all essential concepts from basics to advanced topics. Build real-world projects and gain practical experience.`,
    category,
    level,
    duration: {
      hours: totalHours,
      weeks,
    },
    price: {
      amount: basePrice,
      currency: 'USD',
      originalPrice: hasDiscount ? Math.floor(basePrice * 1.4) : undefined,
    },
    rating: {
      average: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0
      count: Math.floor(Math.random() * 5000) + 100, // 100-5100
    },
    thumbnailUrl: `/courses/${title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    instructorIds,
    curriculum,
    tags,
    mode,
    enrollmentCount: Math.floor(Math.random() * 20000) + 500, // 500-20500
    isActive: Math.random() < 0.9, // 90% chance of being active
    createdAt,
    updatedAt,
  };
};

// Generate a random testimonial
export const generateTestimonial = (courses: Course[] = []): StudentTestimonial => {
  const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
  const courseTitle = courses.length > 0 
    ? courses[Math.floor(Math.random() * courses.length)].title
    : sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
  
  const previousRoles = ['Junior Developer', 'Business Analyst', 'Marketing Coordinator', 'Sales Associate', 'Customer Support'];
  const currentRoles = ['Senior Developer', 'Data Scientist', 'Product Manager', 'Tech Lead', 'Software Engineer'];
  
  const previousRole = previousRoles[Math.floor(Math.random() * previousRoles.length)];
  const currentRole = currentRoles[Math.floor(Math.random() * currentRoles.length)];
  const company = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
  
  const testimonials = [
    'This course completely transformed my career. The hands-on projects were invaluable!',
    'Excellent instructor and comprehensive curriculum. Highly recommended!',
    'The practical approach and real-world examples made complex concepts easy to understand.',
    'Best investment I made for my career. The support from instructors was amazing.',
    'From zero to hero in just a few months. The course structure is perfect.',
  ];
  
  // Generate a reasonable completion date (within the last year)
  const dateCompleted = generateRandomDate(new Date('2024-01-01'), new Date());
  
  return {
    id: generateId(),
    studentName: name,
    studentPhoto: `/testimonials/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    courseCompleted: courseTitle,
    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
    testimonialText: testimonials[Math.floor(Math.random() * testimonials.length)],
    careerOutcome: {
      previousRole,
      currentRole,
      salaryIncrease: `${Math.floor(Math.random() * 60) + 30}%`, // 30-90%
      companyName: company,
    },
    isVerified: Math.random() < 0.8, // 80% chance of being verified
    dateCompleted,
  };
};

// Batch generators with options
export const generateCourses = (options: DataGeneratorOptions = {}): Course[] => {
  const { count = 10, includeInactive = false } = options;
  const courses: Course[] = [];
  
  // Generate instructors first
  const instructors = generateInstructors({ count: Math.ceil(count / 3) });
  
  for (let i = 0; i < count; i++) {
    const course = generateCourse(instructors);
    if (includeInactive || course.isActive) {
      courses.push(course);
    }
  }
  
  // Update instructor courseIds
  instructors.forEach(instructor => {
    instructor.courseIds = courses
      .filter(course => course.instructorIds.includes(instructor.id))
      .map(course => course.id);
  });
  
  return courses;
};

export const generateInstructors = (options: DataGeneratorOptions = {}): Instructor[] => {
  const { count = 5 } = options;
  const instructors: Instructor[] = [];
  
  for (let i = 0; i < count; i++) {
    instructors.push(generateInstructor());
  }
  
  return instructors;
};

export const generateTestimonials = (options: DataGeneratorOptions = {}, courses: Course[] = []): StudentTestimonial[] => {
  const { count = 10 } = options;
  const testimonials: StudentTestimonial[] = [];
  
  for (let i = 0; i < count; i++) {
    testimonials.push(generateTestimonial(courses));
  }
  
  return testimonials;
};