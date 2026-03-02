# Anywheredoor Learning Platform

A modern, responsive online learning platform built with Next.js 14+, TypeScript, and Tailwind CSS. The platform provides an engaging educational experience for Computer Science students and professionals with a focus on SEO optimization and performance.

## 🚀 Features

- **Next.js 14+ with App Router** - Latest Next.js features with file-based routing
- **Server-Side Rendering (SSR)** - Optimized for SEO and performance
- **Static Site Generation (SSG)** - Pre-built pages for optimal loading
- **Incremental Static Regeneration (ISR)** - Dynamic content updates without full rebuilds
- **TypeScript** - Type-safe development experience
- **Tailwind CSS** - Utility-first styling with responsive design
- **Comprehensive Testing** - Jest for unit tests, Playwright for E2E testing
- **Property-Based Testing** - Using fast-check for robust testing
- **SEO Optimized** - Automatic sitemap generation, meta tags, and structured data
- **Performance Optimized** - Image optimization, lazy loading, and CDN-ready

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ with React 18+
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4+
- **Testing:** Jest, @testing-library/react, Playwright, fast-check
- **Code Quality:** ESLint, Prettier
- **SEO:** next-sitemap for automatic sitemap generation
- **Deployment:** Optimized for Vercel

## 📦 Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd anywheredoor
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Testing

### Unit Tests
\`\`\`bash
npm test                # Run all unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
\`\`\`

### End-to-End Tests
\`\`\`bash
npm run test:e2e        # Run Playwright tests
npm run test:e2e:ui     # Run Playwright tests with UI
\`\`\`

## 🔧 Development Scripts

\`\`\`bash
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Run TypeScript type checking
\`\`\`

## 🗄️ Database Management

### Database Seeding
\`\`\`bash
npm run db:seed         # Seed database with essential data
\`\`\`

### Database Reset (Development Only)
\`\`\`bash
npm run db:reset:dev    # Safe reset with confirmation prompt
npx tsx scripts/reset-database.ts --confirm  # Auto-confirm reset
\`\`\`

**What the reset script does:**
- ✅ Deletes all courses, modules, lessons, and enrollments
- ✅ Deletes all demo user accounts and student data
- ✅ Preserves admin users (ADMIN role)
- ✅ Preserves database schema and migration history
- ✅ Re-seeds essential production data (categories)
- ✅ Blocks execution in production environment

**Safety Features:**
- Requires explicit confirmation unless \`--confirm\` flag is used
- Automatically detects and blocks production environments
- Preserves all admin users to prevent lockout
- Provides detailed summary of what will be deleted

**When to use:**
- Cleaning up development data before testing
- Resetting to a clean state after experiments
- Preparing for a fresh start with production-ready data

**Example workflow:**
\`\`\`bash
# Reset database and start fresh
npm run db:reset:dev

# Start the application
npm run dev

# Create new courses via admin panel
\`\`\`

## 📁 Project Structure

\`\`\`
anywheredoor/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── courses/           # Course-related pages
│   │   ├── instructors/       # Instructor pages
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions and configurations
│   ├── types/                 # TypeScript type definitions
│   └── data/                  # Sample data and mock content
├── tests/
│   └── e2e/                   # Playwright end-to-end tests
├── public/                    # Static assets
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── jest.config.js             # Jest testing configuration
├── playwright.config.ts       # Playwright configuration
└── next-sitemap.config.js     # Sitemap generation configuration
\`\`\`

## 🎯 Key Features Implementation

### SEO Optimization
- Server-side rendering for all course and instructor pages
- Automatic sitemap generation with next-sitemap
- Dynamic meta tags using Next.js Metadata API
- Structured data (JSON-LD) for better search engine understanding
- Open Graph and Twitter Card meta tags

### Performance Features
- Next.js Image component with automatic WebP conversion
- Lazy loading for images and components
- Code splitting and bundle optimization
- CDN-ready static asset optimization
- Core Web Vitals optimization

### Testing Strategy
- **Unit Tests:** Jest with @testing-library/react for component testing
- **Property-Based Tests:** fast-check for comprehensive input validation
- **E2E Tests:** Playwright for full user journey testing
- **Type Safety:** TypeScript for compile-time error prevention

## 🚀 Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

For other platforms, build the application:
\`\`\`bash
npm run build
npm start
\`\`\`

## 📝 Environment Variables

Create a \`.env.local\` file based on \`.env.local.example\`:

\`\`\`env
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Anywheredoor
NEXT_PUBLIC_SITE_DESCRIPTION=Transform your career with expert-led online courses
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_GTM_ID=your-google-tag-manager-id
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/new-feature\`
3. Make your changes and add tests
4. Run the test suite: \`npm test\`
5. Commit your changes: \`git commit -m 'Add new feature'\`
6. Push to the branch: \`git push origin feature/new-feature\`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Jest Documentation](https://jestjs.io/docs)
- [Playwright Documentation](https://playwright.dev/docs)
