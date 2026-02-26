'use client';

import { useState, useEffect } from 'react';
import { SuccessMetrics } from '@/types';
import { UsersIcon, ArrowTrendingUpIcon, AcademicCapIcon, StarIcon } from '@heroicons/react/24/outline';

interface EnrollmentStatsProps {
  metrics: SuccessMetrics;
  showRealTime?: boolean;
  className?: string;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  suffix?: string;
  animated?: boolean;
}

function StatItem({ icon, value, label, suffix = '', animated = false }: StatItemProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated || typeof value !== 'number') return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animated]);

  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">
        <div className="p-3 bg-blue-100 rounded-full">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
        {suffix}
      </div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}

export function EnrollmentStats({ 
  metrics, 
  showRealTime = true, 
  className = '' 
}: EnrollmentStatsProps) {
  const [realtimeStats, setRealtimeStats] = useState(metrics);

  // Simulate real-time updates
  useEffect(() => {
    if (!showRealTime) return;

    const interval = setInterval(() => {
      setRealtimeStats(prev => ({
        ...prev,
        totalStudents: prev.totalStudents + Math.floor(Math.random() * 3), // 0-2 new students
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [showRealTime]);

  const stats = [
    {
      icon: <UsersIcon className="w-6 h-6 text-blue-600" />,
      value: realtimeStats.totalStudents,
      label: 'Students Enrolled',
      animated: true,
    },
    {
      icon: <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />,
      value: realtimeStats.jobPlacementRate,
      label: 'Job Placement Rate',
      suffix: '%',
      animated: true,
    },
    {
      icon: <AcademicCapIcon className="w-6 h-6 text-yellow-600" />,
      value: realtimeStats.courseCompletionRate,
      label: 'Course Completion Rate',
      suffix: '%',
      animated: true,
    },
    {
      icon: <StarIcon className="w-6 h-6 text-purple-600" />,
      value: realtimeStats.averageRating,
      label: 'Average Rating',
      suffix: '/5',
      animated: false,
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Our Success by the Numbers
        </h2>
        <p className="text-gray-600">
          Real-time statistics showing our impact on students' careers
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatItem
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            suffix={stat.suffix}
            animated={stat.animated}
          />
        ))}
      </div>

      {/* Additional metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Average Salary Increase</p>
          <p className="text-3xl font-bold text-green-600">
            +{realtimeStats.averageSalaryIncrease}
          </p>
        </div>
      </div>

      {/* Real-time indicator */}
      {showRealTime && (
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live statistics
          </div>
        </div>
      )}
    </div>
  );
}