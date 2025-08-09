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
  testPathIgnorePatterns: [
    'src/test/components/screens/features/quiz/questionsScreen/',
    'src/test/components/screens/features/quiz/summaryScreen/',
    'src/test/components/screens/features/quiz/startScreen/',
    'src/test/__mocks__/',
    'src/test/setup.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/router$': '<rootDir>/src/test/__mocks__/routerMock.js',
    '^@/services$': '<rootDir>/src/test/__mocks__/servicesMock.js',
    '^@/services/(.*)$': '<rootDir>/src/test/__mocks__/servicesMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/test/__mocks__/fileMock.js'
  },
  setupFiles: ['<rootDir>/src/test/setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
} 