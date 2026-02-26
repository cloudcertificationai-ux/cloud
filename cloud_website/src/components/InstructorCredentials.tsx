'use client';

import { Instructor } from '@/types';
import OptimizedImage from './OptimizedImage';
import { 
  AcademicCapIcon, 
  BriefcaseIcon, 
  StarIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/solid';
import { 
  GlobeAltIcon,
  LinkIcon 
} from '@heroicons/react/24/outline';

interface InstructorCredentialsProps {
  instructor: Instructor;
  showDetailedExperience?: boolean;
  showSocialLinks?: boolean;
  showAchievements?: boolean;
  className?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  date?: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

// Mock achievements data - in real app this would come from the instructor data
const getInstructorAchievements = (instructorId: string): Achievement[] => {
  const achievements: Record<string, Achievement[]> = {
    '1': [
      {
        id: 'top-instructor',
        title: 'Top Instructor 2024',
        description: 'Recognized as one of the top 10 instructors based on student ratings and course completion rates',
        icon: <AcademicCapIcon className="w-5 h-5 text-yellow-600" />,
        date: '2024',
      },
      {
        id: 'industry-expert',
        title: 'Industry Expert',
        description: 'Certified industry expert with 8+ years of hands-on experience',
        icon: <BriefcaseIcon className="w-5 h-5 text-blue-600" />,
      },
      {
        id: 'student-favorite',
        title: 'Student Favorite',
        description: 'Consistently rated 4.9+ stars by students across all courses',
        icon: <StarIcon className="w-5 h-5 text-purple-600" />,
      },
    ],
    '2': [
      {
        id: 'phd-holder',
        title: 'PhD in Machine Learning',
        description: 'Advanced degree from Stanford University with focus on deep learning research',
        icon: <AcademicCapIcon className="w-5 h-5 text-green-600" />,
        date: '2015',
      },
      {
        id: 'research-leader',
        title: 'Research Team Lead',
        description: 'Led machine learning research teams at top tech companies',
        icon: <BuildingOfficeIcon className="w-5 h-5 text-indigo-600" />,
      },
    ],
  };
  
  return achievements[instructorId] || [];
};

const getInstructorCertifications = (instructorId: string): Certification[] => {
  const certifications: Record<string, Certification[]> = {
    '1': [
      {
        id: 'aws-certified',
        name: 'AWS Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2023',
        credentialId: 'AWS-SA-2023-001',
      },
      {
        id: 'google-cloud',
        name: 'Google Cloud Professional',
        issuer: 'Google Cloud',
        date: '2022',
      },
    ],
    '2': [
      {
        id: 'tensorflow-cert',
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        date: '2023',
        credentialId: 'TF-DEV-2023-456',
      },
      {
        id: 'coursera-ml',
        name: 'Machine Learning Specialization',
        issuer: 'Stanford University (Coursera)',
        date: '2020',
      },
    ],
  };
  
  return certifications[instructorId] || [];
};

export function InstructorCredentials({
  instructor,
  showDetailedExperience = true,
  showSocialLinks = true,
  showAchievements = true,
  className = '',
}: InstructorCredentialsProps) {
  const achievements = getInstructorAchievements(instructor.id);
  const certifications = getInstructorCertifications(instructor.id);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header with instructor basic info */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="relative">
          <OptimizedImage
            src={instructor.profileImageUrl}
            alt={`${instructor.name} profile photo`}
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
            <CheckBadgeIcon className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{instructor.name}</h3>
          <p className="text-gray-600 mb-2">{instructor.title}</p>
          
          {/* Rating and student count */}
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center">
              <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="font-medium text-gray-900">{instructor.rating.average}</span>
              <span className="text-gray-500 text-sm ml-1">
                ({instructor.rating.count.toLocaleString()} reviews)
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {instructor.courseIds.length} courses
            </div>
          </div>
          
          {/* Experience summary */}
          <div className="flex items-center text-sm text-gray-600">
            <BriefcaseIcon className="w-4 h-4 mr-1" />
            <span>{instructor.experience.years}+ years experience</span>
          </div>
        </div>
      </div>

      {/* Expertise areas */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Areas of Expertise</h4>
        <div className="flex flex-wrap gap-2">
          {instructor.expertise.map((skill) => (
            <span
              key={skill}
              className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Detailed experience */}
      {showDetailedExperience && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Professional Experience</h4>
          <div className="space-y-2">
            {instructor.experience.companies.map((company, index) => (
              <div key={company} className="flex items-center text-sm text-gray-600">
                <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400" />
                <span>{company}</span>
                {index === 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements and badges */}
      {showAchievements && achievements.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Achievements & Recognition</h4>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 p-2 bg-white rounded-full">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{achievement.title}</h5>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  {achievement.date && (
                    <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-start p-3 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">{cert.name}</h5>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                  {cert.credentialId && (
                    <p className="text-xs text-gray-500">ID: {cert.credentialId}</p>
                  )}
                </div>
                <span className="text-sm text-gray-500">{cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social links */}
      {showSocialLinks && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Connect</h4>
          <div className="flex space-x-3">
            {instructor.socialLinks.linkedin && (
              <a
                href={instructor.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                LinkedIn
              </a>
            )}
            {instructor.socialLinks.twitter && (
              <a
                href={instructor.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600 transition-colors"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Twitter
              </a>
            )}
            {instructor.socialLinks.github && (
              <a
                href={instructor.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                GitHub
              </a>
            )}
          </div>
        </div>
      )}

      {/* Trust indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-1" />
            <span>Verified Instructor</span>
          </div>
          <div className="flex items-center">
            <GlobeAltIcon className="w-4 h-4 mr-1" />
            <span>Industry Professional</span>
          </div>
        </div>
      </div>
    </div>
  );
}