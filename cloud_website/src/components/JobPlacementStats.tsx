'use client';

import { useState, useEffect } from 'react';
import { SuccessMetrics } from '@/types';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  BriefcaseIcon, 
  TrophyIcon 
} from '@heroicons/react/24/outline';

interface JobPlacementStatsProps {
  metrics: SuccessMetrics;
  showDetailedBreakdown?: boolean;
  animateOnView?: boolean;
  className?: string;
}

interface PlacementData {
  role: string;
  count: number;
  averageSalary: string;
  topCompanies: string[];
}



interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

function AnimatedCounter({ target, duration = 2000, suffix = '', prefix = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration]);

  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function JobPlacementStats({
  metrics,
  showDetailedBreakdown = true,
  animateOnView = true,
  className = '',
}: JobPlacementStatsProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Sample placement breakdown data
  const placementBreakdown: PlacementData[] = [
    {
      role: 'Software Engineer',
      count: 245,
      averageSalary: '$95,000',
      topCompanies: ['Google', 'Microsoft', 'Amazon'],
    },
    {
      role: 'Data Scientist',
      count: 189,
      averageSalary: '$105,000',
      topCompanies: ['Meta', 'Netflix', 'Uber'],
    },
    {
      role: 'DevOps Engineer',
      count: 156,
      averageSalary: '$98,000',
      topCompanies: ['AWS', 'Docker', 'HashiCorp'],
    },
    {
      role: 'Full Stack Developer',
      count: 312,
      averageSalary: '$88,000',
      topCompanies: ['Shopify', 'Stripe', 'Airbnb'],
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('job-placement-stats');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div id="job-placement-stats" className={`bg-gradient-to-br from-blue-50 to-indigo-100 py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Career Success Metrics
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our graduates achieve remarkable career outcomes. See how our programs 
            translate into real-world success and career advancement.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <BriefcaseIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {animateOnView && isVisible ? (
                <AnimatedCounter target={metrics.jobPlacementRate} suffix="%" />
              ) : (
                `${metrics.jobPlacementRate}%`
              )}
            </div>
            <div className="text-sm text-gray-600">Job Placement Rate</div>
            <div className="text-xs text-green-600 mt-1">Within 6 months</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              +{metrics.averageSalaryIncrease}
            </div>
            <div className="text-sm text-gray-600">Average Salary Increase</div>
            <div className="text-xs text-blue-600 mt-1">Post-graduation</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {animateOnView && isVisible ? (
                <AnimatedCounter target={3210} />
              ) : (
                '3,210'
              )}
            </div>
            <div className="text-sm text-gray-600">Successful Placements</div>
            <div className="text-xs text-purple-600 mt-1">Last 12 months</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrophyIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {animateOnView && isVisible ? (
                <AnimatedCounter target={89} suffix="%" />
              ) : (
                '89%'
              )}
            </div>
            <div className="text-sm text-gray-600">Career Advancement</div>
            <div className="text-xs text-yellow-600 mt-1">Within 2 years</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {showDetailedBreakdown && metrics.industryPartners && metrics.industryPartners.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Placement Breakdown by Role
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {placementBreakdown.map((role, index) => (
                <div key={role.role} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{role.role}</h4>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {role.count} placed
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Salary:</span>
                      <span className="text-sm font-medium text-gray-900">{role.averageSalary}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">Top Hiring Companies:</span>
                      <div className="flex flex-wrap gap-2">
                        {role.topCompanies.map((company) => (
                          <span
                            key={company}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Success Stories CTA */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Want to see more success stories from our graduates?
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                View Success Stories
              </button>
            </div>
          </div>
        )}

        {/* Industry Partners */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Hiring Partners Include
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            {metrics.industryPartners.slice(0, 6).map((partner) => (
              <span key={partner} className="text-lg font-medium">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}