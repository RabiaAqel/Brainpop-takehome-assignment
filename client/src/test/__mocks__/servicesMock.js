// Mock services for tests
const quizService = {
  getQuizInfo: jest.fn(),
  startQuizAttempt: jest.fn(),
  getQuizQuestions: jest.fn(),
  getQuizResults: jest.fn(),
  saveAnswer: jest.fn(),
  submitAttempt: jest.fn()
}

const authService = {
  login: jest.fn(),
  logout: jest.fn(),
  getToken: jest.fn(),
  initAuth: jest.fn()
}

const apiService = {
  login: jest.fn(),
  getQuizzes: jest.fn(),
  getQuizInfo: jest.fn(),
  getQuizQuestions: jest.fn(),
  getQuizResults: jest.fn(),
  startQuizAttempt: jest.fn(),
  saveAnswer: jest.fn(),
  submitAttempt: jest.fn(),
  request: jest.fn(),
  handleAuthError: jest.fn()
}

// Export individual services
export { quizService, authService, apiService }

// Export default for services/index.js
export default {
  quizService,
  authService,
  apiService
} 