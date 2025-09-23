import axios, { AxiosError } from 'axios'

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
  userMessage: string
  retryable: boolean
}

export interface ErrorContext {
  operation: string
  endpoint?: string
  params?: any
  data?: any
}

/**
 * Comprehensive error handler for API calls
 */
export function handleApiError(error: unknown, context: ErrorContext): ApiError {
  console.error(`❌ [ERROR] ${context.operation} failed:`, error)

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    return handleAxiosError(error, context)
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Network connection failed',
      code: 'NETWORK_ERROR',
      userMessage:
        'Unable to connect to the server. Please check your internet connection and try again.',
      retryable: true,
    }
  }

  // Handle unknown errors
  return {
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    code: 'UNKNOWN_ERROR',
    userMessage: 'An unexpected error occurred. Please try again later.',
    retryable: false,
  }
}

/**
 * Handle Axios-specific errors
 */
function handleAxiosError(error: AxiosError, context: ErrorContext): ApiError {
  const { response, request, code, message } = error

  // Server responded with error status
  if (response) {
    return handleHttpError(response.status, response.data, context)
  }

  // Request was made but no response received
  if (request) {
    return {
      message: 'No response from server',
      code: 'NO_RESPONSE',
      status: 0,
      userMessage: 'The server is not responding. Please check your connection and try again.',
      retryable: true,
    }
  }

  // Request setup error
  return {
    message: message || 'Request setup failed',
    code: code || 'REQUEST_ERROR',
    userMessage: 'Failed to prepare the request. Please try again.',
    retryable: false,
  }
}

/**
 * Handle HTTP status code errors
 */
function handleHttpError(status: number, data: any, context: ErrorContext): ApiError {
  const baseError = {
    status,
    details: data,
  }

  switch (status) {
    case 400:
      return {
        ...baseError,
        message: 'Bad Request',
        code: 'BAD_REQUEST',
        userMessage:
          getValidationMessage(data) || 'Invalid request. Please check your input and try again.',
        retryable: false,
      }

    case 401:
      return {
        ...baseError,
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        userMessage: 'You are not authorized to perform this action. Please log in again.',
        retryable: false,
      }

    case 403:
      return {
        ...baseError,
        message: 'Forbidden',
        code: 'FORBIDDEN',
        userMessage: 'You do not have permission to perform this action.',
        retryable: false,
      }

    case 404:
      return {
        ...baseError,
        message: 'Not Found',
        code: 'NOT_FOUND',
        userMessage: 'The requested resource was not found.',
        retryable: false,
      }

    case 409:
      return {
        ...baseError,
        message: 'Conflict',
        code: 'CONFLICT',
        userMessage: 'There was a conflict with the current state. Please refresh and try again.',
        retryable: false,
      }

    case 422:
      return {
        ...baseError,
        message: 'Validation Error',
        code: 'VALIDATION_ERROR',
        userMessage: getValidationMessage(data) || 'Please check your input and try again.',
        retryable: false,
      }

    case 429:
      return {
        ...baseError,
        message: 'Too Many Requests',
        code: 'RATE_LIMITED',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        retryable: true,
      }

    case 500:
      return {
        ...baseError,
        message: 'Internal Server Error',
        code: 'SERVER_ERROR',
        userMessage: 'The server encountered an error. Please try again later.',
        retryable: true,
      }

    case 502:
    case 503:
    case 504:
      return {
        ...baseError,
        message: 'Service Unavailable',
        code: 'SERVICE_UNAVAILABLE',
        userMessage: 'The service is temporarily unavailable. Please try again later.',
        retryable: true,
      }

    default:
      return {
        ...baseError,
        message: `HTTP ${status} Error`,
        code: 'HTTP_ERROR',
        userMessage: 'An error occurred while processing your request. Please try again.',
        retryable: status >= 500,
      }
  }
}

/**
 * Extract user-friendly validation messages from error data
 */
function getValidationMessage(data: any): string | null {
  if (!data) return null

  // Handle different error response formats
  if (typeof data === 'string') {
    return data
  }

  if (data.message) {
    return data.message
  }

  if (data.error) {
    return data.error
  }

  if (data.detail) {
    return data.detail
  }

  // Handle field-specific validation errors
  if (data.errors && typeof data.errors === 'object') {
    const errorMessages = Object.entries(data.errors)
      .map(([field, messages]) => {
        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        const messageList = Array.isArray(messages) ? messages.join(', ') : messages
        return `${fieldName}: ${messageList}`
      })
      .join('; ')

    if (errorMessages) {
      return errorMessages
    }
  }

  return null
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  return error.retryable
}

/**
 * Get retry delay based on error type
 */
export function getRetryDelay(error: ApiError, attempt: number): number {
  if (!isRetryableError(error)) return 0

  // Exponential backoff with jitter
  const baseDelay = 1000 // 1 second
  const maxDelay = 10000 // 10 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
  const jitter = Math.random() * 1000 // Add up to 1 second of jitter

  return delay + jitter
}

/**
 * Create a user-friendly error message for display
 */
export function createUserErrorMessage(error: ApiError, context: ErrorContext): string {
  const operation = context.operation.toLowerCase()

  // Add context-specific messages
  switch (operation) {
    case 'submit incident':
      if (error.code === 'VALIDATION_ERROR') {
        return `Failed to submit incident: ${error.userMessage}`
      }
      if (error.code === 'SERVER_ERROR') {
        return 'Unable to submit incident due to server error. Please try again in a few moments.'
      }
      return `Failed to submit incident: ${error.userMessage}`

    case 'fetch incidents':
      return `Unable to load incidents: ${error.userMessage}`

    case 'fetch responders':
      return `Unable to load responders: ${error.userMessage}`

    case 'fetch alerts':
      return `Unable to load alerts: ${error.userMessage}`

    default:
      return error.userMessage
  }
}
