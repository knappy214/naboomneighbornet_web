/**
 * Utility function to convert relative avatar URLs to absolute URLs
 * by prepending the base URL from environment variables
 */

/**
 * Converts a relative avatar URL to an absolute URL
 * @param avatarUrl - The relative URL from the API (e.g., "/images/...")
 * @returns The absolute URL with base URL prepended
 */
export function getAbsoluteAvatarUrl(avatarUrl: string | undefined | null): string | undefined {
  if (!avatarUrl) return undefined

  // If it's already an absolute URL, return as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl
  }

  // Get the base URL from environment variables
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://naboomneighbornet.net.za'

  // Ensure the base URL doesn't end with a slash and the avatar URL starts with one
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const cleanAvatarUrl = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`

  return `${cleanBaseUrl}${cleanAvatarUrl}`
}

/**
 * Converts multiple avatar URLs to absolute URLs
 * @param avatarInfo - Object containing avatar URLs
 * @returns Object with absolute avatar URLs
 */
export function getAbsoluteAvatarUrls(avatarInfo: {
  url?: string
  small?: string
  medium?: string
  large?: string
}): {
  url?: string
  small?: string
  medium?: string
  large?: string
} {
  return {
    url: getAbsoluteAvatarUrl(avatarInfo.url),
    small: getAbsoluteAvatarUrl(avatarInfo.small),
    medium: getAbsoluteAvatarUrl(avatarInfo.medium),
    large: getAbsoluteAvatarUrl(avatarInfo.large),
  }
}
