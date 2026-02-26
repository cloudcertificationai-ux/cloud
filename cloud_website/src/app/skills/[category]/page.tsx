import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { OptimizedImage, StructuredData } from '@/components';
import FAQ from '@/components/FAQ';

// Mock skill categories data
const skillCategories = {
  'web-development': {
    id: 'web-development',
    title: 'Web Development',
    description: 'Master modern web development with HTML, CSS, JavaScript, and popular frameworks like React and Vue.js.',
    hero: {
      title: 'Become a Web Developer',
      subtitle: 'Learn to build modern, responsive websites and web applications',
      image: '/images/skills/web-development-hero.jpg',
    },
    stats: {
      averageSalary: '$75,000',
      jobGrowth: '13%',
      timeToLearn: '6-12 months',
    },
    skills: [
      'HTML5 & CSS3',
      'JavaScript (ES6+)',
      'React.js',
      'Node.js',
      'Responsive Design',
      'Version Control (Git)',
    ],
    courses: [
      {
        id: '1',
        title: 'Complete Web Development Bootcamp',
        duration: '12 weeks',
        level: 'Beginner to Advanced',
        price: 599,
        rating: 4.8,
        students: 15420,
      },
      {
        id: '2',
        title: 'React.js Masterclass',
        duration: '8 weeks',
        level: 'Intermediate',
        price: 399,
        rating: 4.9,
        students: 8930,
      },
    ],
    careerPaths: [
      'Frontend Developer',
      'Full-Stack Developer',
      'UI/UX Developer',
      'Web Application Developer',
    ],
    faq: [
      {
        id: '1',
        question: 'How long does it take to become a web developer?',
        answer: 'With dedicated study, you can learn web development fundamentals in 3-6 months. However, becoming proficient typically takes 6-12 months of consistent practice and project building.',
      },
      {
        id: '2',
        question: 'Do I need a computer science degree to become a web developer?',
        answer: 'No, a computer science degree is not required. Many successful web developers are self-taught or have completed bootcamps. What matters most is your skills, portfolio, and ability to solve problems.',
      },
      {
        id: '3',
        question: 'What programming languages should I learn first?',
        answer: 'Start with HTML, CSS, and JavaScript. These are the fundamental technologies of web development. Once comfortable with these, you can explore frameworks like React, Vue, or Angular.',
      },
    ],
  },
  'data-science': {
    id: 'data-science',
    title: 'Data Science',
    description: 'Learn to analyze data, build machine learning models, and extract insights from complex datasets.',
    hero: {
      title: 'Become a Data Scientist',
      subtitle: 'Transform data into actionable insights and drive business decisions',
      image: '/images/skills/data-science-hero.jpg',
    },
    stats: {
      averageSalary: '$95,000',
      jobGrowth: '22%',
      timeToLearn: '8-15 months',
    },
    skills: [
      'Python Programming',
      'Statistics & Mathematics',
      'Machine Learning',
      'Data Visualization',
      'SQL & Databases',
      'Big Data Tools',
    ],
    courses: [
      {
        id: '3',
        title: 'Data Science Professional Certificate',
        duration: '16 weeks',
        level: 'Beginner to Advanced',
        price: 799,
        rating: 4.7,
        students: 12350,
      },
      {
        id: '4',
        title: 'Machine Learning Specialization',
        duration: '12 weeks',
        level: 'Intermediate',
        price: 699,
        rating: 4.9,
        students: 9870,
      },
    ],
    careerPaths: [
      'Data Scientist',
      'Machine Learning Engineer',
      'Data Analyst',
      'Business Intelligence Analyst',
    ],
    faq: [
      {
        id: '1',
        question: 'What math background do I need for data science?',
        answer: 'A solid foundation in statistics, linear algebra, and calculus is helpful. However, many concepts can be learned as you go, and our courses include the necessary mathematical foundations.',
      },
      {
        id: '2',
        question: 'Should I learn Python or R for data science?',
        answer: 'Python is generally recommended for beginners due to its versatility and large community. It\'s used in both data science and web development, making it a valuable skill across multiple domains.',
      },
    ],
  },
};

interface SkillPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  return Object.keys(skillCategories).map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: SkillPageProps): Promise<Metadata> {
  const skill = skillCategories[params.category as keyof typeof skillCategories];
  
  if (!skill) {
    return {
      title: 'Skill Not Found',
    };
  }

  return {
    title: `Learn ${skill.title} - Online Courses & Career Guide`,
    description: `${skill.description} Start your ${skill.title.toLowerCase()} career with expert-led courses and hands-on projects.`,
    keywords: [
      skill.title.toLowerCase(),
      'online courses',
      'certification',
      'career change',
      'bootcamp',
      ...skill.skills.map(s => s.toLowerCase()),
    ],
    openGraph: {
      title: `Learn ${skill.title} | Anywheredoor`,
      description: skill.description,
      type: 'website',
      images: [skill.hero.image],
    },
  };
}

// Enable ISR with revalidation every hour
// Note: revalidate is not compatible with cacheComponents, using headers for caching instead

export default function SkillPage({ params }: SkillPageProps) {
  const skill = skillCategories[params.category as keyof typeof skillCategories];

  if (!skill) {
    notFound();
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `Learn ${skill.title}`,
    description: skill.description,
    provider: {
      '@type': 'Organization',
      name: 'Anywheredoor',
      url: 'https://anywheredoor.com',
    },
    educationalLevel: 'Beginner to Advanced',
    teaches: skill.skills,
    occupationalCategory: skill.careerPaths,
  };

  return (
    <>
      <StructuredData data={structuredData} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-navy-600 to-teal-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  {skill.hero.title}
                </h1>
                <p className="text-xl md:text-2xl text-teal-100 mb-8">
                  {skill.hero.subtitle}
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-300">{skill.stats.averageSalary}</div>
                    <div className="text-sm text-teal-100">Avg. Salary</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-300">{skill.stats.jobGrowth}</div>
                    <div className="text-sm text-teal-100">Job Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-300">{skill.stats.timeToLearn}</div>
                    <div className="text-sm text-teal-100">Time to Learn</div>
                  </div>
                </div>
                
                <Link
                  href="/courses"
                  className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
                >
                  Start Learning Today
                </Link>
              </div>
              
              <div className="hidden lg:block">
                <OptimizedImage
                  src={skill.hero.image}
                  alt={skill.title}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Skills You'll Master
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {skill.skills.map((skillItem) => (
                <div
                  key={skillItem}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center"
                >
                  <span className="font-medium text-gray-900">{skillItem}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Featured {skill.title} Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {skill.courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {course.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{course.students.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-teal-600">
                      ${course.price}
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 font-medium">{course.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Career Paths */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Career Opportunities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {skill.careerPaths.map((career) => (
                <div
                  key={career}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center"
                >
                  <h3 className="font-semibold text-gray-900">{career}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ
          items={skill.faq}
          title={`${skill.title} FAQ`}
          description={`Common questions about learning ${skill.title.toLowerCase()}`}
          className="bg-white"
        />
      </div>
    </>
  );
}