'use client';

import React from 'react';
import { EnterpriseSolution, CompanyLogo, CaseStudy } from '@/types';
import { Button } from '@/components/ui';
import { OptimizedImage } from '@/components';

interface EnterpriseSolutionsProps {
  solutions: EnterpriseSolution[];
  clientLogos: CompanyLogo[];
  caseStudies: CaseStudy[];
  onContactClick: () => void;
  onDemoClick: () => void;
}

const EnterpriseSolutions: React.FC<EnterpriseSolutionsProps> = ({
  solutions,
  clientLogos,
  caseStudies,
  onContactClick,
  onDemoClick,
}) => {
  const fortune500Clients = clientLogos.filter(client => client.category === 'fortune500');
  const publicCaseStudies = caseStudies.filter(study => study.isPublic);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transform Your Workforce with
              <span className="block text-teal-300">Enterprise Learning Solutions</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-50 max-w-4xl mx-auto">
              Empower your teams with industry-leading training programs designed for Fortune 500 companies. 
              Build the skills that drive innovation and competitive advantage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onDemoClick}
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 py-4"
              >
                Schedule a Demo
              </Button>
              <Button
                onClick={onContactClick}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators - Fortune 500 Clients */}
      {fortune500Clients.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Trusted by Industry Leaders
              </h2>
              <p className="text-lg text-gray-600">
                Join Fortune 500 companies that trust us to develop their talent
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
              {fortune500Clients.slice(0, 12).map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <OptimizedImage
                    src={client.logoUrl}
                    alt={`${client.name} logo`}
                    width={120}
                    height={60}
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enterprise Solutions */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Comprehensive Learning Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From custom training programs to enterprise platform access, 
              we provide scalable solutions that meet your organization's unique needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution) => (
              <div
                key={solution.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">{solution.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{solution.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-6">{solution.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {solution.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {solution.pricing && (
                  <div className="text-sm text-gray-500 mb-4">
                    Starting at {solution.pricing}
                  </div>
                )}

                <Button
                  onClick={onContactClick}
                  variant="outline"
                  className="w-full"
                >
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      {publicCaseStudies.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Success Stories
              </h2>
              <p className="text-xl text-gray-600">
                See how leading organizations have transformed their workforce
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publicCaseStudies.slice(0, 3).map((caseStudy) => (
                <div
                  key={caseStudy.id}
                  className="bg-white rounded-xl shadow-lg p-8"
                >
                  <div className="flex items-center mb-6">
                    <OptimizedImage
                      src={caseStudy.companyLogo}
                      alt={`${caseStudy.companyName} logo`}
                      width={80}
                      height={40}
                      className="h-8 w-auto object-contain mr-4"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">{caseStudy.companyName}</h3>
                      <p className="text-sm text-gray-600">{caseStudy.industry}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                    <p className="text-gray-600 text-sm mb-4">{caseStudy.challenge}</p>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                    <p className="text-gray-600 text-sm">{caseStudy.solution}</p>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Results</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {caseStudy.results.slice(0, 2).map((result, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{result.value}</div>
                          <div className="text-sm text-gray-600">{result.metric}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {caseStudy.testimonial && (
                    <div className="mt-6 pt-6 border-t">
                      <blockquote className="text-gray-600 italic text-sm mb-3">
                        "{caseStudy.testimonial.quote}"
                      </blockquote>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">
                          {caseStudy.testimonial.author}
                        </div>
                        <div className="text-gray-600">
                          {caseStudy.testimonial.title}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Learning Hub+ Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                Introducing Learning Hub+
              </h2>
              <p className="text-xl mb-8 text-blue-50">
                Our premium enterprise platform designed for large-scale workforce development. 
                Get advanced analytics, custom learning paths, and dedicated support.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-10">
                <div className="text-center">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-blue-50 text-sm">
                    Track progress, measure ROI, and optimize learning outcomes
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="font-semibold mb-2">Custom Learning Paths</h3>
                  <p className="text-blue-50 text-sm">
                    Tailored curricula aligned with your business objectives
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🤝</div>
                  <h3 className="font-semibold mb-2">Dedicated Support</h3>
                  <p className="text-blue-50 text-sm">
                    24/7 customer success team and technical support
                  </p>
                </div>
              </div>

              <Button
                onClick={onDemoClick}
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 py-4"
              >
                Request Learning Hub+ Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Workforce?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of companies that have already invested in their team's future. 
            Let's discuss how we can help you achieve your learning and development goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onContactClick}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 font-semibold px-8 py-4"
            >
              Contact Our Team
            </Button>
            <Button
              onClick={onDemoClick}
              variant="outline"
              size="lg"
              className="border-gray-300 text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnterpriseSolutions;