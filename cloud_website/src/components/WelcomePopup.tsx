'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';

interface CountryCode {
  name: string;
  dial_code: string;
  code: string;
  flag?: string;
}

interface WelcomeFormData {
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  course: string;
  whatsappConsent: boolean;
  termsAccepted: boolean;
}

interface WelcomePopupProps {
  onSubmit?: (data: WelcomeFormData) => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [formData, setFormData] = useState<WelcomeFormData>({
    fullName: '',
    countryCode: '+91',
    phoneNumber: '',
    email: '',
    course: '',
    whatsappConsent: false,
    termsAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<{
    fullName: string;
    phoneNumber: string;
    email: string;
    course: string;
    termsAccepted: string;
  }>>({});

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('welcomePopupShown');
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Fetch country codes from API
    const fetchCountryCodes = async () => {
      try {
        const response = await fetch('https://apihut.in/api/country/phone-codes');
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          setCountryCodes(data);
        }
      } catch (error) {
        console.error('Error fetching country codes:', error);
        // Fallback to default countries if API fails
        setCountryCodes([
          { name: 'India', dial_code: '+91', code: 'IN' },
          { name: 'United States', dial_code: '+1', code: 'US' },
          { name: 'United Kingdom', dial_code: '+44', code: 'GB' },
        ]);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountryCodes();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('welcomePopupShown', 'true');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<{
      fullName: string;
      phoneNumber: string;
      email: string;
      course: string;
      termsAccepted: string;
    }> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Please select a course';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
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
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (onSubmit) {
          await onSubmit(formData);
        }

        handleClose();
        alert(data.message || 'Thank you! We will contact you shortly.');
      } else {
        alert(data.message || 'Failed to submit your request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ 
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(30, 41, 59, 0.85) 100%)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
    >
      <div className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-20 p-2.5 text-white hover:text-gray-200 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close popup"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Left side - Enhanced Branding */}
          <div className="relative w-full md:w-[45%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-10 md:p-12 text-white overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-3 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30 transform hover:scale-105 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                  Begin Your<br />Journey With Us
                </h2>
                <p className="text-lg text-white/80 mb-8">
                  Transform your career with industry-leading courses
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl">
                  <h3 className="text-sm font-semibold mb-3 text-white/90 uppercase tracking-wide">Program Designed By</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 bg-white rounded-xl text-primary-700 font-semibold text-sm shadow-lg">
                      Industry Partners
                    </span>
                    <span className="px-4 py-2 bg-white rounded-xl text-primary-700 font-semibold text-sm shadow-lg">
                      Top Experts
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">Why Choose Us</h3>
                  {[
                    { icon: '👥', text: '50,000+ Students Trained' },
                    { icon: '⭐', text: '4.8/5 Average Rating' },
                    { icon: '🎓', text: 'Industry-Certified Instructors' },
                    { icon: '💼', text: '92% Job Placement Rate' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 bg-accent-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span className="text-white/90 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Modern Form */}
          <div className="w-full md:w-[55%] bg-white p-8 md:p-12 overflow-y-auto max-h-[95vh] md:max-h-none">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h2 id="welcome-popup-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Request A Free Demo
                </h2>
                <p className="text-gray-600">
                  Fill in your details and we'll get back to you shortly
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name*
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-4 border-2 rounded-xl transition-all focus:ring-4 focus:ring-primary-100 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number*
                  </label>
                  <div className="flex gap-3">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      disabled={loadingCountries}
                      className="h-12 px-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 focus:outline-none font-semibold text-gray-700 cursor-pointer min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1rem',
                        paddingRight: '2rem'
                      }}
                    >
                      {loadingCountries ? (
                        <option>Loading...</option>
                      ) : countryCodes.length > 0 ? (
                        countryCodes.map((country) => (
                          <option key={country.code} value={country.dial_code}>
                            {country.code} {country.dial_code}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="+91">IN +91</option>
                          <option value="+1">US +1</option>
                          <option value="+44">GB +44</option>
                        </>
                      )}
                    </select>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`flex-1 h-12 px-4 border-2 rounded-xl transition-all focus:ring-4 focus:ring-primary-100 ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address*
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-4 border-2 rounded-xl transition-all focus:ring-4 focus:ring-primary-100 ${
                      errors.email ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Course Selection */}
                <div>
                  <label htmlFor="course" className="block text-sm font-semibold text-gray-900 mb-2">
                    Course You're Looking For*
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-4 border-2 rounded-xl transition-all focus:ring-4 focus:ring-primary-100 focus:outline-none appearance-none bg-white cursor-pointer ${
                      errors.course ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.25rem'
                    }}
                  >
                    <option value="">Select a course</option>
                    <option value="web-development">Web Development</option>
                    <option value="data-science">Data Science & Analytics</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="cloud-computing">Cloud Computing</option>
                    <option value="ai-ml">AI & Machine Learning</option>
                    <option value="mobile-development">Mobile Development</option>
                  </select>
                  {errors.course && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.course}
                    </p>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 hover:border-green-300 transition-colors">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">Connect on WhatsApp</span>
                    </div>
                    <input
                      type="checkbox"
                      name="whatsappConsent"
                      checked={formData.whatsappConsent}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-transform hover:scale-110"
                    />
                  </label>
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleInputChange}
                      className="mt-0.5 w-5 h-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded flex-shrink-0 transition-transform hover:scale-110"
                    />
                    <span className="text-sm text-gray-600 leading-relaxed">
                      By registering, I agree to Cloud Certification{' '}
                      <a href="/terms" className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-2 underline-offset-2">
                        Terms & Conditions
                      </a>
                    </span>
                  </label>
                  {errors.termsAccepted && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.termsAccepted}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-lg rounded-xl shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Continue
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
