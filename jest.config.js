module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/scripts/**',
    '!src/logs/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000
};

