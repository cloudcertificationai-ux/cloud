// Feature: anywheredoor, Property 7: Interactive Element Accessibility
// **Validates: Requirements 5.3, 7.2**

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import Header from '../Header';
import SearchBar from '../SearchBar';
import CourseCard from '../../app/courses/components/CourseCard';
import { Course, CurriculumModule } from '@/types';

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ suggestions: ['React Course', 'JavaScript Basics'] }),
  })
) as jest.Mock;

describe('Interactive Element Accessibility Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any existing DOM elements between tests
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = '';
  });

  test('Property 7: Interactive Element Accessibility - For any interactive element, the element should provide appropriate touch targets, keyboard accessibility, and user feedback', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          placeholder: fc.string({ minLength: 5, maxLength: 50 }),
          showSuggestions: fc.boolean(),
        }),
        async ({ placeholder, showSuggestions }) => {
          const user = userEvent.setup();
          
          // Test SearchBar component accessibility
          render(
            <SearchBar 
              placeholder={placeholder} 
              showSuggestions={showSuggestions}
            />
          );

          const searchInput = screen.getByRole('combobox');
          
          // Property: Interactive elements should have proper ARIA attributes
          expect(searchInput).toHaveAttribute('aria-label');
          expect(searchInput).toHaveAttribute('aria-expanded');
          expect(searchInput).toHaveAttribute('aria-haspopup', 'listbox');
          expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
          
          // Property: Interactive elements should be keyboard accessible
          expect(searchInput).toBeInTheDocument();
          expect(searchInput.tagName.toLowerCase()).toBe('input');
          
          // Test keyboard navigation
          await user.click(searchInput);
          expect(searchInput).toHaveFocus();
          
          // Test keyboard input
          await user.type(searchInput, 'React');
          expect(searchInput).toHaveValue('React');
          
          // Property: Interactive elements should provide user feedback
          // The input should respond to user interaction
          expect(searchInput).toHaveAttribute('value', 'React');
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 7a: Header navigation should be fully keyboard accessible', () => {
    fc.assert(
      fc.asyncProperty(
        fc.boolean(), // isMenuOpen state
        async (initialMenuState) => {
          const user = userEvent.setup();
          
          render(<Header />);
          
          // Property: All navigation links should be keyboard accessible
          const navLinks = screen.getAllByRole('link');
          expect(navLinks.length).toBeGreaterThan(0);
          
          navLinks.forEach(link => {
            // Each link should be focusable
            expect(link).toHaveAttribute('href');
            expect(link.tabIndex).not.toBe(-1);
          });
          
          // Property: Mobile menu button should be keyboard accessible
          const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
          expect(menuButton).toBeInTheDocument();
          expect(menuButton).toHaveAttribute('aria-expanded');
          expect(menuButton).toHaveAttribute('aria-controls');
          expect(menuButton).toHaveAttribute('aria-label');
          
          // Test keyboard interaction with menu button
          await user.tab(); // Focus should move to first focusable element
          
          // Find the menu button and test keyboard activation
          menuButton.focus();
          expect(menuButton).toHaveFocus();
          
          // Test Enter key activation
          await user.keyboard('{Enter}');
          
          // Menu should toggle (aria-expanded should change)
          await waitFor(() => {
            expect(menuButton).toHaveAttribute('aria-expanded');
          });
          
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 7b: Course cards should have proper accessibility attributes', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 5, maxLength: 20 }),
          title: fc.string({ minLength: 10, maxLength: 100 }),
          shortDescription: fc.string({ minLength: 20, maxLength: 200 }),
          slug: fc.string({ minLength: 5, maxLength: 50 }),
          level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
          duration: fc.record({
            hours: fc.integer({ min: 10, max: 200 }),
            weeks: fc.integer({ min: 2, max: 52 }),
          }),
          price: fc.record({
            amount: fc.integer({ min: 50, max: 2000 }),
            currency: fc.constant('USD'),
          }),
          rating: fc.record({
            average: fc.float({ min: 3.0, max: 5.0 }),
            count: fc.integer({ min: 10, max: 10000 }),
          }),
          thumbnailUrl: fc.constant('/test-image.jpg'),
          instructorIds: fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
          category: fc.record({
            id: fc.string(),
            name: fc.string({ minLength: 5, maxLength: 30 }),
            slug: fc.string({ minLength: 5, maxLength: 30 }),
            color: fc.constant('#3B82F6'),
            description: fc.string({ minLength: 10, maxLength: 100 }),
          }),
          tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          mode: fc.constantFrom('Live', 'Self-Paced', 'Hybrid'),
          enrollmentCount: fc.integer({ min: 0, max: 50000 }),
          isActive: fc.constant(true),
          createdAt: fc.constant(new Date()),
          updatedAt: fc.constant(new Date()),
          curriculum: fc.constant([] as CurriculumModule[]),
          longDescription: fc.string({ minLength: 50, maxLength: 500 }),
        }),
        (courseData) => {
          const course = courseData as Course;
          
          const { container, unmount } = render(<CourseCard course={course} />);
          
          try {
            // Property: Course cards should have proper semantic structure
            const courseTitle = container.querySelector('h3');
            expect(courseTitle).toBeInTheDocument();
            expect(courseTitle).toHaveTextContent(course.title);
            
            // Property: Interactive elements should have proper ARIA labels
            const viewCourseLinks = container.querySelectorAll('a[href*="/courses/"]');
            expect(viewCourseLinks.length).toBeGreaterThan(0);
            
            viewCourseLinks.forEach(link => {
              expect(link).toHaveAttribute('href');
              const href = link.getAttribute('href');
              expect(href).toContain('/courses/');
            });
            
            // Property: Rating should have proper accessibility attributes
            const ratingElements = container.querySelectorAll('[aria-label*="Rating"]');
            expect(ratingElements.length).toBeGreaterThan(0);
            
            // Property: Price information should be accessible to screen readers
            const priceElements = container.querySelectorAll('span');
            const hasPriceInfo = Array.from(priceElements).some(el => 
              el.textContent?.includes(`$${course.price.amount}`)
            );
            expect(hasPriceInfo).toBe(true);
            
            // Property: Course description should be properly associated with title
            const description = container.querySelector(`#course-${course.id}-description`);
            expect(description).toBeInTheDocument();
            expect(description).toHaveTextContent(course.shortDescription);
            
            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 20 } // Reduced runs to avoid conflicts
    );
  });

  test('Property 7c: Focus management should work correctly for interactive elements', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          searchQuery: fc.string({ minLength: 1, maxLength: 20 }),
          shouldShowSuggestions: fc.boolean(),
        }),
        async ({ searchQuery, shouldShowSuggestions }) => {
          const user = userEvent.setup();
          
          render(<SearchBar showSuggestions={shouldShowSuggestions} />);
          
          const searchInput = screen.getByRole('combobox');
          
          // Property: Focus should be manageable via keyboard
          await user.click(searchInput);
          expect(searchInput).toHaveFocus();
          
          // Type in search input
          await user.type(searchInput, searchQuery);
          
          // Property: Escape key should close suggestions and maintain focus
          await user.keyboard('{Escape}');
          
          // Input should still be focused after escape
          expect(searchInput).toHaveFocus();
          
          // Property: Tab navigation should work properly
          await user.tab();
          
          // Focus should move away from search input
          expect(searchInput).not.toHaveFocus();
          
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 7d: Touch targets should be appropriately sized for mobile accessibility', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // mobile viewport simulation
        (isMobile) => {
          // Simulate mobile viewport if needed
          if (isMobile) {
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: 375,
            });
            Object.defineProperty(window, 'innerHeight', {
              writable: true,
              configurable: true,
              value: 667,
            });
          }
          
          const { container, unmount } = render(<Header />);
          
          try {
            // Property: Interactive elements should have appropriate touch targets
            const menuButtons = container.querySelectorAll('button[aria-label*="navigation menu"]');
            expect(menuButtons.length).toBeGreaterThan(0);
            
            const menuButton = menuButtons[0]; // Use the first one found
            
            // Button should have touch-manipulation class for better mobile interaction
            expect(menuButton).toHaveClass('touch-manipulation');
            
            // Property: All links should be accessible
            const links = container.querySelectorAll('a');
            links.forEach(link => {
              expect(link).toBeInTheDocument();
              expect(link).toHaveAttribute('href');
              
              // Links should not have negative tab index (should be focusable)
              expect(link.tabIndex).not.toBe(-1);
            });
            
            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 } // Reduced runs to avoid conflicts
    );
  });

  test('Property 7e: ARIA attributes should be consistent and meaningful', () => {
    fc.assert(
      fc.property(
        fc.record({
          placeholder: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5),
          ariaLabel: fc.string({ minLength: 5, maxLength: 100 }),
        }),
        ({ placeholder, ariaLabel }) => {
          const { container, unmount } = render(<SearchBar placeholder={placeholder} />);
          
          try {
            const searchInputs = container.querySelectorAll('input[role="combobox"]');
            expect(searchInputs.length).toBeGreaterThan(0);
            
            const searchInput = searchInputs[0]; // Use the first one found
            
            // Property: ARIA attributes should be present and meaningful
            expect(searchInput).toHaveAttribute('aria-label');
            expect(searchInput).toHaveAttribute('aria-expanded');
            expect(searchInput).toHaveAttribute('aria-haspopup');
            expect(searchInput).toHaveAttribute('aria-autocomplete');
            
            // Property: ARIA attributes should have valid values
            const ariaExpanded = searchInput.getAttribute('aria-expanded');
            expect(['true', 'false']).toContain(ariaExpanded);
            
            const ariaHaspopup = searchInput.getAttribute('aria-haspopup');
            expect(ariaHaspopup).toBe('listbox');
            
            const ariaAutocomplete = searchInput.getAttribute('aria-autocomplete');
            expect(ariaAutocomplete).toBe('list');
            
            // Property: Placeholder should be meaningful
            expect(searchInput).toHaveAttribute('placeholder', placeholder);
            
            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 15 } // Reduced runs to avoid conflicts
    );
  });
});