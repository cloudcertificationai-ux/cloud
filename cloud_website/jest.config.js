/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  moduleNameMapper: {
    // Handle ES modules that Jest can't parse
    '^@vercel/analytics/react$': '<rootDir>/__mocks__/@vercel/analytics.js',
    '^@vercel/speed-insights/next$': '<rootDir>/__mocks__/@vercel/speed-insights.js',
    '^jose': '<rootDir>/__mocks__/jose.js',
    '^next-auth$': '<rootDir>/__mocks__/next-auth.js',
    '^next-auth/providers/auth0$': '<rootDir>/__mocks__/next-auth/providers/auth0.js',
    '^next-auth/providers/google$': '<rootDir>/__mocks__/next-auth/providers/google.js',
    '^next-auth/providers/apple$': '<rootDir>/__mocks__/next-auth/providers/apple.js',
    '^@panva/hkdf$': '<rootDir>/__mocks__/@panva/hkdf.js',
    '^openid-client$': '<rootDir>/__mocks__/openid-client.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@vercel/analytics|bullmq|msgpackr|jose|@panva|openid-client)/)',
  ],
  // Increase memory limit for tests
  maxWorkers: 1,
  workerIdleMemoryLimit: '1024MB',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);