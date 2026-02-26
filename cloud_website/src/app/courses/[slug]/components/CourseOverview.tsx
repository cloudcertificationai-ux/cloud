import { Course } from '@/types';
import { 
  CheckIcon, 
  ClockIcon, 
  GlobeAltIcon, 
  DevicePhoneMobileIcon,
  CodeBracketIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import CertificationBadge, { CommonCertifications } from '@/components/CertificationBadge';
import IndustryRecognition from '@/components/IndustryRecognition';
import CareerPathway from '@/components/CareerPathway';

interface CourseOverviewProps {
  course: Course;
}

export default function CourseOverview({ course }: CourseOverviewProps) {
  const features = [
    'Lifetime access to course materials',
    'Certificate of completion',
    'Mobile and desktop access',
    'Downloadable resources',
    'Community forum access',
    '30-day money-back guarantee',
  ];

  const requirements = [
    'Basic computer skills',
    'Internet connection',
    'Willingness to learn',
  ];

  // Hands-on projects based on course content
  const handsOnProjects = [
    {
      title: 'E-commerce Platform',
      description: 'Build a complete online store with shopping cart, payment integration, and admin dashboard',
      skills: ['React', 'Node.js', 'Database Design', 'Payment APIs'],
      duration: '2-3 weeks'
    },
    {
      title: 'Real-time Chat Application',
      description: 'Create a messaging app with live notifications, file sharing, and user authentication',
      skills: ['WebSocket', 'Authentication', 'Real-time Updates', 'File Upload'],
      duration: '1-2 weeks'
    },
    {
      title: 'Portfolio Website',
      description: 'Design and develop a professional portfolio showcasing your projects and skills',
      skills: ['Responsive Design', 'SEO Optimization', 'Performance', 'Deployment'],
      duration: '1 week'
    }
  ];

  // Real-world case studies
  const caseStudies = [
    {
      company: 'TechCorp Solutions',
      challenge: 'Modernizing legacy systems',
      solution: 'Migrated monolithic architecture to microservices using modern frameworks',
      outcome: '40% performance improvement, 60% faster deployment cycles',
      industry: 'Enterprise Software'
    },
    {
      company: 'StartupX',
      challenge: 'Scaling from MVP to production',
      solution: 'Implemented robust testing, CI/CD pipelines, and cloud infrastructure',
      outcome: 'Successfully scaled to 100K+ users with 99.9% uptime',
      industry: 'SaaS Platform'
    },
    {
      company: 'RetailGiant',
      challenge: 'Improving user experience',
      solution: 'Redesigned checkout process and implemented performance optimizations',
      outcome: '25% increase in conversion rate, 50% faster page load times',
      industry: 'E-commerce'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Course Description */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
        <div className="prose prose-lg text-gray-600">
          <p>{course.longDescription}</p>
        </div>
      </div>

      {/* What You'll Learn */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Job-Ready Skills You'll Master</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {course.tags.map((skill, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Master {skill} for senior developer roles</span>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">Build portfolio projects that impress hiring managers</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">Learn industry best practices from Fortune 500 companies</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">Gain leadership skills for technical team management</span>
          </div>
        </div>
      </div>

      {/* Hands-on Projects Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CodeBracketIcon className="w-6 h-6 text-blue-600" />
          Hands-on Projects
        </h3>
        <p className="text-gray-600 mb-6">
          Apply your learning through enterprise-level projects that simulate actual Fortune 500 company scenarios and build a portfolio that demonstrates leadership-ready skills.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {handsOnProjects.map((project, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{project.title}</h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {project.duration}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Skills Applied:</p>
                <div className="flex flex-wrap gap-1">
                  {project.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-world Case Studies Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BriefcaseIcon className="w-6 h-6 text-green-600" />
          Real-world Case Studies
        </h3>
        <p className="text-gray-600 mb-6">
          Learn from actual Fortune 500 implementations and understand how senior engineers apply these concepts in leadership roles at top technology companies.
        </p>
        <div className="space-y-6">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-semibold text-gray-900">{study.company}</h4>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {study.industry}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Challenge:</p>
                      <p className="text-gray-600">{study.challenge}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Solution:</p>
                      <p className="text-gray-600">{study.solution}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Outcome:</p>
                      <p className="text-green-700 font-medium">{study.outcome}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Features */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
        <ul className="space-y-2">
          {requirements.map((requirement, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">{requirement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Course Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Duration</p>
              <p className="text-sm text-gray-600">{course.duration.hours} hours</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <GlobeAltIcon className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Language</p>
              <p className="text-sm text-gray-600">English</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DevicePhoneMobileIcon className="w-6 h-6 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">Access</p>
              <p className="text-sm text-gray-600">Mobile & Desktop</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills You'll Gain</h3>
        <div className="flex flex-wrap gap-2">
          {course.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Certification Information */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AcademicCapIcon className="w-6 h-6 text-purple-600" />
          Certification & Recognition
        </h3>
        <p className="text-gray-600 mb-6">
          Upon successful completion, you'll receive industry-recognized certifications that validate your skills and enhance your career prospects.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <CertificationBadge
            {...CommonCertifications.REACT_DEVELOPER}
            issuedDate={new Date()}
            credentialId="RD-2024-001"
            verificationUrl="/verify-certificate"
          />
          <CertificationBadge
            type="accreditation"
            title="Industry-Recognized Certificate"
            issuer="Anywheredoor Academy"
            description="Accredited certificate recognized by leading tech companies"
            variant="verified"
            issuedDate={new Date()}
          />
        </div>
      </div>

      {/* Career Pathways */}
      <CareerPathway 
        pathways={[]}
        title="Your Career Journey Starts Here"
      />

      {/* Industry Recognition */}
      <IndustryRecognition 
        recognitions={[]}
        title="Trusted by Industry Leaders"
        layout="grid"
      />
    </div>
  );
}