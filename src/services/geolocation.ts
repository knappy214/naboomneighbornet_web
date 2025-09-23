export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface GeolocationError {
  code: number
  message: string
  userMessage: string
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
  maximumAge: 300000, // 5 minutes
}

/**
 * Get the user's current location using the browser's geolocation API
 */
export async function getCurrentLocation(options: GeolocationOptions = {}): Promise<LocationData> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      const error: GeolocationError = {
        code: 0,
        message: 'Geolocation is not supported by this browser',
        userMessage:
          'Location services are not available in your browser. Please enter your location manually.',
      }
      reject(error)
      return
    }

    console.log('🌍 [GEOLOCATION] Requesting current location...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }

        console.log('✅ [GEOLOCATION] Location obtained:', locationData)
        resolve(locationData)
      },
      (error) => {
        const geolocationError = handleGeolocationError(error)
        console.error('❌ [GEOLOCATION] Failed to get location:', geolocationError)
        reject(geolocationError)
      },
      opts,
    )
  })
}

/**
 * Handle geolocation errors and convert them to user-friendly messages
 */
function handleGeolocationError(error: GeolocationPositionError): GeolocationError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        code: error.code,
        message: 'User denied the request for Geolocation',
        userMessage:
          'Location access was denied. Please allow location access or enter your location manually.',
      }

    case error.POSITION_UNAVAILABLE:
      return {
        code: error.code,
        message: 'Location information is unavailable',
        userMessage:
          'Unable to determine your location. Please check your device settings or enter your location manually.',
      }

    case error.TIMEOUT:
      return {
        code: error.code,
        message: 'The request to get user location timed out',
        userMessage:
          'Location request timed out. Please try again or enter your location manually.',
      }

    default:
      return {
        code: error.code,
        message: 'An unknown error occurred while retrieving location',
        userMessage:
          'An error occurred while getting your location. Please enter your location manually.',
      }
  }
}

/**
 * Check if geolocation is available and permission is granted
 */
export async function checkGeolocationAvailability(): Promise<{
  supported: boolean
  permission: 'granted' | 'denied' | 'prompt' | 'unknown'
}> {
  if (!navigator.geolocation) {
    return { supported: false, permission: 'unknown' }
  }

  // Check if we can get permission status
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({
        name: 'geolocation' as PermissionName,
      })
      return {
        supported: true,
        permission: permission.state as 'granted' | 'denied' | 'prompt',
      }
    } catch (error) {
      console.warn('Could not check geolocation permission:', error)
    }
  }

  return { supported: true, permission: 'unknown' }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  latitude: number,
  longitude: number,
  precision: number = 6,
): string {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`
}

/**
 * Calculate distance between two coordinates (in meters)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Validate if coordinates are within reasonable bounds
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  )
}
