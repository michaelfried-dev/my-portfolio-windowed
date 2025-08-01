import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
  // Allow ESM modules in node_modules to be transpiled (for react-markdown, remark-gfm)
  transformIgnorePatterns: [
    "/node_modules/(?!react-markdown|remark-gfm)/"
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!<rootDir>/out/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/*.config.js',
    '!<rootDir>/*.config.ts',
    '!<rootDir>/coverage/**',
  ],
  testEnvironment: 'jsdom',
  // Prevent hanging tests due to React 19 MESSAGEPORT handles
  testTimeout: 10000,
  // Add more setup options before each test is run
  setupFiles: ['<rootDir>/jest.globals-setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react/index.js',
    '^react-dom$': '<rootDir>/node_modules/react-dom/index.js',
    '^@testing-library/react$':
      '<rootDir>/node_modules/@testing-library/react/dist/index.js',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^react-markdown$': '<rootDir>/src/__mocks__/react-markdown.tsx',
    '^remark-gfm$': '<rootDir>/src/__mocks__/remark-gfm.js',
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
