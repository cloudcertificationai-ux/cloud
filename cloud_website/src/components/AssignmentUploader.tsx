'use client';

/**
 * AssignmentUploader Component
 * 
 * Component for uploading assignment submissions to the VOD Media System.
 * Displays assignment details, handles file upload with progress tracking,
 * and shows submission status with grading information.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { 
  ArrowUpTrayIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface AssignmentUploaderProps {
  assignmentId: string;
  onSubmitComplete?: (submission: SubmissionInfo) => void;
  onSubmitError?: (error: UploadError) => void;
  className?: string;
}

interface AssignmentInfo {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  maxMarks: number;
  requirements: string;
}

interface SubmissionInfo {
  id: string;
  assignmentId: string;
  userId: string;
  fileName: string;
  submittedAt: Date;
  isLate: boolean;
  marks: number | null;
  feedback: string | null;
  gradedAt: Date | null;
  assignment?: AssignmentInfo;
}

interface UploadError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

type UploadState = 'loading' | 'idle' | 'uploading' | 'submitted' | 'graded' | 'error';

export function AssignmentUploader({
  assignmentId,
  onSubmitComplete,
  onSubmitError,
  className = '',
}: AssignmentUploaderProps) {
  const [state, setState] = useState<UploadState>('loading');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<UploadError | null>(null);
  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
  const [submission, setSubmission] = useState<SubmissionInfo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Load assignment details and check for existing submission
   * Requirement 7.1: Display assignment details
   */
  useEffect(() => {
    const loadAssignmentData = async () => {
      try {
        setState('loading');
        
        // Check for existing submission first
        const submissionResponse = await fetch(
          `/api/assignments/${assignmentId}/submission`,
          {
            credentials: 'include',
          }
        );

        if (submissionResponse.ok) {
          const submissionData = await submissionResponse.json();
          if (submissionData.success && submissionData.submission) {
            const sub = submissionData.submission;
            setSubmission({
              id: sub.id,
              assignmentId: sub.assignmentId,
              userId: sub.userId,
              fileName: sub.fileName,
              submittedAt: new Date(sub.submittedAt),
              isLate: sub.isLate,
              marks: sub.marks,
              feedback: sub.feedback,
              gradedAt: sub.gradedAt ? new Date(sub.gradedAt) : null,
              assignment: sub.assignment ? {
                id: sub.assignment.id,
                title: sub.assignment.title,
                description: sub.assignment.description,
                dueDate: new Date(sub.assignment.dueDate),
                maxMarks: sub.assignment.maxMarks,
                requirements: sub.assignment.requirements || '',
              } : undefined,
            });
            
            // Set assignment from submission data if available
            if (sub.assignment) {
              setAssignment({
                id: sub.assignment.id,
                title: sub.assignment.title,
                description: sub.assignment.description,
                dueDate: new Date(sub.assignment.dueDate),
                maxMarks: sub.assignment.maxMarks,
                requirements: sub.assignment.requirements || '',
              });
            }
            
            // Determine state based on grading status
            setState(sub.marks !== null ? 'graded' : 'submitted');
            return;
          }
        }

        // No submission found, load assignment details
        // Note: We would need an endpoint to get assignment details
        // For now, we'll set to idle state
        setState('idle');
      } catch (err) {
        console.error('Error loading assignment data:', err);
        setError({
          code: 'LOAD_FAILED',
          message: err instanceof Error ? err.message : 'Failed to load assignment',
        });
        setState('error');
      }
    };

    loadAssignmentData();
  }, [assignmentId]);

  /**
   * Upload file to R2 with progress tracking
   * Requirement 7.2: Upload file to R2 with progress tracking
   */
  const uploadToR2 = async (file: File, uploadUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress(percentage);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.timeout = 300000; // 5 minutes
      xhr.send(file);
    });
  };

  /**
   * Handle file upload and submission
   * Requirements: 7.2, 7.3, 7.4
   */
  const handleFileUpload = useCallback(async (file: File) => {
    setSelectedFile(file);
    setState('uploading');
    setProgress(0);
    setError(null);

    try {
      // Step 1: Request presigned URL (Requirement 7.2)
      const presignResponse = await fetch(
        `/api/assignments/${assignmentId}/presign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            fileName: file.name,
          }),
        }
      );

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json();
        throw new Error(errorData.message || 'Failed to get upload URL');
      }

      const presignData = await presignResponse.json();
      const { uploadUrl, submissionId } = presignData;

      // Step 2: Upload to R2
      await uploadToR2(file, uploadUrl);

      // Step 3: Submit assignment (Requirement 7.3)
      const submitResponse = await fetch(
        `/api/assignments/${assignmentId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ submissionId }),
        }
      );

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.message || 'Failed to submit assignment');
      }

      const submitData = await submitResponse.json();
      const sub = submitData.submission;

      const submissionInfo: SubmissionInfo = {
        id: sub.id,
        assignmentId: sub.assignmentId,
        userId: sub.userId,
        fileName: sub.fileName,
        submittedAt: new Date(sub.submittedAt),
        isLate: sub.isLate,
        marks: sub.marks,
        feedback: sub.feedback,
        gradedAt: sub.gradedAt ? new Date(sub.gradedAt) : null,
      };

      setSubmission(submissionInfo);
      setState('submitted');
      onSubmitComplete?.(submissionInfo);
    } catch (err) {
      const uploadError: UploadError = {
        code: 'UPLOAD_FAILED',
        message: err instanceof Error ? err.message : 'Upload failed',
      };
      setError(uploadError);
      setState('error');
      onSubmitError?.(uploadError);
    }
  }, [assignmentId, onSubmitComplete, onSubmitError]);

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  /**
   * Handle click to open file picker
   */
  const handleClick = useCallback(() => {
    if (state === 'idle' || state === 'error') {
      fileInputRef.current?.click();
    }
  }, [state]);

  /**
   * Handle retry
   */
  const handleRetry = useCallback(() => {
    setState('idle');
    setError(null);
    setProgress(0);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Check if assignment is overdue
   */
  const isOverdue = (dueDate: Date): boolean => {
    return new Date() > dueDate;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Assignment Details (Requirement 7.1) */}
      {assignment && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {assignment.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {assignment.description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-700">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
              <div>
                <span className="font-medium">Due Date:</span>{' '}
                <span className={isOverdue(assignment.dueDate) ? 'text-red-600' : ''}>
                  {formatDate(assignment.dueDate)}
                </span>
                {isOverdue(assignment.dueDate) && (
                  <span className="ml-2 text-xs text-red-600 font-medium">
                    (Overdue)
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center text-gray-700">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-400" />
              <div>
                <span className="font-medium">Max Marks:</span> {assignment.maxMarks}
              </div>
            </div>
          </div>

          {assignment.requirements && (
            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-1">Requirements:</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {assignment.requirements}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {state === 'loading' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading assignment...</p>
        </div>
      )}

      {/* Upload Area - Idle State */}
      {state === 'idle' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submit Assignment
          </label>
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white cursor-pointer hover:border-gray-400 transition-colors"
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleInputChange}
            />
            <div className="text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to select a file to upload
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Any file type accepted
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uploading State */}
      {state === 'uploading' && (
        <div className="border-2 border-blue-300 rounded-lg p-8 bg-blue-50">
          <div className="text-center">
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-700 font-medium">
              Uploading {selectedFile?.name}...
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {progress}% complete
            </p>
          </div>
        </div>
      )}

      {/* Submitted State (Requirement 7.4, 7.7) */}
      {state === 'submitted' && submission && (
        <div className="border-2 border-yellow-300 rounded-lg p-6 bg-yellow-50">
          <div className="text-center">
            <ClockIcon className="mx-auto h-12 w-12 text-yellow-500" />
            <p className="mt-2 text-sm text-yellow-700 font-medium">
              Assignment Submitted - Pending Grading
            </p>
            <div className="mt-4 text-sm text-gray-700 space-y-2">
              <p>
                <span className="font-medium">File:</span> {submission.fileName}
              </p>
              <p>
                <span className="font-medium">Submitted:</span>{' '}
                {formatDate(submission.submittedAt)}
              </p>
              {/* Late Submission Indicator (Requirement 7.4) */}
              {submission.isLate && (
                <p className="text-red-600 font-medium">
                  ⚠️ This submission was late
                </p>
              )}
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Your instructor will review and grade your submission.
            </p>
          </div>
        </div>
      )}

      {/* Graded State (Requirement 7.5, 7.7) */}
      {state === 'graded' && submission && (
        <div className="border-2 border-green-300 rounded-lg p-6 bg-green-50">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
            <p className="mt-2 text-sm text-green-700 font-medium">
              Assignment Graded
            </p>
            <div className="mt-4 space-y-3">
              {/* Marks Display (Requirement 7.5, 7.7) */}
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-2xl font-bold text-gray-900">
                  {submission.marks} / {assignment?.maxMarks || submission.assignment?.maxMarks || '?'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Your Score</p>
              </div>

              {/* Feedback Display (Requirement 7.5, 7.7) */}
              {submission.feedback && (
                <div className="bg-white rounded-lg p-4 border border-green-200 text-left">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Instructor Feedback:
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {submission.feedback}
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">File:</span> {submission.fileName}
                </p>
                <p>
                  <span className="font-medium">Submitted:</span>{' '}
                  {formatDate(submission.submittedAt)}
                </p>
                {submission.gradedAt && (
                  <p>
                    <span className="font-medium">Graded:</span>{' '}
                    {formatDate(submission.gradedAt)}
                  </p>
                )}
                {/* Late Submission Indicator (Requirement 7.4) */}
                {submission.isLate && (
                  <p className="text-red-600 text-xs font-medium">
                    ⚠️ This submission was late
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {state === 'error' && error && (
        <div className="border-2 border-red-300 rounded-lg p-6 bg-red-50">
          <div className="text-center">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-2 text-sm text-red-600 font-medium">
              {error.message}
            </p>
            {error.details && (
              <div className="mt-2 text-xs text-red-500">
                {Object.entries(error.details).map(([key, messages]) => (
                  <div key={key}>
                    {messages.map((msg, idx) => (
                      <p key={idx}>{msg}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
