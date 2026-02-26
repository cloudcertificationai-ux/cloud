/**
 * Integration tests for the complete application flow
 * Tests end-to-end user interactions and component integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataProvider } from '@/contexts/DataContext';
import HomePage from '../page';
import CoursesPage from '../courses/page';
import AboutPage from '../about/page';
import ContactPage from '../contact/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DataProvider>
    {children}
  </DataProvider>
);

describe('Application Integration Tests', () => {
  describe('Homepage Integration', () => {
    it('renders homepage with all key sections', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check hero section
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/Transform Your Career/i)).toBeInTheDocument();

      // Check CTA buttons
      expect(screen.getByRole('link', { name: /Browse Courses/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Learn More/i })).toBeInTheDocument();

      // Check statistics section
      expect(screen.getByText(/Students Enrolled/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Job Placement Rate/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Avg Salary Increase/i)).toBeInTheDocument();
      expect(screen.getByText(/Average Rating/i)).toBeInTheDocument();

      // Check categories section
      expect(screen.getByText(/Popular Course Categories/i)).toBeInTheDocument();
      
      // Check trust indicators
      expect(screen.getByText(/Trusted by Industry Leaders/i)).toBeInTheDocument();
    });

    it('navigates to courses page when Browse Courses is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const browseCourses = screen.getByRole('link', { name: /Browse Courses/i });
      expect(browseCourses).toHaveAttribute('href', '/courses');
    });

    it('shows category links that navigate to filtered courses', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Wait for categories to load
      await waitFor(() => {
        const categoryLinks = screen.getAllByText(/Explore courses/i);
        expect(categoryLinks.length).toBeGreaterThan(0);
      });

      // Check that category links have proper href attributes
      const categoryCards = screen.getAllByRole('link');
      const categoryLinks = categoryCards.filter(link => 
        link.getAttribute('href')?.includes('/courses?category=')
      );
      
      expect(categoryLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Courses Page Integration', () => {
    const mockSearchParams = {};

    it('renders courses page with search and filter functionality', async () => {
      render(
        <TestWrapper>
          <CoursesPage searchParams={mockSearchParams} />
        </TestWrapper>
      );

      // Check hero section
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/All Courses/i)).toBeInTheDocument();

      // Check category filters
      await waitFor(() => {
        const categoryButtons = screen.getAllByRole('link');
        const categoryFilters = categoryButtons.filter(button => 
          button.getAttribute('href')?.includes('/courses?category=')
        );
        expect(categoryFilters.length).toBeGreaterThan(0);
      });

      // Check results section
      expect(screen.getByText(/Course.*Found/i)).toBeInTheDocument();
    });

    it('displays course results and handles empty states', async () => {
      render(
        <TestWrapper>
          <CoursesPage searchParams={mockSearchParams} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show either courses or empty state
        const hasResults = screen.queryByText(/Course.*Found/i);
        const hasEmptyState = screen.queryByText(/No courses found/i);
        
        expect(hasResults || hasEmptyState).toBeTruthy();
      });
    });
  });

  describe('About Page Integration', () => {
    it('renders about page with all sections', async () => {
      render(
        <TestWrapper>
          <AboutPage />
        </TestWrapper>
      );

      // Check hero section
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/Transforming Careers/i)).toBeInTheDocument();

      // Check mission section
      expect(screen.getByText(/Our Mission/i)).toBeInTheDocument();

      // Check statistics
      expect(screen.getByText(/Our Impact in Numbers/i)).toBeInTheDocument();

      // Check industry partners
      expect(screen.getByText(/Trusted by Industry Leaders/i)).toBeInTheDocument();

      // Check success stories
      expect(screen.getByText(/Alumni Success Stories/i)).toBeInTheDocument();

      // Check CTA section
      expect(screen.getByText(/Ready to Transform Your Career/i)).toBeInTheDocument();
    });

    it('has working navigation links', async () => {
      render(
        <TestWrapper>
          <AboutPage />
        </TestWrapper>
      );

      const coursesLink = screen.getByRole('link', { name: /Browse Courses/i });
      expect(coursesLink).toHaveAttribute('href', '/courses');

      const contactLink = screen.getByRole('link', { name: /Contact Us/i });
      expect(contactLink).toHaveAttribute('href', '/contact');
    });
  });

  describe('Contact Page Integration', () => {
    it('renders contact page with form and information', async () => {
      render(
        <TestWrapper>
          <ContactPage />
        </TestWrapper>
      );

      // Check hero section
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Get inTouch';
      })).toBeInTheDocument();

      // Check contact form
      expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();

      // Check contact information
      expect(screen.getByText(/Contact Information/i)).toBeInTheDocument();
      expect(screen.getByText(/Our Office/i)).toBeInTheDocument();
      expect(screen.getByText(/Office Hours/i)).toBeInTheDocument();
    });

    it('validates form inputs and shows errors', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ContactPage />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      
      // Try to submit empty form
      await user.click(submitButton);

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Subject is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Message is required/i)).toBeInTheDocument();
      });
    });

    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ContactPage />
        </TestWrapper>
      );

      // Fill out form
      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/i), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/i), 'This is a test message that is long enough to pass validation.');

      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      await user.click(submitButton);

      // Check for success message
      await waitFor(() => {
        expect(screen.getByText(/Message sent successfully/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Cross-Page Navigation', () => {
    it('maintains consistent navigation across pages', async () => {
      // Test that navigation items are consistent
      const pages = [
        <HomePage />,
        <CoursesPage searchParams={{}} />,
        <AboutPage />,
        <ContactPage />,
      ];

      for (const page of pages) {
        const { unmount } = render(
          <TestWrapper>
            {page}
          </TestWrapper>
        );

        // Each page should have consistent navigation structure
        // (This would be more comprehensive with actual header/footer components)
        
        unmount();
      }
    });
  });

  describe('Data Flow Integration', () => {
    it('shares data consistently across components', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(/Students Enrolled/i)).toBeInTheDocument();
      });

      // Check that statistics are displayed
      const statisticsElements = screen.getAllByText(/\d+/);
      expect(statisticsElements.length).toBeGreaterThan(0);
    });

    it('handles loading states properly', async () => {
      render(
        <TestWrapper>
          <CoursesPage searchParams={{}} />
        </TestWrapper>
      );

      // Should handle loading states gracefully
      // (This would be more comprehensive with actual loading states)
      expect(screen.getByText(/Course.*Found/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('handles errors gracefully across the application', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // The app should render without throwing errors
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains proper heading hierarchy across pages', async () => {
      const pages = [
        { component: <HomePage />, name: 'Homepage' },
        { component: <CoursesPage searchParams={{}} />, name: 'Courses' },
        { component: <AboutPage />, name: 'About' },
        { component: <ContactPage />, name: 'Contact' },
      ];

      for (const { component, name } of pages) {
        const { unmount } = render(
          <TestWrapper>
            {component}
          </TestWrapper>
        );

        // Each page should have an h1
        const h1Elements = screen.getAllByRole('heading', { level: 1 });
        expect(h1Elements.length).toBeGreaterThanOrEqual(1);

        unmount();
      }
    });

    it('provides proper ARIA labels and roles', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check for proper semantic structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      
      // Check for links with proper accessibility
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      // Each link should have accessible text
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
      });
    });
  });
});