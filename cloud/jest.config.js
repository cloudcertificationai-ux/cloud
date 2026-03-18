/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        target: 'es6',
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true,
        allowJs: true,
        skipLibCheck: true,
        strict: false,
        jsx: 'react-jsx',
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
        },
      },
    }],
    '^.+\\.m?js$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        allowJs: true,
        esModuleInterop: true,
      },
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@paralleldrive/cuid2|@noble/hashes|@noble/ciphers)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};

module.exports = config;
