export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/js/**/*.js',
    '!src/js/main.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
