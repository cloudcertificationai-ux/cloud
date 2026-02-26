/**
 * Accessibility Utilities
 * Provides utilities for WCAG compliance, ARIA labels, keyboard navigation, and screen reader support
 */

/**
 * ARIA utilities for enhanced accessibility
 */
export const ariaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = 'element'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Common ARIA attributes
  attributes: {
    // Button states
    button: {
      expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded }),
      pressed: (isPressed: boolean) => ({ 'aria-pressed': isPressed }),
      disabled: (isDisabled: boolean) => ({ 'aria-disabled': isDisabled }),
    },

    // Form controls
    form: {
      required: { 'aria-required': true },
      invalid: (isInvalid: boolean) => ({ 'aria-invalid': isInvalid }),
      describedBy: (id: string) => ({ 'aria-describedby': id }),
      labelledBy: (id: string) => ({ 'aria-labelledby': id }),
    },

    // Navigation
    navigation: {
      current: (isCurrent: boolean) => ({ 'aria-current': isCurrent ? 'page' : undefined }),
      hasPopup: (type: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog') => ({ 'aria-haspopup': type }),
      controls: (id: string) => ({ 'aria-controls': id }),
    },

    // Content
    content: {
      hidden: (isHidden: boolean) => ({ 'aria-hidden': isHidden }),
      live: (politeness: 'polite' | 'assertive' | 'off') => ({ 'aria-live': politeness }),
      atomic: (isAtomic: boolean) => ({ 'aria-atomic': isAtomic }),
    },

    // Landmarks
    landmarks: {
      label: (label: string) => ({ 'aria-label': label }),
      labelledBy: (id: string) => ({ 'aria-labelledby': id }),
      role: (role: string) => ({ role }),
    }
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  // Key codes for common navigation keys
  keys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    TAB: 'Tab',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  },

  // Handle keyboard navigation for menus
  handleMenuNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect?: (index: number) => void,
    onClose?: () => void
  ): number => {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case keyboardUtils.keys.ARROW_DOWN:
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case keyboardUtils.keys.ARROW_UP:
        event.preventDefault();
        newIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case keyboardUtils.keys.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case keyboardUtils.keys.END:
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case keyboardUtils.keys.ENTER:
      case keyboardUtils.keys.SPACE:
        event.preventDefault();
        onSelect?.(currentIndex);
        break;
      case keyboardUtils.keys.ESCAPE:
        event.preventDefault();
        onClose?.();
        break;
    }

    // Focus the new item
    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus();
    }

    return newIndex;
  },

  // Handle keyboard navigation for tabs
  handleTabNavigation: (
    event: KeyboardEvent,
    tabs: HTMLElement[],
    currentIndex: number,
    onTabChange: (index: number) => void
  ): void => {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case keyboardUtils.keys.ARROW_LEFT:
        event.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case keyboardUtils.keys.ARROW_RIGHT:
        event.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
        break;
      case keyboardUtils.keys.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case keyboardUtils.keys.END:
        event.preventDefault();
        newIndex = tabs.length - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      onTabChange(newIndex);
      tabs[newIndex]?.focus();
    }
  },

  // Trap focus within a container
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== keyboardUtils.keys.TAB) return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
};

/**
 * Screen reader utilities
 */
export const screenReaderUtils = {
  // Announce content to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  // Create screen reader only text
  createSROnlyText: (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  },

  // Common screen reader labels
  labels: {
    loading: 'Loading content, please wait',
    error: 'Error occurred',
    success: 'Action completed successfully',
    required: 'Required field',
    optional: 'Optional field',
    menu: 'Navigation menu',
    submenu: 'Submenu',
    closeDialog: 'Close dialog',
    openDialog: 'Open dialog',
    nextPage: 'Go to next page',
    previousPage: 'Go to previous page',
    sortAscending: 'Sort ascending',
    sortDescending: 'Sort descending',
    expandSection: 'Expand section',
    collapseSection: 'Collapse section'
  }
};

/**
 * Focus management utilities
 */
export const focusUtils = {
  // Focus management classes
  classes: {
    focusVisible: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    focusWithin: 'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2',
    skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50'
  },

  // Save and restore focus
  saveFocus: (): (() => void) => {
    const activeElement = document.activeElement as HTMLElement;
    return () => {
      if (activeElement && typeof activeElement.focus === 'function') {
        activeElement.focus();
      }
    };
  },

  // Focus first focusable element in container
  focusFirst: (container: HTMLElement): boolean => {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    if (focusable) {
      focusable.focus();
      return true;
    }
    return false;
  },

  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    if (element.tabIndex < 0) return false;
    if (element.hasAttribute('disabled')) return false;
    if (element.getAttribute('aria-hidden') === 'true') return false;

    const tagName = element.tagName.toLowerCase();
    const focusableTags = ['button', 'input', 'select', 'textarea', 'a'];
    
    return focusableTags.includes(tagName) || element.tabIndex >= 0;
  }
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  // WCAG contrast ratios
  ratios: {
    AA_NORMAL: 4.5,
    AA_LARGE: 3,
    AAA_NORMAL: 7,
    AAA_LARGE: 4.5
  },

  // Calculate relative luminance
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio between two colors
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]): number => {
    const lum1 = contrastUtils.getLuminance(...color1);
    const lum2 = contrastUtils.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (
    color1: [number, number, number], 
    color2: [number, number, number], 
    level: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false
  ): boolean => {
    const ratio = contrastUtils.getContrastRatio(color1, color2);
    const requiredRatio = level === 'AAA' 
      ? (isLargeText ? contrastUtils.ratios.AAA_LARGE : contrastUtils.ratios.AAA_NORMAL)
      : (isLargeText ? contrastUtils.ratios.AA_LARGE : contrastUtils.ratios.AA_NORMAL);
    
    return ratio >= requiredRatio;
  }
};

/**
 * Semantic HTML utilities
 */
export const semanticUtils = {
  // Landmark roles
  landmarks: {
    banner: 'banner',
    navigation: 'navigation',
    main: 'main',
    complementary: 'complementary',
    contentinfo: 'contentinfo',
    search: 'search',
    form: 'form',
    region: 'region'
  },

  // Heading hierarchy validation
  validateHeadingHierarchy: (container: HTMLElement): string[] => {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues: string[] = [];
    let previousLevel = 0;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        issues.push('First heading should be h1');
      }
      
      if (level > previousLevel + 1) {
        issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
      }
      
      previousLevel = level;
    });

    return issues;
  },

  // Generate proper heading structure
  getHeadingLevel: (depth: number): 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' => {
    const level = Math.min(Math.max(depth, 1), 6);
    return `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }
};

/**
 * Accessibility testing utilities
 */
export const a11yTestUtils = {
  // Check for common accessibility issues
  auditElement: (element: HTMLElement): string[] => {
    const issues: string[] = [];

    // Check for missing alt text on images
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push('Image missing alt text');
      }
    });

    // Check for buttons without accessible names
    const buttons = element.querySelectorAll('button');
    buttons.forEach(button => {
      const hasText = button.textContent?.trim();
      const hasAriaLabel = button.getAttribute('aria-label');
      const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
      
      if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push('Button missing accessible name');
      }
    });

    // Check for form inputs without labels
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.id;
      const hasLabel = id && element.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push('Form input missing label');
      }
    });

    // Check heading hierarchy
    const headingIssues = semanticUtils.validateHeadingHierarchy(element);
    issues.push(...headingIssues);

    return issues;
  },

  // Generate accessibility report
  generateReport: (element: HTMLElement): {
    issues: string[];
    score: number;
    recommendations: string[];
  } => {
    const issues = a11yTestUtils.auditElement(element);
    const totalChecks = 10; // Number of accessibility checks performed
    const score = Math.max(0, ((totalChecks - issues.length) / totalChecks) * 100);
    
    const recommendations = [
      'Add alt text to all images',
      'Ensure all interactive elements have accessible names',
      'Use proper heading hierarchy',
      'Provide labels for all form inputs',
      'Ensure sufficient color contrast',
      'Make all functionality keyboard accessible',
      'Use semantic HTML elements',
      'Provide skip links for navigation',
      'Test with screen readers',
      'Validate with automated accessibility tools'
    ];

    return {
      issues,
      score: Math.round(score),
      recommendations
    };
  }
};