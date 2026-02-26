// src/components/QuizWidget.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/solid';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT_ANSWER';
  options: QuestionOption[];
  order: number;
  points: number;
}

interface QuestionResult {
  questionId: string;
  correct: boolean;
  userAnswer: any;
  correctAnswer: any;
  explanation: string | null;
  points: number;
  earnedPoints: number;
}

interface QuizWidgetProps {
  quizId: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  questions: Question[];
  onSubmit?: (score: number, passed: boolean) => void;
}

export default function QuizWidget({
  quizId,
  title,
  description,
  timeLimit,
  passingScore,
  questions,
  onSubmit,
}: QuizWidgetProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    passed: boolean;
    results: QuestionResult[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer change for single choice
  const handleSingleChoice = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Handle answer change for multiple choice
  const handleMultipleChoice = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      const isSelected = currentAnswers.includes(optionId);
      
      return {
        ...prev,
        [questionId]: isSelected
          ? currentAnswers.filter((id: string) => id !== optionId)
          : [...currentAnswers, optionId],
      };
    });
  };

  // Handle answer change for text input
  const handleTextAnswer = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit quiz');
      }

      const data = await response.json();
      
      setResults({
        score: data.score,
        passed: data.passed,
        results: data.results,
      });
      setIsSubmitted(true);

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(data.score, data.passed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  }, [quizId, answers, isSubmitting, isSubmitted, onSubmit]);

  // Get question result by ID
  const getQuestionResult = (questionId: string): QuestionResult | undefined => {
    return results?.results.find((r) => r.questionId === questionId);
  };

  // Render question based on type
  const renderQuestion = (question: Question, index: number) => {
    const result = getQuestionResult(question.id);
    const isAnswered = answers[question.id] !== undefined;

    return (
      <Card key={question.id} className="mb-4" padding="lg">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-navy-800">
              Question {index + 1}
              <span className="ml-2 text-sm font-normal text-neutral-600">
                ({question.points} {question.points === 1 ? 'point' : 'points'})
              </span>
            </h3>
            {isSubmitted && result && (
              <div className="flex items-center gap-1">
                {result.correct ? (
                  <CheckCircleIcon className="w-6 h-6 text-success-500" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-error-500" />
                )}
              </div>
            )}
          </div>
          <p className="text-neutral-700">{question.text}</p>
        </div>

        {/* Single Choice */}
        {question.type === 'SINGLE_CHOICE' && (
          <div className="space-y-2">
            {question.options.map((option) => {
              const isSelected = answers[question.id] === option.id;
              const isCorrect = result?.correctAnswer === option.id;
              const showCorrect = isSubmitted && isCorrect;
              const showIncorrect = isSubmitted && isSelected && !result?.correct;

              return (
                <label
                  key={option.id}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    isSubmitted
                      ? showCorrect
                        ? 'border-success-500 bg-success-50'
                        : showIncorrect
                        ? 'border-error-500 bg-error-50'
                        : 'border-neutral-200 bg-white'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 bg-white hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleSingleChoice(question.id, option.id)}
                    disabled={isSubmitted}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-neutral-800">{option.text}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Multiple Choice */}
        {question.type === 'MULTIPLE_CHOICE' && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-600 mb-2">Select all that apply</p>
            {question.options.map((option) => {
              const selectedAnswers = answers[question.id] || [];
              const isSelected = selectedAnswers.includes(option.id);
              const correctAnswers = result?.correctAnswer || [];
              const isCorrect = correctAnswers.includes(option.id);
              const showCorrect = isSubmitted && isCorrect;
              const showIncorrect = isSubmitted && isSelected && !isCorrect;

              return (
                <label
                  key={option.id}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    isSubmitted
                      ? showCorrect
                        ? 'border-success-500 bg-success-50'
                        : showIncorrect
                        ? 'border-error-500 bg-error-50'
                        : 'border-neutral-200 bg-white'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 bg-white hover:border-primary-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleMultipleChoice(question.id, option.id)}
                    disabled={isSubmitted}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <span className="ml-3 text-neutral-800">{option.text}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Text Answer */}
        {question.type === 'TEXT_ANSWER' && (
          <div>
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleTextAnswer(question.id, e.target.value)}
              disabled={isSubmitted}
              placeholder="Type your answer here..."
              className="w-full p-3 border-2 border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors disabled:bg-neutral-50 disabled:cursor-not-allowed"
              rows={4}
            />
          </div>
        )}

        {/* Explanation (shown after submission) */}
        {isSubmitted && result?.explanation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
            <p className="text-sm text-blue-800">{result.explanation}</p>
          </div>
        )}
      </Card>
    );
  };

  // Calculate progress
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <Card className="mb-6" padding="lg">
        <CardHeader title={title} subtitle={description} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-neutral-700">
              <ClockIcon className="w-5 h-5" />
              <span className="text-sm">
                Time Limit: {timeLimit} minutes
              </span>
            </div>
            <div className="text-sm text-neutral-700">
              Passing Score: {passingScore}%
            </div>
          </div>
          
          {!isSubmitted && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
              timeRemaining < 60 ? 'bg-error-100 text-error-700' : 'bg-primary-100 text-primary-700'
            }`}>
              <ClockIcon className="w-5 h-5" />
              <span className="font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {!isSubmitted && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">
                Progress: {answeredCount} of {totalQuestions} questions answered
              </span>
              <span className="text-sm font-medium text-primary-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-error-300 bg-error-50" padding="md">
          <div className="flex items-center gap-2 text-error-700">
            <XCircleIcon className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Results Summary */}
      {isSubmitted && results && (
        <Card className="mb-6" padding="lg">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              results.passed ? 'bg-success-100' : 'bg-error-100'
            }`}>
              {results.passed ? (
                <CheckCircleIcon className="w-10 h-10 text-success-600" />
              ) : (
                <XCircleIcon className="w-10 h-10 text-error-600" />
              )}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${
              results.passed ? 'text-success-700' : 'text-error-700'
            }`}>
              {results.passed ? 'Congratulations!' : 'Keep Trying!'}
            </h2>
            <p className="text-lg text-neutral-700 mb-4">
              Your Score: <span className="font-bold">{results.score}%</span>
            </p>
            <p className="text-sm text-neutral-600">
              {results.passed
                ? `You passed! The passing score was ${passingScore}%.`
                : `You need ${passingScore}% to pass. Review the explanations below and try again.`}
            </p>
          </div>
        </Card>
      )}

      {/* Questions */}
      <div className="mb-6">
        {questions
          .sort((a, b) => a.order - b.order)
          .map((question, index) => renderQuestion(question, index))}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <Card padding="md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              {answeredCount === totalQuestions
                ? 'All questions answered. Ready to submit?'
                : `${totalQuestions - answeredCount} question${totalQuestions - answeredCount === 1 ? '' : 's'} remaining`}
            </p>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || answeredCount === 0}
              loading={isSubmitting}
              size="lg"
              rightIcon={<ArrowRightIcon className="w-5 h-5" />}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
