const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (if you have them in jsconfig.json or tsconfig.json)
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    // Add any other aliases you use
  },
  // Add more setup options before each test is run
  // setupFiles: ['<rootDir>/jest.polyfills.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias mapping
  // moduleDirectories: ['node_modules', '<rootDir>/'],
};

// createJestConfig is initially passed the customJestConfig
module.exports = createJestConfig(customJestConfig); 