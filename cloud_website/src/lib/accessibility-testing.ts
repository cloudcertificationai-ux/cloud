// Accessibility testing utilities and automated checks

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  description: string;
  element: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  help: string;
  helpUrl?: string;
}

export interface AccessibilityReport {
  url: string;
  timestamp: number;
  violations: AccessibilityIssue[];
  passes: string[];
  incomplete: AccessibilityIssue[];
  score: number; // 0-100
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

// Basic accessibility checks that can run without external libraries
export function runBasicAccessibilityChecks(): AccessibilityIssue[] {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return [];
  }

  try {
    const issues: AccessibilityIssue[] = [];

  // Check for missing alt text on images
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
      issues.push({
        type: 'error',
        rule: 'image-alt',
        description: 'Image missing alternative text',
        element: `img[${index}]: ${img.src}`,
        impact: 'serious',
        help: 'Add alt attribute or aria-label to describe the image content',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
      });
    }
  });

  // Check for missing form labels
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const hasLabel = input.getAttribute('aria-label') ||
                    input.getAttribute('aria-labelledby') ||
                    document.querySelector(`label[for="${input.id}"]`) ||
                    input.closest('label');

    const inputElement = input as HTMLInputElement;
    if (!hasLabel && inputElement.type !== 'hidden' && inputElement.type !== 'submit' && inputElement.type !== 'button') {
      issues.push({
        type: 'error',
        rule: 'label',
        description: 'Form element missing label',
        element: `${input.tagName.toLowerCase()}[${index}]: ${inputElement.type}`,
        impact: 'critical',
        help: 'Add a label element or aria-label attribute',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
      });
    }
  });

  // Check for missing heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    
    if (index === 0 && level !== 1) {
      issues.push({
        type: 'warning',
        rule: 'heading-order',
        description: 'Page should start with h1',
        element: `${heading.tagName.toLowerCase()}[${index}]: ${heading.textContent?.substring(0, 50)}`,
        impact: 'moderate',
        help: 'Start page with h1 heading',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
      });
    }
    
    if (level > previousLevel + 1) {
      issues.push({
        type: 'warning',
        rule: 'heading-order',
        description: 'Heading levels should not skip',
        element: `${heading.tagName.toLowerCase()}[${index}]: ${heading.textContent?.substring(0, 50)}`,
        impact: 'moderate',
        help: 'Use heading levels in sequential order',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
      });
    }
    
    previousLevel = level;
  });

  // Check for insufficient color contrast (basic check)
  const elementsToCheck = document.querySelectorAll('p, span, div, a, button, h1, h2, h3, h4, h5, h6');
  elementsToCheck.forEach((element, index) => {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // Only check if we have both colors and they're not transparent
    if (color && backgroundColor && 
        color !== 'rgba(0, 0, 0, 0)' && 
        backgroundColor !== 'rgba(0, 0, 0, 0)') {
      
      const contrast = calculateColorContrast(color, backgroundColor);
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
      const requiredRatio = isLargeText ? 3 : 4.5;
      
      if (contrast < requiredRatio) {
        issues.push({
          type: 'error',
          rule: 'color-contrast',
          description: `Insufficient color contrast (${contrast.toFixed(2)}:1)`,
          element: `${element.tagName.toLowerCase()}[${index}]`,
          impact: 'serious',
          help: `Increase contrast to at least ${requiredRatio}:1`,
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
        });
      }
    }
  });

  // Check for missing focus indicators
  const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  focusableElements.forEach((element, index) => {
    const styles = window.getComputedStyle(element, ':focus');
    const outline = styles.outline;
    const outlineWidth = styles.outlineWidth;
    const boxShadow = styles.boxShadow;
    
    if (outline === 'none' && outlineWidth === '0px' && boxShadow === 'none') {
      issues.push({
        type: 'warning',
        rule: 'focus-indicator',
        description: 'Element missing visible focus indicator',
        element: `${element.tagName.toLowerCase()}[${index}]`,
        impact: 'serious',
        help: 'Add visible focus styles using outline or box-shadow',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html',
      });
    }
  });

  // Check for missing lang attribute
  if (!document.documentElement.lang) {
    issues.push({
      type: 'error',
      rule: 'html-has-lang',
      description: 'HTML element missing lang attribute',
      element: 'html',
      impact: 'serious',
      help: 'Add lang attribute to html element (e.g., lang="en")',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
    });
  }

  // Check for missing page title
  if (!document.title || document.title.trim() === '') {
    issues.push({
      type: 'error',
      rule: 'document-title',
      description: 'Page missing title',
      element: 'title',
      impact: 'serious',
      help: 'Add descriptive title to page',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html',
    });
  }

  // Check for missing skip links
  const skipLinks = document.querySelectorAll('a[href^="#"]');
  const hasSkipToMain = Array.from(skipLinks).some(link => 
    link.textContent?.toLowerCase().includes('skip') && 
    link.textContent?.toLowerCase().includes('main')
  );
  
  if (!hasSkipToMain) {
    issues.push({
      type: 'warning',
      rule: 'skip-link',
      description: 'Page missing skip to main content link',
      element: 'body',
      impact: 'moderate',
      help: 'Add skip link to main content for keyboard users',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/general/G1.html',
    });
  }

  return issues;
  } catch (error) {
    console.warn('Error in basic accessibility checks:', error);
    return [];
  }
}

// Calculate color contrast ratio
function calculateColorContrast(color1: string, color2: string): number {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  
  if (!rgb1 || !rgb2) return 21; // Return max contrast if we can't parse
  
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Parse CSS color to RGB values
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle rgb() and rgba() formats
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }
  
  // Handle hex colors
  const hexMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }
  
  return null;
}

// Calculate relative luminance
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Generate accessibility report
export function generateAccessibilityReport(): AccessibilityReport {
  const violations = runBasicAccessibilityChecks();
  
  const summary = violations.reduce((acc, issue) => {
    acc[issue.impact]++;
    return acc;
  }, { critical: 0, serious: 0, moderate: 0, minor: 0 });
  
  // Calculate score (100 - weighted penalty for issues)
  const score = Math.max(0, 100 - (
    summary.critical * 25 +
    summary.serious * 10 +
    summary.moderate * 5 +
    summary.minor * 2
  ));
  
  return {
    url: window.location.href,
    timestamp: Date.now(),
    violations,
    passes: [], // Would be populated by more comprehensive testing
    incomplete: [], // Would be populated by more comprehensive testing
    score: Math.round(score),
    summary,
  };
}

// Keyboard navigation testing
export function testKeyboardNavigation(): AccessibilityIssue[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const issues: AccessibilityIssue[] = [];
  const focusableElements = document.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  // Check if elements are keyboard accessible
  focusableElements.forEach((element, index) => {
    const tabIndex = element.getAttribute('tabindex');
    
    // Check for positive tabindex (anti-pattern)
    if (tabIndex && parseInt(tabIndex) > 0) {
      issues.push({
        type: 'warning',
        rule: 'tabindex',
        description: 'Avoid positive tabindex values',
        element: `${element.tagName.toLowerCase()}[${index}]`,
        impact: 'moderate',
        help: 'Use tabindex="0" or rely on natural tab order',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
      });
    }
    
    // Check if element is visible but not focusable
    const styles = window.getComputedStyle(element);
    if (styles.display !== 'none' && styles.visibility !== 'hidden' && tabIndex === '-1') {
      issues.push({
        type: 'warning',
        rule: 'keyboard-accessible',
        description: 'Interactive element not keyboard accessible',
        element: `${element.tagName.toLowerCase()}[${index}]`,
        impact: 'serious',
        help: 'Remove tabindex="-1" or add keyboard event handlers',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
      });
    }
  });
  
  return issues;
  } catch (error) {
    console.warn('Error in keyboard navigation tests:', error);
    return [];
  }
}

// ARIA testing
export function testARIAImplementation(): AccessibilityIssue[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const issues: AccessibilityIssue[] = [];
  
  // Check for invalid ARIA attributes
  // Get all elements and check for ARIA attributes
  const allElements = document.querySelectorAll('*');
  const elementsWithAria: Element[] = [];
  
  allElements.forEach(element => {
    const hasAriaAttribute = element.getAttributeNames().some(attr => attr.startsWith('aria-'));
    if (hasAriaAttribute) {
      elementsWithAria.push(element);
    }
  });
  
  elementsWithAria.forEach((element, index) => {
    const attributes = element.getAttributeNames().filter(attr => attr.startsWith('aria-'));
    
    attributes.forEach(attr => {
      const value = element.getAttribute(attr);
      
      // Check for empty ARIA attributes
      if (!value || value.trim() === '') {
        issues.push({
          type: 'error',
          rule: 'aria-valid-attr-value',
          description: `Empty ARIA attribute: ${attr}`,
          element: `${element.tagName.toLowerCase()}[${index}]`,
          impact: 'serious',
          help: 'Provide a valid value for ARIA attribute or remove it',
        });
      }
      
      // Check for boolean ARIA attributes with invalid values
      const booleanAttrs = ['aria-hidden', 'aria-expanded', 'aria-checked', 'aria-selected'];
      if (value && booleanAttrs.includes(attr) && !['true', 'false'].includes(value)) {
        issues.push({
          type: 'error',
          rule: 'aria-valid-attr-value',
          description: `Invalid boolean ARIA value: ${attr}="${value}"`,
          element: `${element.tagName.toLowerCase()}[${index}]`,
          impact: 'serious',
          help: 'Use "true" or "false" for boolean ARIA attributes',
        });
      }
    });
  });
  
  // Check for missing ARIA labels on custom controls
  const customControls = document.querySelectorAll('[role="button"], [role="link"], [role="tab"]');
  customControls.forEach((element, index) => {
    const hasLabel = element.getAttribute('aria-label') ||
                    element.getAttribute('aria-labelledby') ||
                    element.textContent?.trim();
    
    if (!hasLabel) {
      issues.push({
        type: 'error',
        rule: 'aria-label',
        description: 'Custom control missing accessible name',
        element: `${element.tagName.toLowerCase()}[${index}]`,
        impact: 'critical',
        help: 'Add aria-label or aria-labelledby attribute',
      });
    }
  });
  
  return issues;
  } catch (error) {
    console.warn('Error in ARIA implementation tests:', error);
    return [];
  }
}

// Run comprehensive accessibility audit
export function runAccessibilityAudit(): AccessibilityReport {
  try {
    const basicIssues = runBasicAccessibilityChecks();
    const keyboardIssues = testKeyboardNavigation();
    const ariaIssues = testARIAImplementation();
    
    const allViolations = [...basicIssues, ...keyboardIssues, ...ariaIssues];
    
    const summary = allViolations.reduce((acc, issue) => {
      acc[issue.impact]++;
      return acc;
    }, { critical: 0, serious: 0, moderate: 0, minor: 0 });
    
    const score = Math.max(0, 100 - (
      summary.critical * 25 +
      summary.serious * 10 +
      summary.moderate * 5 +
      summary.minor * 2
    ));
    
    return {
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
      violations: allViolations,
      passes: [],
      incomplete: [],
      score: Math.round(score),
      summary,
    };
  } catch (error) {
    console.warn('Error running accessibility audit:', error);
    return {
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
      violations: [],
      passes: [],
      incomplete: [],
      score: 100,
      summary: { critical: 0, serious: 0, moderate: 0, minor: 0 },
    };
  }
}

// Monitor accessibility in real-time
export class AccessibilityMonitor {
  private observer: MutationObserver | null = null;
  private lastReport: AccessibilityReport | null = null;
  private onIssueFound?: (issue: AccessibilityIssue) => void;

  constructor(onIssueFound?: (issue: AccessibilityIssue) => void) {
    this.onIssueFound = onIssueFound;
  }

  start() {
    if (typeof window === 'undefined' || this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      let shouldRecheck = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldRecheck = true;
        }
        if (mutation.type === 'attributes') {
          shouldRecheck = true;
        }
      });

      if (shouldRecheck) {
        this.checkAccessibility();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      // Remove attributeFilter to monitor all attribute changes
      // since we can't use wildcards like 'aria-*'
    });

    // Initial check
    this.checkAccessibility();
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private checkAccessibility() {
    const report = runAccessibilityAudit();
    
    // Find new issues since last report
    if (this.lastReport && this.onIssueFound) {
      const newIssues = report.violations.filter(issue => 
        !this.lastReport!.violations.some(oldIssue => 
          oldIssue.rule === issue.rule && oldIssue.element === issue.element
        )
      );

      newIssues.forEach(issue => this.onIssueFound!(issue));
    }

    this.lastReport = report;
  }

  getLastReport(): AccessibilityReport | null {
    return this.lastReport;
  }
}

// Export utilities
export const AccessibilityUtils = {
  runBasicAccessibilityChecks,
  generateAccessibilityReport,
  testKeyboardNavigation,
  testARIAImplementation,
  runAccessibilityAudit,
  AccessibilityMonitor,
};