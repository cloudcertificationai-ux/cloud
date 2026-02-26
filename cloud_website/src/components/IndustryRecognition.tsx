'use client';

import { 
  BuildingOfficeIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  TrophyIcon
} from '@heroicons/react/24/solid';

export interface IndustryRecognitionProps {
  recognitions: IndustryRecognitionItem[];
  title?: string;
  layout?: 'grid' | 'carousel' | 'list';
  showDescription?: boolean;
}

export interface IndustryRecognitionItem {
  id: string;
  type: 'accreditation' | 'partnership' | 'certification' | 'award' | 'membership';
  name: string;
  organization: string;
  description?: string;
  logoUrl?: string;
  verificationUrl?: string;
  dateReceived?: Date;
  validUntil?: Date;
  credibilityScore?: number; // 1-5 scale
  isGlobal?: boolean;
}

export default function IndustryRecognition({
  recognitions,
  title = "Industry Recognition & Accreditation",
  layout = 'grid',
  showDescription = true
}: IndustryRecognitionProps) {
  const getTypeIcon = (type: IndustryRecognitionItem['type']) => {
    switch (type) {
      case 'accreditation':
        return <ShieldCheckIcon className="w-5 h-5" />;
      case 'partnership':
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'certification':
        return <AcademicCapIcon className="w-5 h-5" />;
      case 'award':
        return <TrophyIcon className="w-5 h-5" />;
      case 'membership':
        return <GlobeAltIcon className="w-5 h-5" />;
      default:
        return <ShieldCheckIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: IndustryRecognitionItem['type']) => {
    switch (type) {
      case 'accreditation':
        return 'text-green-600 bg-green-100';
      case 'partnership':
        return 'text-blue-600 bg-blue-100';
      case 'certification':
        return 'text-purple-600 bg-purple-100';
      case 'award':
        return 'text-yellow-600 bg-yellow-100';
      case 'membership':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const renderRecognitionItem = (recognition: IndustryRecognitionItem) => (
    <div
      key={recognition.id}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Logo or Icon */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(recognition.type)}`}>
          {recognition.logoUrl ? (
            <img
              src={recognition.logoUrl}
              alt={`${recognition.organization} logo`}
              className="w-8 h-8 object-contain"
            />
          ) : (
            getTypeIcon(recognition.type)
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              {recognition.name}
            </h3>
            {recognition.isGlobal && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <GlobeAltIcon className="w-3 h-3" />
                Global
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-gray-700 mb-2">
            {recognition.organization}
          </p>

          {showDescription && recognition.description && (
            <p className="text-sm text-gray-600 mb-3">
              {recognition.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {recognition.dateReceived && (
              <span>Received: {formatDate(recognition.dateReceived)}</span>
            )}
            {recognition.validUntil && (
              <span>Valid until: {formatDate(recognition.validUntil)}</span>
            )}
            {recognition.credibilityScore && (
              <div className="flex items-center gap-1">
                <span>Credibility:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < recognition.credibilityScore! ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verification Link */}
          {recognition.verificationUrl && (
            <div className="mt-3">
              <a
                href={recognition.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                <ShieldCheckIcon className="w-3 h-3" />
                Verify Recognition
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (recognitions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">
          Recognized by leading industry organizations and accreditation bodies
        </p>
      </div>

      {layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recognitions.map(renderRecognitionItem)}
        </div>
      )}

      {layout === 'list' && (
        <div className="space-y-4">
          {recognitions.map(renderRecognitionItem)}
        </div>
      )}

      {layout === 'carousel' && (
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
            {recognitions.map((recognition) => (
              <div key={recognition.id} className="w-80 flex-shrink-0">
                {renderRecognitionItem(recognition)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Statement */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Trusted & Verified Education
          </h3>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our courses and certifications are recognized by industry leaders and accredited by 
          educational standards organizations, ensuring you receive quality education that 
          employers value and trust.
        </p>
      </div>
    </div>
  );
}

