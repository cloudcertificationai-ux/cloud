import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnterpriseSolutions from '../EnterpriseSolutions';
import { enterpriseSolutions, fortune500Clients, enterpriseCaseStudies } from '@/data/sample-data';

// Mock the OptimizedImage component
jest.mock('../OptimizedImage', () => {
  return function MockOptimizedImage({ alt, ...props }: any) {
    return <img alt={alt} {...props} />;
  };
});

describe('EnterpriseSolutions Component', () => {
  const mockOnContactClick = jest.fn();
  const mockOnDemoClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    solutions: enterpriseSolutions.slice(0, 3), // Use first 3 solutions for testing
    clientLogos: fortune500Clients.slice(0, 6), // Use first 6 clients for testing
    caseStudies: enterpriseCaseStudies.slice(0, 2), // Use first 2 case studies for testing
    onContactClick: mockOnContactClick,
    onDemoClick: mockOnDemoClick,
  };

  it('renders the hero section with correct messaging', () => {
    render(<EnterpriseSolutions {...defaultProps} />);
    
    expect(screen.getByRole('heading', { level: 1, name: /Transform Your Workforce with Enterprise Learning Solutions/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Schedule a Demo/i)).toHaveLength(2); // There are multiple demo buttons
    expect(screen.getByText(/Contact Sales/i)).toBeInTheDocument();
  });

  it('displays Fortune 500 client logos when provided', () => {
    render(<EnterpriseSolutions {...defaultProps} />);
    
    expect(screen.getByText(/Trusted by Industry Leaders/i)).toBeInTheDocument();
    
    // Check that client logos are rendered
    defaultProps.clientLogos.forEach(client => {
      expect(screen.getByAltText(`${client.name} logo`)).toBeInTheDocument();
    });
  });

  it('renders enterprise solutions with features', () => {
    render(<EnterpriseSolutions {...defaultProps} />);
    
    expect(screen.getByText(/Comprehensive Learning Solutions/i)).toBeInTheDocument();
    
    // Check that solutions are rendered
    defaultProps.solutions.forEach(solution => {
      expect(screen.getByText(solution.title)).toBeInTheDocument();
      expect(screen.getByText(solution.description)).toBeInTheDocument();
      
      // Check that features are displayed
      solution.features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });
  });

  it('displays case studies when provided', () => {
    render(<EnterpriseSolutions {...defaultProps} />);
    
    expect(screen.getByText(/Success Stories/i)).toBeInTheDocument();
    
    // Check that case studies are rendered
    defaultProps.caseStudies.forEach(caseStudy => {
      expect(screen.getByText(caseStudy.companyName)).toBeInTheDocument();
      expect(screen.getByText(caseStudy.industry)).toBeInTheDocument();
      expect(screen.getByText(caseStudy.challenge)).toBeInTheDocument();
      expect(screen.getByText(caseStudy.solution)).toBeInTheDocument();
    });
  });

  it('renders Learning Hub+ section', () => {
    render(<EnterpriseSolutions {...defaultProps} />);
    
    expect(screen.getByText(/Introducing Learning Hub\+/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Advanced Analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Custom Learning Paths/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Dedicated Support/i })).toBeInTheDocument();
  });

  it('calls onContactClick when contact buttons are clicked', () => {
    render(<EnterpriseSolutions {...defaultProps} />);
    
    const contactButtons = screen.getAllByText(/Contact/i);
    fireEvent.click(contactButtons[0]); // Click the first contact button
    
    expect(mockOnContactClick).toHaveBeenCalledTimes(1);
  });

  it('calls onDemoClick when demo buttons are clicked', () => {
    render(<EnterpriseSolutions {...defaultProps} />);
    
    const demoButtons = screen.getAllByText(/Demo/i);
    fireEvent.click(demoButtons[0]); // Click the first demo button
    
    expect(mockOnDemoClick).toHaveBeenCalledTimes(1);
  });

  it('renders final CTA section', () => {
    render(<EnterpriseSolutions {...defaultProps} />);
    
    expect(screen.getByText(/Ready to Transform Your Workforce\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Our Team/i)).toBeInTheDocument();
  });

  it('handles empty client logos gracefully', () => {
    const propsWithoutClients = {
      ...defaultProps,
      clientLogos: [],
    };
    
    render(<EnterpriseSolutions {...propsWithoutClients} />);
    
    // Should not render the trust indicators section
    expect(screen.queryByText(/Trusted by Industry Leaders/i)).not.toBeInTheDocument();
  });

  it('handles empty case studies gracefully', () => {
    const propsWithoutCaseStudies = {
      ...defaultProps,
      caseStudies: [],
    };
    
    render(<EnterpriseSolutions {...propsWithoutCaseStudies} />);
    
    // Should not render the case studies section
    expect(screen.queryByText(/Success Stories/i)).not.toBeInTheDocument();
  });

  it('displays pricing information when available', () => {
    const solutionsWithPricing = defaultProps.solutions.filter(solution => solution.pricing);
    
    if (solutionsWithPricing.length > 0) {
      render(<EnterpriseSolutions {...defaultProps} />);
      
      solutionsWithPricing.forEach(solution => {
        expect(screen.getByText(`Starting at ${solution.pricing}`)).toBeInTheDocument();
      });
    }
  });
});