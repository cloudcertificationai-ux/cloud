/**
 * Property-Based Tests for Graceful Error Handling
 * Feature: anywheredoor, Property 10: Graceful Error Handling
 * Validates: Requirements 6.4
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { 
  ErrorBoundary, 
  CourseErrorBoundary, 
  InstructorErrorBoundary,
  CourseFallback,
  InstructorFallback,
  ContentFallback,
  EmptySearchFallback,
  NetworkErrorFallback,
  LoadingFallback,
} from '@/components';

// Component that throws an error for testing
function ThrowingComponent({ shouldThrow, errorMessage }: { shouldThrow: boolean; errorMessage?: string }) {
  if (shouldThrow) {
    throw new Error(errorMessage || 'Test error');
  }
  return <div>Normal content</div>;
}

// Component with missing data for testing
function ComponentWithMissingData({ data }: { data: any }) {
  if (!data) {
    return <CourseFallback />;
  }
  if (!data.title) {
    return <ContentFallback title="Missing title" message="Course title is not available" />;
  }
  return <div>{data.title}</div>;
}

describe('Graceful Error Handling Property Tests', () => {
  // Property 10: Graceful Error Handling
  // For any missing or incomplete data, the platform should display appropriate fallback content 
  // or error messages without breaking the user interface
  
  it('should handle any error thrown by child components gracefully', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.string({ minLength: 1, maxLength: 100 }),
        (shouldThrow, errorMessage) => {
          const { container } = render(
            <ErrorBoundary>
              <ThrowingComponent shouldThrow={shouldThrow} errorMessage={errorMessage} />
            </ErrorBoundary>
          );

          if (shouldThrow) {
            // Should display error UI instead of crashing
            expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
            expect(container.querySelector('svg')).toBeInTheDocument(); // Error icon
          } else {
            // Should display normal content
            expect(screen.getByText('Normal content')).toBeInTheDocument();
          }

          // UI should never be completely broken (container should have content)
          expect(container.firstChild).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle course-specific errors gracefully', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (shouldThrow, errorMessage) => {
          const { container } = render(
            <CourseErrorBoundary>
              <ThrowingComponent shouldThrow={shouldThrow} errorMessage={errorMessage} />
            </CourseErrorBoundary>
          );

          if (shouldThrow) {
            // Should display course-specific error UI
            expect(screen.getByText(/course unavailable/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
          } else {
            // Should display normal content
            expect(screen.getByText('Normal content')).toBeInTheDocument();
          }

          // Should maintain proper structure
          expect(container.firstChild).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle instructor-specific errors gracefully', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (shouldThrow, errorMessage) => {
          const { container } = render(
            <InstructorErrorBoundary>
              <ThrowingComponent shouldThrow={shouldThrow} errorMessage={errorMessage} />
            </InstructorErrorBoundary>
          );

          if (shouldThrow) {
            // Should display instructor-specific error UI
            expect(screen.getByText(/instructor unavailable/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
          } else {
            // Should display normal content
            expect(screen.getByText('Normal content')).toBeInTheDocument();
          }

          // Should maintain proper structure
          expect(container.firstChild).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display appropriate fallback UI for any missing or incomplete data', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.record({
            id: fc.option(fc.string()),
            title: fc.option(fc.string()),
            description: fc.option(fc.string()),
          })
        ),
        (data) => {
          const { container } = render(
            <ComponentWithMissingData data={data} />
          );

          // Should always render something (never crash or render nothing)
          expect(container.firstChild).not.toBeNull();

          if (!data) {
            // Should show course fallback for null/undefined data
            expect(screen.getByText(/course information unavailable/i)).toBeInTheDocument();
            expect(screen.getByText(/course unavailable/i)).toBeInTheDocument();
          } else if (!data.title) {
            // Should show content fallback for missing title
            expect(screen.getByText(/missing title/i)).toBeInTheDocument();
            expect(screen.getByText(/course title is not available/i)).toBeInTheDocument();
          } else {
            // Should show normal content when data is complete
            expect(screen.getByText(data.title)).toBeInTheDocument();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty search results gracefully', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
        fc.boolean(),
        (query, showSuggestions) => {
          const mockClearFilters = jest.fn();
          
          render(
            <EmptySearchFallback 
              query={query} 
              onClearFilters={mockClearFilters}
              showSuggestions={showSuggestions}
            />
          );

          // Should always display "No courses found" message
          expect(screen.getByText(/no courses found/i)).toBeInTheDocument();
          
          // Should display appropriate message based on query
          if (query) {
            expect(screen.getByText(new RegExp(query, 'i'))).toBeInTheDocument();
          }

          // Should provide clear filters button
          expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
          
          // Should provide browse all courses link
          expect(screen.getByRole('link', { name: /browse all courses/i })).toBeInTheDocument();

          // Should show suggestions if enabled
          if (showSuggestions) {
            expect(screen.getByText(/popular searches/i)).toBeInTheDocument();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle network errors gracefully', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (hasRetryFunction) => {
          const mockRetry = hasRetryFunction ? jest.fn() : undefined;
          
          render(
            <NetworkErrorFallback onRetry={mockRetry} />
          );

          // Should display connection error message
          expect(screen.getByText(/connection error/i)).toBeInTheDocument();
          expect(screen.getByText(/unable to connect to our servers/i)).toBeInTheDocument();

          // Should show retry button if retry function is provided
          if (hasRetryFunction) {
            expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
          } else {
            expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display loading states gracefully', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (loadingMessage) => {
          render(
            <LoadingFallback message={loadingMessage} />
          );

          // Should display loading message
          expect(screen.getByText(loadingMessage)).toBeInTheDocument();
          
          // Should display loading spinner
          expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain accessibility in all error states', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.string({ minLength: 1, maxLength: 100 }),
        (shouldThrow, errorMessage) => {
          const { container } = render(
            <ErrorBoundary>
              <ThrowingComponent shouldThrow={shouldThrow} errorMessage={errorMessage} />
            </ErrorBoundary>
          );

          if (shouldThrow) {
            // Error UI should be accessible
            const buttons = screen.getAllByRole('button');
            const links = screen.getAllByRole('link');
            
            // All interactive elements should be accessible
            [...buttons, ...links].forEach(element => {
              expect(element).toBeVisible();
              expect(element).not.toHaveAttribute('aria-hidden', 'true');
            });

            // Should have proper heading structure
            const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
            expect(headings.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never render completely empty or broken UI', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.record({
            title: fc.option(fc.string()),
            description: fc.option(fc.string()),
            image: fc.option(fc.string()),
          }),
          fc.boolean()
        ),
        (data) => {
          let component;
          
          if (typeof data === 'boolean') {
            // Test error boundary
            component = (
              <ErrorBoundary>
                <ThrowingComponent shouldThrow={data} />
              </ErrorBoundary>
            );
          } else {
            // Test fallback components
            component = <ComponentWithMissingData data={data} />;
          }

          const { container } = render(component);

          // Should never render empty container
          expect(container.firstChild).not.toBeNull();
          expect(container.textContent).not.toBe('');
          
          // Should have some visible content
          expect(container.querySelector('*')).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Unit tests for specific error scenarios
describe('Graceful Error Handling Unit Tests', () => {
  it('should handle JavaScript errors in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} errorMessage="Test development error" />
      </ErrorBoundary>
    );

    // Should show error details in development
    expect(screen.getByText(/error details/i)).toBeInTheDocument();
    
    (process.env as any).NODE_ENV = originalEnv;
  });

  it('should hide error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} errorMessage="Test production error" />
      </ErrorBoundary>
    );

    // Should not show error details in production
    expect(screen.queryByText(/error details/i)).not.toBeInTheDocument();
    
    (process.env as any).NODE_ENV = originalEnv;
  });

  it('should call custom error handler when provided', () => {
    const mockErrorHandler = jest.fn();
    
    render(
      <ErrorBoundary onError={mockErrorHandler}>
        <ThrowingComponent shouldThrow={true} errorMessage="Custom handler test" />
      </ErrorBoundary>
    );

    // Custom error handler should be called
    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom error UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });
});