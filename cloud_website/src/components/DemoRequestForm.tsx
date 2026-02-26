'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';

interface DemoRequest {
  contactName: string;
  email: string;
  companyName: string;
  jobTitle: string;
  companySize: string;
  industry: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  interests: string[];
  message: string;
}

interface DemoRequestFormProps {
  onSubmit: (request: DemoRequest) => void;
  onClose?: () => void;
  className?: string;
}

const DemoRequestForm: React.FC<DemoRequestFormProps> = ({
  onSubmit,
  onClose,
  className = '',
}) => {
  const [formData, setFormData] = useState<DemoRequest>({
    contactName: '',
    email: '',
    companyName: '',
    jobTitle: '',
    companySize: 'medium',
    industry: '',
    preferredDate: '',
    preferredTime: '',
    timezone: 'EST',
    interests: [],
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<DemoRequest>>({});

  const companySizes = [
    { value: 'startup', label: '1-10 employees' },
    { value: 'small', label: '11-50 employees' },
    { value: 'medium', label: '51-200 employees' },
    { value: 'large', label: '201-1000 employees' },
    { value: 'enterprise', label: '1000+ employees' },
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const timezones = [
    'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'JST', 'AEST'
  ];

  const demoInterests = [
    'Learning Hub+ Platform Overview',
    'Custom Training Programs',
    'Skills Assessment Tools',
    'Analytics & Reporting',
    'Integration Capabilities',
    'Certification Programs',
    'Pricing & Packages',
    'Implementation Timeline',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof DemoRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DemoRequest> = {};

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Preferred date is required';
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Preferred time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Reset form on successful submission
      setFormData({
        contactName: '',
        email: '',
        companyName: '',
        jobTitle: '',
        companySize: 'medium',
        industry: '',
        preferredDate: '',
        preferredTime: '',
        timezone: 'EST',
        interests: [],
        message: '',
      });
    } catch (error) {
      console.error('Error submitting demo request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto ${className}`}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Schedule Your Personalized Demo
        </h2>
        <p className="text-lg text-gray-600">
          See our enterprise learning solutions in action. Our team will show you how 
          we can help transform your workforce development strategy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <Input
              id="contactName"
              name="contactName"
              type="text"
              value={formData.contactName}
              onChange={handleInputChange}
              className={errors.contactName ? 'border-red-500' : ''}
              placeholder="Your full name"
            />
            {errors.contactName && (
              <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Business Email *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="your.email@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              value={formData.companyName}
              onChange={handleInputChange}
              className={errors.companyName ? 'border-red-500' : ''}
              placeholder="Your company name"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <Input
              id="jobTitle"
              name="jobTitle"
              type="text"
              value={formData.jobTitle}
              onChange={handleInputChange}
              className={errors.jobTitle ? 'border-red-500' : ''}
              placeholder="e.g., HR Director, CTO, L&D Manager"
            />
            {errors.jobTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
            )}
          </div>

          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
              Company Size
            </label>
            <select
              id="companySize"
              name="companySize"
              value={formData.companySize}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {companySizes.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
              Industry *
            </label>
            <Input
              id="industry"
              name="industry"
              type="text"
              value={formData.industry}
              onChange={handleInputChange}
              className={errors.industry ? 'border-red-500' : ''}
              placeholder="e.g., Financial Services, Healthcare"
            />
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
            )}
          </div>
        </div>

        {/* Scheduling */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Demo Time</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date *
              </label>
              <input
                id="preferredDate"
                name="preferredDate"
                type="date"
                min={today}
                value={formData.preferredDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.preferredDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.preferredDate && (
                <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time *
              </label>
              <select
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.preferredTime ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.preferredTime && (
                <p className="mt-1 text-sm text-red-600">{errors.preferredTime}</p>
              )}
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Demo Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What would you like to see in the demo? (Select all that apply)
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {demoInterests.map(interest => (
              <label key={interest} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Information
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any specific questions or requirements you'd like us to address during the demo?"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Demo'}
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          We'll confirm your demo within 2 hours. For immediate scheduling, 
          call us at <span className="font-semibold text-blue-600">1-800-DEMO-NOW</span>
        </p>
      </div>
    </div>
  );
};

export default DemoRequestForm;