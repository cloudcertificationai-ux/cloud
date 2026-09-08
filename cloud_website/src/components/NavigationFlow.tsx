'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getRelatedNavigation, getContextualCTA } from '@/lib/navigation';

const LEARNER_TESTIMONIALS = [
  {
    id: '1',
    name: 'Rahul Sharma',
    role: 'Cloud Architect',
    company: 'Infosys',
    avatar: 'RS',
    color: '#2563eb',
    quote: 'Cloud Certification helped me move from a support engineer to a Cloud Architect in under a year. The hands-on labs and real-world projects gave me exactly what I needed.',
    course: 'AWS Solutions Architect',
    salaryBump: '72% salary increase',
  },
  {
    id: '2',
    name: 'Priya Menon',
    role: 'Data Scientist',
    company: 'Accenture',
    avatar: 'PM',
    color: '#7c3aed',
    quote: 'The Data & Analytics program was industry-focused and incredibly practical. I landed my dream role at Accenture within 3 months of completing the course.',
    course: 'Data Engineering with Spark',
    salaryBump: '90% salary increase',
  },
  {
    id: '3',
    name: 'Arjun Nair',
    role: 'Cybersecurity Analyst',
    company: 'Deloitte',
    avatar: 'AN',
    color: '#059669',
    quote: 'The Ethical Hacking & SOC Analyst bootcamp is the best investment I made in my career. Clear content, expert instructors, and a real-world labs environment.',
    course: 'Certified Ethical Hacker Path',
    salaryBump: '65% salary increase',
  },
  {
    id: '4',
    name: 'Sneha Kapoor',
    role: 'Salesforce Lead',
    company: 'TCS',
    avatar: 'SK',
    color: '#dc2626',
    quote: 'The Enterprise Applications track had everything I needed to clear my Salesforce certification on the first attempt and get promoted to a lead role.',
    course: 'Salesforce Platform Developer I',
    salaryBump: '58% salary increase',
  },
  {
    id: '5',
    name: 'Mohammed Al-Rashid',
    role: 'Full Stack Engineer',
    company: 'Wipro',
    avatar: 'MR',
    color: '#d97706',
    quote: 'Switching from manual testing to full stack development felt impossible until I joined Cloud Certification. The curriculum is structured for working professionals.',
    course: 'Full Stack JavaScript Developer',
    salaryBump: '80% salary increase',
  },
  {
    id: '6',
    name: 'Divya Reddy',
    role: 'AI/ML Engineer',
    company: 'IBM',
    avatar: 'DR',
    color: '#0891b2',
    quote: 'The GenAI Engineering Bootcamp gave me skills that are in massive demand right now. I received three job offers within 2 weeks of completing the program.',
    course: 'Generative AI Engineering Bootcamp',
    salaryBump: '110% salary increase',
  },
];

interface NavigationFlowProps {
  className?: string;
  showRelated?: boolean;
  showCTA?: boolean;
}

export default function NavigationFlow({ 
  className = '', 
  showRelated = true, 
  showCTA = true 
}: NavigationFlowProps) {
  const pathname = usePathname();
  const relatedNavigation = getRelatedNavigation(pathname);
  const contextualCTA = getContextualCTA(pathname);

  if (!showRelated && !showCTA) return null;

  return (
    <div className={`bg-gray-50 border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contextual Call-to-Action */}
        {showCTA && (
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Take the Next Step?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={contextualCTA.primary.href}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                {contextualCTA.primary.label}
              </Link>
              {contextualCTA.secondary && (
                <Link
                  href={contextualCTA.secondary.href}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                >
                  {contextualCTA.secondary.label}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* What Our Learners Say */}
        <div className="mt-12 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              What Our Learners Say
            </h3>
            <p className="text-gray-500 text-base max-w-2xl mx-auto">
              Real stories from working professionals who advanced their careers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEARNER_TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-4"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Course tag */}
                <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 self-start">
                  {t.course}
                </span>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{t.name}</p>
                    <p className="text-gray-500 text-xs truncate">{t.role} · {t.company}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-emerald-600 whitespace-nowrap">
                    {t.salaryBump}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Navigation */}
        {showRelated && relatedNavigation.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #0ea5e9 100%)' }}>
            <div className="px-8 py-10">
              <h4 className="text-xl font-bold text-white mb-1 text-center tracking-wide">
                You Might Also Be Interested In
              </h4>
              <p className="text-blue-200 text-sm text-center mb-8">Explore more paths tailored to your goals</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group p-5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/40 transition-all duration-300"
                  >
                    <h5 className="font-semibold text-white group-hover:text-blue-100 transition-colors mb-2">
                      {item.label}
                    </h5>
                    {item.description && (
                      <p className="text-blue-200 text-sm group-hover:text-white transition-colors">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center text-blue-200 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <span className="text-sm font-medium">Learn more</span>
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}