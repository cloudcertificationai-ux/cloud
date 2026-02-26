import type { Metadata } from 'next';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { successMetrics, testimonials } from '@/data/sample-data';

// Dynamically import client components
const NavigationFlow = dynamic(() => import('@/components/NavigationFlow'));

export const metadata: Metadata = {
  title: 'About Us - Transforming Careers Through Technology Education',
  description: 'Learn about Anywheredoor\'s mission to provide world-class technology education. Discover our success stories, industry partnerships, and commitment to student career advancement.',
  keywords: [
    'about anywheredoor',
    'online learning platform',
    'tech education mission',
    'career transformation',
    'student success stories',
    'industry partnerships'
  ],
  openGraph: {
    title: 'About Anywheredoor - Technology Education Platform',
    description: 'Transforming careers through expert-led technology courses with 92% job placement rate and 65% average salary increase.',
    images: ['/about-og-image.jpg'],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-inter mb-6">
              Transforming Careers Through
              <span className="text-teal-300 block">Technology Education</span>
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed">
              We believe everyone deserves access to world-class technology education 
              that opens doors to meaningful careers and financial freedom.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-inter text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                At Anywheredoor, we're on a mission to democratize access to high-quality 
                technology education. We bridge the gap between traditional education and 
                industry demands by providing practical, hands-on learning experiences 
                that prepare students for real-world challenges.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our expert instructors, comprehensive curriculum, and career support 
                services ensure that every student not only learns cutting-edge skills 
                but also successfully transitions into rewarding tech careers.
              </p>
            </div>
            <div className="relative">
              <Image
                src="/about/mission-image.jpg"
                alt="Students learning technology skills"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Dashboard */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-inter text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These numbers represent real people whose lives have been transformed 
              through technology education.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {successMetrics.totalStudents.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Students Enrolled</div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                {successMetrics.jobPlacementRate}%
              </div>
              <div className="text-gray-600 font-medium">Job Placement Rate</div>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                {successMetrics.averageSalaryIncrease}
              </div>
              <div className="text-gray-600 font-medium">Avg. Salary Increase</div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                {successMetrics.averageRating}
              </div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Partners */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-inter text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our graduates work at the world's most innovative companies. 
              These partnerships help us stay current with industry needs.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
            {successMetrics.industryPartners.map((partner, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-gray-600 font-semibold text-sm">
                    {partner}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni Success Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-inter text-gray-900 mb-4">
              Alumni Success Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from real students who transformed their careers 
              through our programs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-6">
                  <Image
                    src={testimonial.studentPhoto}
                    alt={testimonial.studentName}
                    width={60}
                    height={60}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {testimonial.studentName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {testimonial.careerOutcome.currentRole} at {testimonial.careerOutcome.companyName}
                    </p>
                  </div>
                  {testimonial.isVerified && (
                    <div className="ml-auto">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
                
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.testimonialText}"
                </blockquote>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Course: {testimonial.courseCompleted}</span>
                    <span className="text-green-600 font-semibold">
                      +{testimonial.careerOutcome.salaryIncrease} salary increase
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-inter mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Join thousands of successful graduates who have advanced their careers 
            through our comprehensive technology programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/courses"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Courses
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Navigation Flow */}
      <NavigationFlow />
    </div>
  );
}