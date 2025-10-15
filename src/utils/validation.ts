/**
 * Validation utilities for Community Communication Hub
 * Provides comprehensive validation for forms, messages, and data
 */

import type {
  CreateChannelForm,
  CreateEventForm,
  SendMessageForm,
  SearchForm,
  UserProfile,
  UserPreferences,
  NotificationSettings,
  Channel,
  Event,
  Message,
} from '@/types/communication'

// ============================================================================
// Validation Rules
// ============================================================================

export interface ValidationRule<T = any> {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: T) => string | null
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
  firstError?: string
}

// ============================================================================
// Common Validation Functions
// ============================================================================

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`
  }
  return null
}

/**
 * Validate string length
 */
export function validateLength(
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): string | null {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters long`
  }
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters long`
  }
  return null
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): string | null {
  try {
    new URL(url)
    return null
  } catch {
    return 'Please enter a valid URL'
  }
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: Date, endDate: Date): string | null {
  if (startDate >= endDate) {
    return 'End date must be after start date'
  }
  return null
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeBytes: number): string | null {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024))
    return `File size must be less than ${maxSizeMB}MB`
  }
  return null
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`
  }
  return null
}

// ============================================================================
// Form Validation
// ============================================================================

/**
 * Validate channel creation form
 */
export function validateCreateChannelForm(data: CreateChannelForm): ValidationResult {
  const errors: Record<string, string[]> = {}

  // Validate name
  const nameErrors: string[] = []
  const nameRequired = validateRequired(data.name, 'Channel name')
  if (nameRequired) nameErrors.push(nameRequired)
  const nameLength = validateLength(data.name, 1, 50, 'Channel name')
  if (nameLength) nameErrors.push(nameLength)
  if (nameErrors.length > 0) errors.name = nameErrors

  // Validate description
  const descriptionErrors: string[] = []
  const descriptionLength = validateLength(data.description, 0, 200, 'Description')
  if (descriptionLength) descriptionErrors.push(descriptionLength)
  if (descriptionErrors.length > 0) errors.description = descriptionErrors

  // Validate type
  const validTypes = ['general', 'safety', 'events', 'private']
  if (!validTypes.includes(data.type)) {
    errors.type = ['Channel type must be one of: general, safety, events, private']
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError: Object.values(errors).flat()[0],
  }
}

/**
 * Validate event creation form
 */
export function validateCreateEventForm(data: CreateEventForm): ValidationResult {
  const errors: Record<string, string[]> = {}

  // Validate title
  const titleErrors: string[] = []
  const titleRequired = validateRequired(data.title, 'Event title')
  if (titleRequired) titleErrors.push(titleRequired)
  const titleLength = validateLength(data.title, 1, 100, 'Event title')
  if (titleLength) titleErrors.push(titleLength)
  if (titleErrors.length > 0) errors.title = titleErrors

  // Validate description
  const descriptionErrors: string[] = []
  const descriptionLength = validateLength(data.description, 0, 500, 'Description')
  if (descriptionLength) descriptionErrors.push(descriptionLength)
  if (descriptionErrors.length > 0) errors.description = descriptionErrors

  // Validate type
  const validTypes = ['meeting', 'social', 'emergency', 'maintenance', 'other']
  if (!validTypes.includes(data.type)) {
    errors.type = ['Event type must be one of: meeting, social, emergency, maintenance, other']
  }

  // Validate dates
  const dateErrors: string[] = []
  const dateRange = validateDateRange(data.startDate, data.endDate)
  if (dateRange) dateErrors.push(dateRange)
  if (data.startDate < new Date()) {
    dateErrors.push('Start date must be in the future')
  }
  if (dateErrors.length > 0) errors.dates = dateErrors

  // Validate location
  const locationErrors: string[] = []
  if (!data.location.name) {
    locationErrors.push('Location name is required')
  }
  if (data.location.isVirtual && !data.location.meetingLink) {
    locationErrors.push('Meeting link is required for virtual events')
  }
  if (locationErrors.length > 0) errors.location = locationErrors

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError: Object.values(errors).flat()[0],
  }
}

/**
 * Validate message form
 */
export function validateSendMessageForm(data: SendMessageForm): ValidationResult {
  const errors: Record<string, string[]> = {}

  // Validate content
  const contentErrors: string[] = []
  const contentRequired = validateRequired(data.content, 'Message content')
  if (contentRequired) contentErrors.push(contentRequired)
  const contentLength = validateLength(data.content, 1, 2000, 'Message content')
  if (contentLength) contentErrors.push(contentLength)
  if (contentErrors.length > 0) errors.content = contentErrors

  // Validate type
  const validTypes = ['text', 'image', 'file', 'system', 'event']
  if (!validTypes.includes(data.type)) {
    errors.type = ['Message type must be one of: text, image, file, system, event']
  }

  // Validate attachments
  if (data.attachments) {
    const attachmentErrors: string[] = []
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    data.attachments.forEach((file, index) => {
      const sizeError = validateFileSize(file, maxFileSize)
      if (sizeError) {
        attachmentErrors.push(`File ${index + 1}: ${sizeError}`)
      }
      const typeError = validateFileType(file, allowedTypes)
      if (typeError) {
        attachmentErrors.push(`File ${index + 1}: ${typeError}`)
      }
    })

    if (attachmentErrors.length > 0) errors.attachments = attachmentErrors
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError: Object.values(errors).flat()[0],
  }
}

/**
 * Validate search form
 */
export function validateSearchForm(data: SearchForm): ValidationResult {
  const errors: Record<string, string[]> = {}

  // Validate query
  const queryErrors: string[] = []
  const queryLength = validateLength(data.query, 1, 100, 'Search query')
  if (queryLength) queryErrors.push(queryLength)
  if (queryErrors.length > 0) errors.query = queryErrors

  // Validate date range if provided
  if (data.dateRange) {
    const dateErrors: string[] = []
    const dateRange = validateDateRange(data.dateRange.start, data.dateRange.end)
    if (dateRange) dateErrors.push(dateRange)
    if (dateErrors.length > 0) errors.dateRange = dateErrors
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError: Object.values(errors).flat()[0],
  }
}

// ============================================================================
// User Profile Validation
// ============================================================================

/**
 * Validate user profile
 */
export function validateUserProfile(data: Partial<UserProfile>): ValidationResult {
  const errors: Record<string, string[]> = {}

  // Validate username
  if (data.username) {
    const usernameErrors: string[] = []
    const usernameLength = validateLength(data.username, 3, 30, 'Username')
    if (usernameLength) usernameErrors.push(usernameLength)
    const usernamePattern = /^[a-zA-Z0-9_-]+$/
    if (!usernamePattern.test(data.username)) {
      usernameErrors.push('Username can only contain letters, numbers, underscores, and hyphens')
    }
    if (usernameErrors.length > 0) errors.username = usernameErrors
  }

  // Validate display name
  if (data.displayName) {
    const displayNameErrors: string[] = []
    const displayNameLength = validateLength(data.displayName, 1, 50, 'Display name')
    if (displayNameLength) displayNameErrors.push(displayNameLength)
    if (displayNameErrors.length > 0) errors.displayName = displayNameErrors
  }

  // Validate email
  if (data.email) {
    const emailErrors: string[] = []
    const emailValid = validateEmail(data.email)
    if (emailValid) emailErrors.push(emailValid)
    if (emailErrors.length > 0) errors.email = emailErrors
  }

  // Validate language
  if (data.language) {
    const validLanguages = ['en', 'af']
    if (!validLanguages.includes(data.language)) {
      errors.language = ['Language must be either "en" or "af"']
    }
  }

  // Validate timezone
  if (data.timezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: data.timezone })
    } catch {
      errors.timezone = ['Please enter a valid timezone']
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError: Object.values(errors).flat()[0],
  }
}

/**
 * Validate user preferences
 */
export function validateUserPreferences(data: Partial<UserPreferences>): ValidationResult {
  const errors: Record<string, string[]> = {}

  // Validate theme
  if (data.theme) {
    const validThemes = ['light', 'dark', 'auto']
    if (!validThemes.includes(data.theme)) {
      errors.theme = ['Theme must be one of: light, dark, auto']
    }
  }

  // Validate message display
  if (data.messageDisplay) {
    const validDisplays = ['compact', 'comfortable']
    if (!validDisplays.includes(data.messageDisplay)) {
      errors.messageDisplay = ['Message display must be either "compact" or "comfortable"']
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError: Object.values(errors).flat()[0],
  }
}

// ============================================================================
// Content Validation
// ============================================================================

/**
 * Validate message content for moderation
 */
export function validateMessageContent(content: string): ValidationResult {
  const errors: Record<string, string[]> = {}

  // Check for profanity (basic implementation)
  const profanityWords = ['spam', 'scam', 'fake'] // Add more as needed
  const foundProfanity = profanityWords.filter(word => 
    content.toLowerCase().includes(word.toLowerCase())
  )

  if (foundProfanity.length > 0) {
    errors.content = ['Message contains inappropriate content']
  }

  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.7 && content.length > 10) {
    errors.content = ['Please avoid excessive use of capital letters']
  }

  // Check for excessive repetition
  const words = content.split(/\s+/)
  const wordCounts = words.reduce((acc, word) => {
    acc[word.toLowerCase()] = (acc[word.toLowerCase()] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const maxRepetition = Math.max(...Object.values(wordCounts))
  if (maxRepetition > 5) {
    errors.content = ['Please avoid excessive repetition of words']
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError: Object.values(errors).flat()[0],
  }
}

/**
 * Sanitize message content
 */
export function sanitizeMessageContent(content: string): string {
  // Remove HTML tags
  let sanitized = content.replace(/<[^>]*>/g, '')
  
  // Decode HTML entities
  const textarea = document.createElement('textarea')
  textarea.innerHTML = sanitized
  sanitized = textarea.value
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

// ============================================================================
// Generic Validation Helper
// ============================================================================

/**
 * Validate an object against rules
 */
export function validateObject<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, ValidationRule[]>
): ValidationResult {
  const errors: Record<string, string[]> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const fieldErrors: string[] = []
    const value = data[field as keyof T]

    for (const rule of fieldRules) {
      let error: string | null = null

      // Required validation
      if (rule.required && (value === null || value === undefined || value === '')) {
        error = rule.message || `${field} is required`
      }

      // Length validation
      if (!error && typeof value === 'string' && rule.minLength !== undefined) {
        if (value.length < rule.minLength) {
          error = rule.message || `${field} must be at least ${rule.minLength} characters long`
        }
      }

      if (!error && typeof value === 'string' && rule.maxLength !== undefined) {
        if (value.length > rule.maxLength) {
          error = rule.message || `${field} must be no more than ${rule.maxLength} characters long`
        }
      }

      // Pattern validation
      if (!error && typeof value === 'string' && rule.pattern) {
        if (!rule.pattern.test(value)) {
          error = rule.message || `${field} format is invalid`
        }
      }

      // Custom validation
      if (!error && rule.custom) {
        error = rule.custom(value)
      }

      if (error) {
        fieldErrors.push(error)
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError: Object.values(errors).flat()[0],
  }
}

// ============================================================================
// Export all validation functions
// ============================================================================

export const validation = {
  // Common validators
  required: validateRequired,
  length: validateLength,
  email: validateEmail,
  url: validateUrl,
  dateRange: validateDateRange,
  fileSize: validateFileSize,
  fileType: validateFileType,

  // Form validators
  createChannel: validateCreateChannelForm,
  createEvent: validateCreateEventForm,
  sendMessage: validateSendMessageForm,
  search: validateSearchForm,

  // Profile validators
  userProfile: validateUserProfile,
  userPreferences: validateUserPreferences,

  // Content validators
  messageContent: validateMessageContent,
  sanitizeContent: sanitizeMessageContent,

  // Generic validator
  object: validateObject,
}

export default validation
