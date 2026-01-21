module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(test|pbt).js'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/**/*.pbt.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  },
  globals: {
    browser: {},
  },
};
