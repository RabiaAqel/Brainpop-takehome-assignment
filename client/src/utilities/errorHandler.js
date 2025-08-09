/**
 * Centralized error handling utility for consistent error management
 */

export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  QUIZ_ERROR: 'QUIZ_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

export const ErrorMessages = {
  [ErrorCodes.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection and try again.',
  [ErrorCodes.AUTHENTICATION_ERROR]: 'Authentication failed. Please log in again.',
  [ErrorCodes.VALIDATION_ERROR]: 'Invalid input. Please check your data and try again.',
  [ErrorCodes.NOT_FOUND_ERROR]: 'The requested resource was not found.',
  [ErrorCodes.SERVER_ERROR]: 'Server error occurred. Please try again later.',
  [ErrorCodes.QUIZ_ERROR]: 'Quiz error occurred. Please try again.',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
}

/**
 * Parse API error response and return user-friendly error
 * @param {Error|Object} error - The error object from API response
 * @returns {AppError} A standardized AppError instance with user-friendly message
 */
export function parseApiError(error) {
  // Handle network errors
  if (!error.response) {
    return new AppError(
      ErrorMessages[ErrorCodes.NETWORK_ERROR],
      ErrorCodes.NETWORK_ERROR,
      { originalError: error }
    )
  }

  const { status, data } = error.response

  // Handle HTTP status codes
  switch (status) {
    case 401:
      return new AppError(
        ErrorMessages[ErrorCodes.AUTHENTICATION_ERROR],
        ErrorCodes.AUTHENTICATION_ERROR,
        { status, data }
      )
    case 403:
      return new AppError(
        'Access denied. You do not have permission to perform this action.',
        'ACCESS_DENIED',
        { status, data }
      )
    case 404:
      return new AppError(
        ErrorMessages[ErrorCodes.NOT_FOUND_ERROR],
        ErrorCodes.NOT_FOUND_ERROR,
        { status, data }
      )
    case 422:
      return new AppError(
        data?.message || ErrorMessages[ErrorCodes.VALIDATION_ERROR],
        ErrorCodes.VALIDATION_ERROR,
        { status, data }
      )
    case 500:
      return new AppError(
        ErrorMessages[ErrorCodes.SERVER_ERROR],
        ErrorCodes.SERVER_ERROR,
        { status, data }
      )
    default:
      return new AppError(
        data?.message || ErrorMessages[ErrorCodes.UNKNOWN_ERROR],
        ErrorCodes.UNKNOWN_ERROR,
        { status, data }
      )
  }
}

/**
 * Handle errors with consistent logging and user feedback
 * @param {Error|AppError} error - The error to handle
 * @param {string} context - Context information for logging (e.g., component name)
 * @returns {AppError} The standardized error object
 */
export function handleError(error, context = '') {
  const appError = error instanceof AppError ? error : parseApiError(error)
  
  // Log error with context
  console.error(`[${context}] Error:`, {
    message: appError.message,
    code: appError.code,
    details: appError.details,
    timestamp: appError.timestamp,
    stack: appError.stack
  })

  return appError
}

/**
 * Create user-friendly error message
 * @param {Error|AppError|Object} error - The error object
 * @returns {string} A user-friendly error message
 */
export function getUserFriendlyMessage(error) {
  if (error instanceof AppError) {
    return error.message
  }
  
  // Handle common error patterns
  if (error.message?.includes('Network Error')) {
    return ErrorMessages[ErrorCodes.NETWORK_ERROR]
  }
  
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }
  
  return error.message || ErrorMessages[ErrorCodes.UNKNOWN_ERROR]
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} The result of the function execution
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}
