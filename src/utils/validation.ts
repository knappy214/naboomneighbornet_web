/**
 * Validation Utilities
 * Input validation and sanitization for communication hub
 * Part of User Story 1: Real-Time Discussion Channels
 */

import type { ValidationResult, CreateChannelForm, SendMessageForm } from '@/types/communication'

// Validation rules
const VALIDATION_RULES = {
  channelName: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  channelDescription: {
    maxLength: 500,
  },
  messageContent: {
    minLength: 1,
    maxLength: 2000,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  displayName: {
    minLength: 1,
    maxLength: 50,
  },
}

// Error messages
const ERROR_MESSAGES = {
  channelName: {
    required: 'Channel name is required',
    minLength: `Channel name must be at least ${VALIDATION_RULES.channelName.minLength} characters`,
    maxLength: `Channel name must be no more than ${VALIDATION_RULES.channelName.maxLength} characters`,
    pattern: 'Channel name can only contain letters, numbers, hyphens, and underscores',
  },
  channelDescription: {
    maxLength: `Channel description must be no more than ${VALIDATION_RULES.channelDescription.maxLength} characters`,
  },
  messageContent: {
    required: 'Message content is required',
    minLength: `Message must be at least ${VALIDATION_RULES.messageContent.minLength} character`,
    maxLength: `Message must be no more than ${VALIDATION_RULES.messageContent.maxLength} characters`,
  },
  username: {
    required: 'Username is required',
    minLength: `Username must be at least ${VALIDATION_RULES.username.minLength} characters`,
    maxLength: `Username must be no more than ${VALIDATION_RULES.username.maxLength} characters`,
    pattern: 'Username can only contain letters, numbers, hyphens, and underscores',
  },
  displayName: {
    required: 'Display name is required',
    minLength: `Display name must be at least ${VALIDATION_RULES.displayName.minLength} character`,
    maxLength: `Display name must be no more than ${VALIDATION_RULES.displayName.maxLength} characters`,
  },
}

/**
 * Validate channel name
 */
export function validateChannelName(name: string): ValidationResult {
  const errors: string[] = []

  if (!name || name.trim().length === 0) {
    errors.push(ERROR_MESSAGES.channelName.required)
    return { isValid: false, errors, firstError: errors[0] }
  }

  const trimmedName = name.trim()

  if (trimmedName.length < VALIDATION_RULES.channelName.minLength) {
    errors.push(ERROR_MESSAGES.channelName.minLength)
  }

  if (trimmedName.length > VALIDATION_RULES.channelName.maxLength) {
    errors.push(ERROR_MESSAGES.channelName.maxLength)
  }

  if (!VALIDATION_RULES.channelName.pattern.test(trimmedName)) {
    errors.push(ERROR_MESSAGES.channelName.pattern)
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

/**
 * Validate channel description
 */
export function validateChannelDescription(description: string): ValidationResult {
  const errors: string[] = []

  if (description && description.length > VALIDATION_RULES.channelDescription.maxLength) {
    errors.push(ERROR_MESSAGES.channelDescription.maxLength)
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): ValidationResult {
  const errors: string[] = []

  if (!content || content.trim().length === 0) {
    errors.push(ERROR_MESSAGES.messageContent.required)
    return { isValid: false, errors, firstError: errors[0] }
  }

  const trimmedContent = content.trim()

  if (trimmedContent.length < VALIDATION_RULES.messageContent.minLength) {
    errors.push(ERROR_MESSAGES.messageContent.minLength)
  }

  if (trimmedContent.length > VALIDATION_RULES.messageContent.maxLength) {
    errors.push(ERROR_MESSAGES.messageContent.maxLength)
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = []

  if (!username || username.trim().length === 0) {
    errors.push(ERROR_MESSAGES.username.required)
    return { isValid: false, errors, firstError: errors[0] }
  }

  const trimmedUsername = username.trim()

  if (trimmedUsername.length < VALIDATION_RULES.username.minLength) {
    errors.push(ERROR_MESSAGES.username.minLength)
  }

  if (trimmedUsername.length > VALIDATION_RULES.username.maxLength) {
    errors.push(ERROR_MESSAGES.username.maxLength)
  }

  if (!VALIDATION_RULES.username.pattern.test(trimmedUsername)) {
    errors.push(ERROR_MESSAGES.username.pattern)
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

/**
 * Validate display name
 */
export function validateDisplayName(displayName: string): ValidationResult {
  const errors: string[] = []

  if (!displayName || displayName.trim().length === 0) {
    errors.push(ERROR_MESSAGES.displayName.required)
    return { isValid: false, errors, firstError: errors[0] }
  }

  const trimmedDisplayName = displayName.trim()

  if (trimmedDisplayName.length < VALIDATION_RULES.displayName.minLength) {
    errors.push(ERROR_MESSAGES.displayName.minLength)
  }

  if (trimmedDisplayName.length > VALIDATION_RULES.displayName.maxLength) {
    errors.push(ERROR_MESSAGES.displayName.maxLength)
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

/**
 * Validate create channel form
 */
export function validateCreateChannelForm(form: CreateChannelForm): ValidationResult {
  const errors: string[] = []

  // Validate channel name
  const nameValidation = validateChannelName(form.name)
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors)
  }

  // Validate channel description
  if (form.description) {
    const descriptionValidation = validateChannelDescription(form.description)
    if (!descriptionValidation.isValid) {
      errors.push(...descriptionValidation.errors)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

/**
 * Validate send message form
 */
export function validateSendMessageForm(form: SendMessageForm): ValidationResult {
  const errors: string[] = []

  // Validate message content
  const contentValidation = validateMessageContent(form.content)
  if (!contentValidation.isValid) {
    errors.push(...contentValidation.errors)
  }

  // Validate message type
  if (!form.type || !['text', 'image', 'file'].includes(form.type)) {
    errors.push('Invalid message type')
  }

  // Validate attachments
  if (form.attachments) {
    if (form.attachments.length > 10) {
      errors.push('Maximum 10 attachments allowed')
    }

    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
    ]

    form.attachments.forEach((file, index) => {
      if (file.size > maxFileSize) {
        errors.push(`Attachment ${index + 1} is too large (max 10MB)`)
      }

      if (!allowedTypes.includes(file.type)) {
        errors.push(`Attachment ${index + 1} has unsupported file type`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

/**
 * Sanitize message content
 */
export function sanitizeContent(content: string): string {
  // Remove potentially dangerous HTML tags
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')

  // Trim whitespace
  return sanitized.trim()
}

/**
 * Sanitize channel name
 */
export function sanitizeChannelName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_-]/g, '')
}

/**
 * Sanitize username
 */
export function sanitizeUsername(username: string): string {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_-]/g, '')
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []

  if (!email || email.trim().length === 0) {
    errors.push('Email is required')
    return { isValid: false, errors, firstError: errors[0] }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email.trim())) {
    errors.push('Invalid email format')
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (!password || password.length === 0) {
    errors.push('Password is required')
    return { isValid: false, errors, firstError: errors[0] }
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters long')
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  const errors: string[] = []

  if (!url || url.trim().length === 0) {
    errors.push('URL is required')
    return { isValid: false, errors, firstError: errors[0] }
  }

  try {
    new URL(url.trim())
  } catch {
    errors.push('Invalid URL format')
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: string[]
    maxCount?: number
  } = {},
): ValidationResult {
  const errors: string[] = []
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
    ],
    maxCount = 10,
  } = options

  if (file.size > maxSize) {
    errors.push(`File size must be no more than ${Math.round(maxSize / (1024 * 1024))}MB`)
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  }
}

// Export validation object
export const validation = {
  channelName: validateChannelName,
  channelDescription: validateChannelDescription,
  messageContent: validateMessageContent,
  username: validateUsername,
  displayName: validateDisplayName,
  createChannelForm: validateCreateChannelForm,
  sendMessageForm: validateSendMessageForm,
  email: validateEmail,
  password: validatePassword,
  url: validateUrl,
  fileUpload: validateFileUpload,
  sanitizeContent,
  sanitizeChannelName,
  sanitizeUsername,
}

export default validation
