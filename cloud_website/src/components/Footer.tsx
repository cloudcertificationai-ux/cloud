'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2024); // Default fallback
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side and set current year
    setIsClient(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const footerLinks = {
    courses: [
      { href: '/courses?category=web-development', label: 'Web Development' },
      { href: '/courses?category=data-science', label: 'Data Science' },
      { href: '/courses?category=cybersecurity', label: 'Cybersecurity' },
      { href: '/courses?category=cloud-computing', label: 'Cloud Computing' },
      { href: '/courses?category=ai-machine-learning', label: 'AI & Machine Learning' },
      { href: '/courses?category=devops', label: 'DevOps & Cloud' },
    ],
    company: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/careers', label: 'Careers' },
      { href: '/testimonials', label: 'Success Stories' },
      { href: '/for-business', label: 'For Business' },
    ],
    support: [
      { href: '/help', label: 'Help Center' },
      { href: '/faq', label: 'FAQ' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/accessibility', label: 'Accessibility' },
      { href: '/sitemap', label: 'Sitemap' },
    ],
    resources: [
      { href: '/resources/blog', label: 'Blog' },
      { href: '/resources/whitepapers', label: 'Whitepapers' },
      { href: '/resources/case-studies', label: 'Case Studies' },
      { href: '/resources/webinars', label: 'Webinars' },
      { href: '/resources/career-guide', label: 'Career Guide' },
      { href: '/resources/salary-guide', label: 'Salary Guide' },
    ],
  };

  const certifications = [
    {
      name: 'ISO 9001:2015',
      description: 'Quality Management',
      icon: ShieldCheckIcon,
      logoUrl: '/certifications/iso-certification.svg'
    },
    {
      name: 'Accredited Provider',
      description: 'Education Standards',
      icon: AcademicCapIcon,
      logoUrl: '/certifications/accredited-badge.svg'
    },
    {
      name: 'Industry Recognized',
      description: 'Professional Certificates',
      icon: BuildingOfficeIcon,
      logoUrl: '/certifications/industry-recognized.svg'
    },
  ];

  const contactInfo = {
    phone: '+1 (555) 123-4567',
    email: 'support@cloudcertification.com',
    address: '123 Learning Street, Education City, EC 12345'
  };

  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-xl font-bold mb-6 text-white"
                aria-label="Cloud Certification Home"
              >
                <img 
                  src="/cloud-certification-logo.png" 
                  alt="Cloud Certification Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-white">Cloud Certification</span>
              </Link>
              <p className="text-gray-300 mb-6 leading-relaxed !text-gray-300">
                Transform your career with industry-leading online courses. Join thousands of 
                professionals who've advanced their careers with our expert-led programs and 
                globally recognized certifications.
              </p>
              
              {/* Contact Information */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="text-gray-300 hover:text-white transition-colors !text-gray-300"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="text-gray-300 hover:text-white transition-colors !text-gray-300"
                  >
                    {contactInfo.email}
                  </a>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-300 !text-gray-300">
                    {contactInfo.address}
                  </span>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="flex space-x-4">
                <a
                  href="https://twitter.com/cloudcertification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Follow us on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/cloudcertification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Follow us on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="https://github.com/cloudcertification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Follow us on GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com/@cloudcertification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Courses Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white !text-white">Popular Courses</h3>
              <ul className="space-y-2">
                {footerLinks.courses.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm !text-gray-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white !text-white">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm !text-gray-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white !text-white">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm !text-gray-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white !text-white">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm !text-gray-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Certifications and Industry Recognition Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Certifications & Industry Recognition
            </h3>
            <p className="text-gray-400 text-sm">
              Accredited programs with globally recognized standards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Image
                      src={cert.logoUrl}
                      alt={`${cert.name} certification`}
                      width={40}
                      height={40}
                      className="w-10 h-10"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{cert.name}</div>
                    <div className="text-gray-400 text-xs">{cert.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-white font-medium text-sm mb-1">Money-Back Guarantee</div>
              <div className="text-gray-400 text-xs">30-day refund policy</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-white font-medium text-sm mb-1">24/7 Support</div>
              <div className="text-gray-400 text-xs">Always here to help</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-white font-medium text-sm mb-1">Verified Reviews</div>
              <div className="text-gray-400 text-xs">Authentic student feedback</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-white font-medium text-sm mb-1">Career Support</div>
              <div className="text-gray-400 text-xs">Job placement assistance</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Cloud Certification. All rights reserved. | Transforming careers through expert-led education.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </Link>
              <Link
                href="/accessibility"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}