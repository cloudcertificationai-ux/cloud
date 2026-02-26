'use client';

import { 
  AcademicCapIcon, 
  ShieldCheckIcon, 
  StarIcon,
  TrophyIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';

export interface CertificationBadgeProps {
  type: 'course' | 'industry' | 'accreditation' | 'achievement' | 'partner';
  title: string;
  issuer: string;
  description?: string;
  logoUrl?: string;
  verificationUrl?: string;
  issuedDate?: Date;
  expiryDate?: Date;
  credentialId?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'premium' | 'verified';
}

export default function CertificationBadge({
  type,
  title,
  issuer,
  description,
  logoUrl,
  verificationUrl,
  issuedDate,
  expiryDate,
  credentialId,
  size = 'md',
  variant = 'default'
}: CertificationBadgeProps) {
  const getIcon = () => {
    switch (type) {
      case 'course':
        return <AcademicCapIcon className="w-5 h-5" />;
      case 'industry':
        return <ShieldCheckIcon className="w-5 h-5" />;
      case 'accreditation':
        return <CheckBadgeIcon className="w-5 h-5" />;
      case 'achievement':
        return <TrophyIcon className="w-5 h-5" />;
      case 'partner':
        return <StarIcon className="w-5 h-5" />;
      default:
        return <AcademicCapIcon className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    switch (variant) {
      case 'premium':
        return {
          container: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200',
          icon: 'text-yellow-600 bg-yellow-100',
          title: 'text-yellow-900',
          issuer: 'text-yellow-700',
          description: 'text-yellow-600'
        };
      case 'verified':
        return {
          container: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
          icon: 'text-green-600 bg-green-100',
          title: 'text-green-900',
          issuer: 'text-green-700',
          description: 'text-green-600'
        };
      default:
        return {
          container: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
          icon: 'text-blue-600 bg-blue-100',
          title: 'text-blue-900',
          issuer: 'text-blue-700',
          description: 'text-blue-600'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          icon: 'w-8 h-8',
          title: 'text-sm font-medium',
          issuer: 'text-xs',
          description: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-6',
          icon: 'w-12 h-12',
          title: 'text-lg font-semibold',
          issuer: 'text-sm',
          description: 'text-sm'
        };
      default:
        return {
          container: 'p-4',
          icon: 'w-10 h-10',
          title: 'text-base font-medium',
          issuer: 'text-sm',
          description: 'text-sm'
        };
    }
  };

  const colors = getColorClasses();
  const sizes = getSizeClasses();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={`border rounded-lg transition-all hover:shadow-md ${colors.container} ${sizes.container}`}>
      <div className="flex items-start gap-3">
        {/* Icon or Logo */}
        <div className={`rounded-full flex items-center justify-center flex-shrink-0 ${colors.icon} ${sizes.icon}`}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={`${issuer} logo`} 
              className="w-full h-full object-contain rounded-full"
            />
          ) : (
            getIcon()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium mb-1 ${colors.title} ${sizes.title}`}>
            {title}
          </h3>
          <p className={`font-medium mb-2 ${colors.issuer} ${sizes.issuer}`}>
            {issuer}
          </p>
          
          {description && (
            <p className={`mb-3 ${colors.description} ${sizes.description}`}>
              {description}
            </p>
          )}

          {/* Metadata */}
          <div className="space-y-1">
            {issuedDate && (
              <div className={`flex items-center gap-2 ${sizes.description}`}>
                <span className="text-gray-500">Issued:</span>
                <span className={colors.description}>{formatDate(issuedDate)}</span>
              </div>
            )}
            
            {expiryDate && (
              <div className={`flex items-center gap-2 ${sizes.description}`}>
                <span className="text-gray-500">Expires:</span>
                <span className={colors.description}>{formatDate(expiryDate)}</span>
              </div>
            )}
            
            {credentialId && (
              <div className={`flex items-center gap-2 ${sizes.description}`}>
                <span className="text-gray-500">ID:</span>
                <span className={`font-mono ${colors.description}`}>{credentialId}</span>
              </div>
            )}
          </div>

          {/* Verification Link */}
          {verificationUrl && (
            <div className="mt-3">
              <a
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 text-xs font-medium hover:underline ${colors.issuer}`}
              >
                <ShieldCheckIcon className="w-3 h-3" />
                Verify Credential
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Preset certification badges for common certifications
export const CommonCertifications = {
  AWS_SOLUTIONS_ARCHITECT: {
    type: 'industry' as const,
    title: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    description: 'Professional-level certification for designing distributed systems on AWS',
    variant: 'verified' as const
  },
  GOOGLE_CLOUD_ARCHITECT: {
    type: 'industry' as const,
    title: 'Google Cloud Professional Cloud Architect',
    issuer: 'Google Cloud',
    description: 'Professional certification for designing and managing Google Cloud solutions',
    variant: 'verified' as const
  },
  REACT_DEVELOPER: {
    type: 'course' as const,
    title: 'React Developer Certificate',
    issuer: 'Anywheredoor',
    description: 'Comprehensive certification covering React fundamentals to advanced concepts',
    variant: 'premium' as const
  },
  DATA_SCIENCE_PROFESSIONAL: {
    type: 'course' as const,
    title: 'Data Science Professional Certificate',
    issuer: 'Anywheredoor',
    description: 'Advanced certification in machine learning, statistics, and data analysis',
    variant: 'premium' as const
  }
};