'use client';

import { 
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import { 
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export interface CareerPathwayProps {
  pathways: CareerPath[];
  title?: string;
  showSalaryInfo?: boolean;
  showTimeToRole?: boolean;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  level: 'entry' | 'mid' | 'senior' | 'executive';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  timeToRole?: string; // e.g., "6-12 months"
  demandLevel: 'low' | 'medium' | 'high' | 'very-high';
  skills: string[];
  companies: string[];
  growthRate?: string; // e.g., "15% annually"
  jobOpenings?: number;
  nextRoles?: string[];
}

export default function CareerPathway({
  pathways,
  title = "Career Pathways & Opportunities",
  showSalaryInfo = true,
  showTimeToRole = true
}: CareerPathwayProps) {
  const getLevelColor = (level: CareerPath['level']) => {
    switch (level) {
      case 'entry':
        return 'bg-green-100 text-green-700';
      case 'mid':
        return 'bg-blue-100 text-blue-700';
      case 'senior':
        return 'bg-purple-100 text-purple-700';
      case 'executive':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDemandColor = (demand: CareerPath['demandLevel']) => {
    switch (demand) {
      case 'very-high':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toString();
    };

    return `${salary.currency}${formatNumber(salary.min)} - ${salary.currency}${formatNumber(salary.max)}`;
  };

  if (pathways.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Advance to leadership roles at Fortune 500 companies. Our industry-aligned curriculum 
          prepares you for high-demand positions with proven career progression paths and salary growth.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pathways.map((pathway) => (
          <div
            key={pathway.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pathway.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {pathway.description}
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(pathway.level)}`}>
                  {pathway.level.charAt(0).toUpperCase() + pathway.level.slice(1)} Level
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(pathway.demandLevel)}`}>
                  {pathway.demandLevel.replace('-', ' ').toUpperCase()} Demand
                </span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {showSalaryInfo && pathway.salaryRange && (
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Salary Range</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatSalary(pathway.salaryRange)}
                    </p>
                  </div>
                </div>
              )}

              {showTimeToRole && pathway.timeToRole && (
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Time to Role</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {pathway.timeToRole}
                    </p>
                  </div>
                </div>
              )}

              {pathway.growthRate && (
                <div className="flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Growth Rate</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {pathway.growthRate}
                    </p>
                  </div>
                </div>
              )}

              {pathway.jobOpenings && (
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Job Openings</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {pathway.jobOpenings.toLocaleString()}+
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Skills Required */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                Key Skills:
              </p>
              <div className="flex flex-wrap gap-1">
                {pathway.skills.slice(0, 6).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {pathway.skills.length > 6 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{pathway.skills.length - 6} more
                  </span>
                )}
              </div>
            </div>

            {/* Hiring Companies */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                Hiring Companies:
              </p>
              <div className="flex flex-wrap gap-1">
                {pathway.companies.slice(0, 4).map((company, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                  >
                    {company}
                  </span>
                ))}
                {pathway.companies.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{pathway.companies.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Next Career Steps */}
            {pathway.nextRoles && pathway.nextRoles.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Career Progression:
                </p>
                <div className="flex flex-wrap gap-1">
                  {pathway.nextRoles.map((role, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Success Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Industry-Leading Career Outcomes
          </h3>
          <p className="text-gray-600">
            Real career advancement results from our Fortune 500-aligned curriculum
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <UserGroupIcon className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">92%</p>
            <p className="text-sm text-gray-600">Leadership Role Placement</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">75%</p>
            <p className="text-sm text-gray-600">Average Salary Increase</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">2.8</p>
            <p className="text-sm text-gray-600">Months to Senior Role</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">85%</p>
            <p className="text-sm text-gray-600">Promoted to Team Lead</p>
          </div>
        </div>
      </div>
    </div>
  );
}

