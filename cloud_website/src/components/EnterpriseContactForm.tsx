'use client';

import React, { useState } from 'react';
import { EnterpriseInquiry } from '@/types';
import { Button, Input } from '@/components/ui';

interface EnterpriseContactFormProps {
  onSubmit: (inquiry: EnterpriseInquiry) => void;
  onClose?: () => void;
  requestType?: 'demo' | 'consultation' | 'custom_training' | 'platform_access';
  className?: string;
}

const EnterpriseContactForm: React.FC<EnterpriseContactFormProps> = ({
  onSubmit,
  onClose,
  requestType = 'consultation',
  className = '',
}) => {
  const [formData, setFormData] = useState<EnterpriseInquiry>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    companySize: 'medium',
    industry: '',
    trainingNeeds: [],
    timeline: '',
    budget: '',
    message: '',
    requestType,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<EnterpriseInquiry>>({});

  const companySizes = [
    { value: 'startup', label: '1-10 employees' },
    { value: 'small', label: '11-50 employees' },
    { value: 'medium', label: '51-200 employees' },
    { value: 'large', label: '201-1000 employees' },
    { value: 'enterprise', label: '1000+ employees' },
  ];

  const trainingOptions = [
    'Web Development',
    'Data Science & Analytics',
    'Cloud Computing',
    'Cybersecurity',
    'DevOps & Infrastructure',
    'AI & Machine Learning',
    'Mobile Development',
    'Leadership & Management',
    'Digital Transformation',
    'Custom Technology Training',
  ];

  const timelineOptions = [
    'Immediate (within 1 month)',
    'Short-term (1-3 months)',
    'Medium-term (3-6 months)',
    'Long-term (6+ months)',
    'Ongoing partnership',
  ];

  const budgetRanges = [
    'Under $25,000',
    '$25,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000 - $250,000',
    '$250,000+',
    'Prefer to discuss',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof EnterpriseInquiry]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTrainingNeedsChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      trainingNeeds: prev.trainingNeeds.includes(option)
        ? prev.trainingNeeds.filter(need => need !== option)
        : [...prev.trainingNeeds, option],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EnterpriseInquiry> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }

    if (formData.trainingNeeds.length === 0) {
      newErrors.trainingNeeds = ['Please select at least one training need'] as any;
    }

    if (!formData.timeline) {
      newErrors.timeline = 'Timeline is required';
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
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        companySize: 'medium',
        industry: '',
        trainingNeeds: [],
        timeline: '',
        budget: '',
        message: '',
        requestType,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormTitle = () => {
    switch (requestType) {
      case 'demo':
        return 'Schedule a Demo';
      case 'custom_training':
        return 'Request Custom Training';
      case 'platform_access':
        return 'Request Platform Access';
      default:
        return 'Contact Our Enterprise Team';
    }
  };

  const getFormDescription = () => {
    switch (requestType) {
      case 'demo':
        return 'See our enterprise solutions in action with a personalized demo.';
      case 'custom_training':
        return 'Tell us about your specific training needs and we\'ll create a custom program.';
      case 'platform_access':
        return 'Get access to our Learning Hub+ enterprise platform.';
      default:
        return 'Let\'s discuss how we can help transform your workforce.';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto ${className}`}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{getFormTitle()}</h2>
        <p className="text-lg text-gray-600">{getFormDescription()}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Company Information */}
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
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name *
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
            />
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
              placeholder="e.g., Financial Services, Healthcare, Technology"
            />
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
            )}
          </div>
        </div>

        {/* Training Needs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Training Needs * (Select all that apply)
          </label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trainingOptions.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.trainingNeeds.includes(option)}
                  onChange={() => handleTrainingNeedsChange(option)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {errors.trainingNeeds && (
            <p className="mt-1 text-sm text-red-600">{errors.trainingNeeds[0]}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
              Timeline *
            </label>
            <select
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.timeline ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select timeline</option>
              {timelineOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.timeline && (
              <p className="mt-1 text-sm text-red-600">{errors.timeline}</p>
            )}
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              Budget Range
            </label>
            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select budget range</option>
              {budgetRanges.map(range => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Information
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us more about your specific needs, goals, or any questions you have..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
          Our enterprise team will respond within 24 hours. For immediate assistance, 
          call us at <span className="font-semibold text-blue-600">1-800-LEARN-NOW</span>
        </p>
      </div>
    </div>
  );
};

export default EnterpriseContactForm;