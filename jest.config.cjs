module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.js$': 'babel-jest'
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test|unit).[jt]s?(x)',
    '**/src/test/**/*.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.svg\\?component$': '<rootDir>/src/test/__mocks__/svgMock.js',
    '\\.svg$': '<rootDir>/src/test/__mocks__/svgMock.js'
  },
} 