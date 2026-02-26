#!/usr/bin/env node

/**
 * SEO Validation Script
 * Comprehensive validation of SEO implementation for production builds
 * Task 19.3: Final SEO validation and optimization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  red: '\033[0;31m',
  green: '\033[0;32m',
  yellow: '\033[1;33m',
  blue: '\033[0;34m',
  reset: '\033[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

class SEOValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.buildDir = path.join(process.cwd(), '.next');
    this.publicDir = path.join(process.cwd(), 'public');
  }

  async validate() {
    logInfo('Starting comprehensive SEO validation...');
    
    try {
      await this.validateBuildExists();
      await this.validateSitemap();
      await this.validateRobotsTxt();
      await this.validateMetaTagsInBuild();
      await this.validateStructuredData();
      await this.validateImageOptimization();
      await this.validatePerformanceConfig();
      await this.validateSEOConfig();
      
      this.printResults();
      
      if (this.errors.length > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      logError(`Validation failed: ${error.message}`);
      process.exit(1);
    }
  }

  async validateBuildExists() {
    logInfo('Checking build directory...');
    
    if (!fs.existsSync(this.buildDir)) {
      this.errors.push('Build directory (.next) not found. Run "npm run build" first.');
      return;
    }
    
    logSuccess('Build directory exists');
  }

  async validateSitemap() {
    logInfo('Validating sitemap...');
    
    const sitemapPath = path.join(this.publicDir, 'sitemap.xml');
    
    if (!fs.existsSync(sitemapPath)) {
      this.errors.push('sitemap.xml not found in public directory');
      return;
    }
    
    try {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      // Basic XML validation
      if (!sitemapContent.includes('<?xml')) {
        this.errors.push('sitemap.xml is not valid XML');
        return;
      }
      
      if (!sitemapContent.includes('<urlset')) {
        this.errors.push('sitemap.xml missing <urlset> element');
        return;
      }
      
      // Check for required pages
      const requiredPages = ['/courses', '/about', '/instructors'];
      const missingPages = requiredPages.filter(page => !sitemapContent.includes(page));
      
      if (missingPages.length > 0) {
        this.warnings.push(`Sitemap missing pages: ${missingPages.join(', ')}`);
      }
      
      // Count URLs
      const urlCount = (sitemapContent.match(/<url>/g) || []).length;
      logSuccess(`Sitemap valid with ${urlCount} URLs`);
      
    } catch (error) {
      this.errors.push(`Error reading sitemap: ${error.message}`);
    }
  }

  async validateRobotsTxt() {
    logInfo('Validating robots.txt...');
    
    const robotsPath = path.join(this.publicDir, 'robots.txt');
    
    if (!fs.existsSync(robotsPath)) {
      this.warnings.push('robots.txt not found');
      return;
    }
    
    try {
      const robotsContent = fs.readFileSync(robotsPath, 'utf8');
      
      if (!robotsContent.includes('User-agent:')) {
        this.errors.push('robots.txt missing User-agent directive');
        return;
      }
      
      if (!robotsContent.includes('Sitemap:')) {
        this.warnings.push('robots.txt missing Sitemap directive');
      }
      
      // Check for problematic disallows
      if (robotsContent.includes('Disallow: /courses') || 
          robotsContent.includes('Disallow: /about') ||
          robotsContent.includes('Disallow: /instructors')) {
        this.warnings.push('robots.txt disallows important pages');
      }
      
      logSuccess('robots.txt is valid');
      
    } catch (error) {
      this.errors.push(`Error reading robots.txt: ${error.message}`);
    }
  }

  async validateMetaTagsInBuild() {
    logInfo('Validating meta tags in build files...');
    
    try {
      // Check if Next.js metadata API is being used
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
      
      if (fs.existsSync(layoutPath)) {
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');
        
        if (!layoutContent.includes('export const metadata')) {
          this.warnings.push('layout.tsx missing metadata export');
        } else {
          logSuccess('Next.js Metadata API is being used');
        }
        
        // Check for essential meta tags in layout
        const requiredMetaFields = ['title', 'description', 'openGraph', 'twitter'];
        const missingFields = requiredMetaFields.filter(field => 
          !layoutContent.includes(field)
        );
        
        if (missingFields.length > 0) {
          this.warnings.push(`Layout metadata missing fields: ${missingFields.join(', ')}`);
        }
      }
      
    } catch (error) {
      this.warnings.push(`Error validating meta tags: ${error.message}`);
    }
  }

  async validateStructuredData() {
    logInfo('Validating structured data implementation...');
    
    try {
      // Check for SEO utility functions
      const seoUtilPath = path.join(process.cwd(), 'src/lib/seo.ts');
      
      if (fs.existsSync(seoUtilPath)) {
        const seoContent = fs.readFileSync(seoUtilPath, 'utf8');
        
        const requiredFunctions = [
          'generateCourseStructuredData',
          'generateInstructorStructuredData',
          'generateOrganizationStructuredData'
        ];
        
        const missingFunctions = requiredFunctions.filter(func => 
          !seoContent.includes(func)
        );
        
        if (missingFunctions.length > 0) {
          this.warnings.push(`SEO utilities missing functions: ${missingFunctions.join(', ')}`);
        } else {
          logSuccess('Structured data utilities are implemented');
        }
        
        // Check for schema.org usage
        if (!seoContent.includes('schema.org')) {
          this.warnings.push('SEO utilities not using schema.org');
        }
        
      } else {
        this.warnings.push('SEO utility file (src/lib/seo.ts) not found');
      }
      
    } catch (error) {
      this.warnings.push(`Error validating structured data: ${error.message}`);
    }
  }

  async validateImageOptimization() {
    logInfo('Validating image optimization...');
    
    try {
      // Check Next.js config for image optimization
      const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
      
      if (fs.existsSync(nextConfigPath)) {
        const configContent = fs.readFileSync(nextConfigPath, 'utf8');
        
        // Check for image optimization settings
        if (configContent.includes('images:') || configContent.includes('Image')) {
          logSuccess('Next.js image optimization configured');
        } else {
          this.warnings.push('Next.js image optimization not explicitly configured');
        }
      }
      
      // Check for Next.js Image component usage
      const srcDir = path.join(process.cwd(), 'src');
      if (fs.existsSync(srcDir)) {
        const result = execSync(`grep -r "next/image" ${srcDir} || true`, { encoding: 'utf8' });
        
        if (result.trim()) {
          logSuccess('Next.js Image component is being used');
        } else {
          this.warnings.push('Next.js Image component not found in source code');
        }
      }
      
    } catch (error) {
      this.warnings.push(`Error validating image optimization: ${error.message}`);
    }
  }

  async validatePerformanceConfig() {
    logInfo('Validating performance configuration...');
    
    try {
      // Check for performance monitoring
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        // Check for performance-related dependencies
        const performanceDeps = [
          '@vercel/analytics',
          '@vercel/speed-insights',
          'web-vitals'
        ];
        
        const installedPerfDeps = performanceDeps.filter(dep => 
          packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
        );
        
        if (installedPerfDeps.length > 0) {
          logSuccess(`Performance monitoring dependencies: ${installedPerfDeps.join(', ')}`);
        } else {
          this.warnings.push('No performance monitoring dependencies found');
        }
        
        // Check for bundle analyzer
        if (packageJson.scripts?.analyze) {
          logSuccess('Bundle analyzer script available');
        } else {
          this.warnings.push('Bundle analyzer script not found');
        }
      }
      
      // Check for Lighthouse configuration
      const lighthouseConfigPath = path.join(process.cwd(), '.lighthouserc.json');
      
      if (fs.existsSync(lighthouseConfigPath)) {
        const lighthouseConfig = JSON.parse(fs.readFileSync(lighthouseConfigPath, 'utf8'));
        
        if (lighthouseConfig.ci?.assert?.assertions) {
          const assertions = lighthouseConfig.ci.assert.assertions;
          
          // Check SEO score threshold
          if (assertions['categories:seo']) {
            const seoThreshold = assertions['categories:seo'][1]?.minScore || 0;
            if (seoThreshold >= 0.9) {
              logSuccess(`Lighthouse SEO threshold: ${seoThreshold * 100}%`);
            } else {
              this.warnings.push(`Lighthouse SEO threshold too low: ${seoThreshold * 100}%`);
            }
          }
          
          // Check performance score threshold
          if (assertions['categories:performance']) {
            const perfThreshold = assertions['categories:performance'][1]?.minScore || 0;
            if (perfThreshold >= 0.8) {
              logSuccess(`Lighthouse performance threshold: ${perfThreshold * 100}%`);
            } else {
              this.warnings.push(`Lighthouse performance threshold too low: ${perfThreshold * 100}%`);
            }
          }
        }
      } else {
        this.warnings.push('Lighthouse configuration not found');
      }
      
    } catch (error) {
      this.warnings.push(`Error validating performance config: ${error.message}`);
    }
  }

  async validateSEOConfig() {
    logInfo('Validating SEO configuration...');
    
    try {
      // Check for next-sitemap configuration
      const sitemapConfigPath = path.join(process.cwd(), 'next-sitemap.config.js');
      
      if (fs.existsSync(sitemapConfigPath)) {
        logSuccess('next-sitemap configuration found');
      } else {
        this.warnings.push('next-sitemap configuration not found');
      }
      
      // Check for SEO-related environment variables
      const envExamplePath = path.join(process.cwd(), '.env.local.example');
      
      if (fs.existsSync(envExamplePath)) {
        const envContent = fs.readFileSync(envExamplePath, 'utf8');
        
        if (envContent.includes('NEXT_PUBLIC_SITE_URL')) {
          logSuccess('Site URL environment variable configured');
        } else {
          this.warnings.push('NEXT_PUBLIC_SITE_URL not found in environment example');
        }
      }
      
      // Check for manifest.json (PWA)
      const manifestPath = path.join(this.publicDir, 'manifest.json');
      
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          
          if (manifest.name && manifest.short_name && manifest.description) {
            logSuccess('PWA manifest is complete');
          } else {
            this.warnings.push('PWA manifest missing required fields');
          }
        } catch (error) {
          this.warnings.push('PWA manifest is invalid JSON');
        }
      } else {
        this.warnings.push('PWA manifest not found');
      }
      
    } catch (error) {
      this.warnings.push(`Error validating SEO config: ${error.message}`);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    log('SEO VALIDATION RESULTS', 'blue');
    console.log('='.repeat(60));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      logSuccess('All SEO validations passed! 🎉');
    } else {
      if (this.errors.length > 0) {
        log('\nERRORS:', 'red');
        this.errors.forEach(error => logError(error));
      }
      
      if (this.warnings.length > 0) {
        log('\nWARNINGS:', 'yellow');
        this.warnings.forEach(warning => logWarning(warning));
      }
    }
    
    console.log('\n' + '='.repeat(60));
    log(`Total: ${this.errors.length} errors, ${this.warnings.length} warnings`, 'blue');
    console.log('='.repeat(60) + '\n');
    
    if (this.errors.length === 0) {
      logSuccess('SEO validation completed successfully!');
      logInfo('Your application is optimized for search engines.');
    } else {
      logError('SEO validation failed. Please fix the errors above.');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SEOValidator();
  validator.validate().catch(error => {
    logError(`Validation script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = SEOValidator;