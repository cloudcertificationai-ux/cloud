/**
 * Contrast Checker Utility
 * 
 * Validates text contrast ratios against WCAG 2.1 Level AA standards.
 * Implements color parsing, relative luminance calculation, and contrast ratio computation.
 */

export interface ContrastCheck {
  foreground: string; // hex color
  background: string; // hex color
  ratio: number;
  passes: {
    aa: boolean;      // 4.5:1 for normal text
    aaLarge: boolean; // 3:1 for large text
    aaa: boolean;     // 7:1 for normal text
  };
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse a color string (hex, rgb, rgba) into RGB components
 * @param color - Color string in hex (#fff, #ffffff) or rgb/rgba format
 * @returns RGB object with r, g, b values (0-255)
 */
function parseColor(color: string): RGB {
  const trimmed = color.trim();

  // Handle hex colors
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    
    // Short hex (#fff)
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    
    // Full hex (#ffffff)
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  // Handle rgb/rgba colors
  const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  throw new Error(`Invalid color format: ${color}`);
}

/**
 * Calculate relative luminance for a color
 * Based on WCAG 2.1 formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @param rgb - RGB color object
 * @returns Relative luminance value (0-1)
 */
function getRelativeLuminance(rgb: RGB): number {
  // Convert RGB values to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // Apply gamma correction
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 formula: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 * @param l1 - Relative luminance of lighter color
 * @param l2 - Relative luminance of darker color
 * @returns Contrast ratio (1-21)
 */
function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check contrast ratio between foreground and background colors
 * @param fg - Foreground color (text color) in hex, rgb, or rgba format
 * @param bg - Background color in hex, rgb, or rgba format
 * @returns ContrastCheck object with ratio and WCAG compliance results
 */
export function checkContrast(fg: string, bg: string): ContrastCheck {
  const fgRGB = parseColor(fg);
  const bgRGB = parseColor(bg);

  const fgLuminance = getRelativeLuminance(fgRGB);
  const bgLuminance = getRelativeLuminance(bgRGB);

  const ratio = getContrastRatio(fgLuminance, bgLuminance);

  return {
    foreground: fg,
    background: bg,
    ratio: Math.round(ratio * 100) / 100, // Round to 2 decimal places
    passes: {
      aa: ratio >= 4.5,        // WCAG 2.1 Level AA for normal text
      aaLarge: ratio >= 3.0,   // WCAG 2.1 Level AA for large text (18pt+)
      aaa: ratio >= 7.0,       // WCAG 2.1 Level AAA for normal text
    },
  };
}
