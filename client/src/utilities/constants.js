/**
 * Application constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
}

// Quiz Configuration
export const QUIZ_CONFIG = {
  DEFAULT_QUIZ_ID: 1,
  QUESTIONS_PER_QUIZ: 5,
  OPTIONS_PER_QUESTION: 4,
  MIN_ANSWERS_TO_SUBMIT: 5
}

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  LOADING_TIMEOUT: 5000
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  QUIZ_LOAD_ERROR: 'Failed to load quiz. Please try again.',
  SUBMISSION_ERROR: 'Failed to submit quiz. Please try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  QUIZ_PROGRESS: 'quiz_progress'
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
}
