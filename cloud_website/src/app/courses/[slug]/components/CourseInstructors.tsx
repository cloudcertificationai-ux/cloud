import Image from 'next/image';
import { Instructor } from '@/types';
import { 
  StarIcon, 
  AcademicCapIcon, 
  BuildingOfficeIcon,
  ClockIcon,
  TrophyIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid';
import { 
  LinkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface CourseInstructorsProps {
  instructors: Instructor[];
}

export default function CourseInstructors({ instructors }: CourseInstructorsProps) {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      default:
        return <LinkIcon className="w-5 h-5" />;
    }
  };

  if (instructors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8">
          <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Instructor Information Coming Soon
          </h3>
          <p className="text-gray-600">
            Detailed instructor profiles will be available shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Meet Your Instructor{instructors.length > 1 ? 's' : ''}
        </h2>
        <p className="text-gray-600">
          Learn from industry experts with years of real-world experience.
        </p>
      </div>

      <div className="space-y-8">
        {instructors.map((instructor) => (
          <div key={instructor.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Instructor Photo */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto lg:mx-0">
                  <Image
                    src={instructor.profileImageUrl}
                    alt={instructor.name}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 96px, 128px"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                </div>
              </div>

              {/* Instructor Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {instructor.name}
                  </h3>
                  <p className="text-lg text-gray-600 mb-3">
                    {instructor.title}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {instructor.rating.average}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      ({instructor.rating.count.toLocaleString()} reviews)
                    </span>
                  </div>

                  {/* Social Links */}
                  {Object.keys(instructor.socialLinks).length > 0 && (
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                      {Object.entries(instructor.socialLinks).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          aria-label={`${instructor.name} on ${platform}`}
                        >
                          {getSocialIcon(platform)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {instructor.bio}
                  </p>
                </div>

                {/* Experience Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {instructor.experience.years}+ Years
                      </p>
                      <p className="text-sm text-gray-600">Experience</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {instructor.courseIds.length}
                      </p>
                      <p className="text-sm text-gray-600">Courses</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <UserGroupIcon className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {instructor.rating.count.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Students</p>
                    </div>
                  </div>
                </div>

                {/* Companies */}
                {instructor.experience.companies.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center justify-center lg:justify-start gap-2">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                      Previous Experience
                    </h4>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                      {instructor.experience.companies.map((company, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expertise */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center justify-center lg:justify-start gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-gray-500" />
                    Expertise
                  </h4>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    {instructor.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Professional Background */}
                {instructor.professionalBackground && (
                  <div className="mt-8 space-y-6">
                    {/* Previous Roles */}
                    {instructor.professionalBackground.previousRoles && instructor.professionalBackground.previousRoles.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                          Professional Experience
                        </h4>
                        <div className="space-y-4">
                          {instructor.professionalBackground.previousRoles.map((role, index) => (
                            <div key={index} className="border-l-4 border-blue-200 pl-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h5 className="font-medium text-gray-900">{role.title}</h5>
                                <span className="text-sm text-gray-500">{role.duration}</span>
                              </div>
                              <p className="text-blue-600 font-medium text-sm mb-2">{role.company}</p>
                              {role.description && (
                                <p className="text-gray-600 text-sm">{role.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {instructor.professionalBackground.education && instructor.professionalBackground.education.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <AcademicCapIcon className="w-5 h-5 text-green-600" />
                          Education
                        </h4>
                        <div className="space-y-3">
                          {instructor.professionalBackground.education.map((edu, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <p className="font-medium text-gray-900">{edu.degree}</p>
                                <p className="text-gray-600 text-sm">{edu.institution}</p>
                              </div>
                              {edu.year && (
                                <span className="text-sm text-gray-500">{edu.year}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {instructor.professionalBackground.certifications && instructor.professionalBackground.certifications.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                          Certifications
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {instructor.professionalBackground.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    {instructor.professionalBackground.achievements && instructor.professionalBackground.achievements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <TrophyIcon className="w-5 h-5 text-yellow-600" />
                          Key Achievements
                        </h4>
                        <div className="space-y-2">
                          {instructor.professionalBackground.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                              <span className="text-gray-700 text-sm">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LinkedIn Integration */}
                    {instructor.socialLinks.linkedin && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Connect on LinkedIn</p>
                            <p className="text-sm text-gray-600">View full professional profile and connect for career guidance</p>
                          </div>
                          <a
                            href={instructor.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            View Profile
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Why Learn from Our Instructors?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Industry Experience</p>
              <p className="text-sm text-gray-600">
                Real-world experience from top tech companies
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <AcademicCapIcon className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Proven Teaching</p>
              <p className="text-sm text-gray-600">
                Thousands of successful students and high ratings
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <UserGroupIcon className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Mentorship</p>
              <p className="text-sm text-gray-600">
                Personal guidance and career advice
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <ClockIcon className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Up-to-Date Content</p>
              <p className="text-sm text-gray-600">
                Latest industry trends and best practices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}