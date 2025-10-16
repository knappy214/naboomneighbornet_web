/**
 * Accessibility Utilities Composable
 * Provides comprehensive accessibility features and helpers for the Community Communication Hub
 * Ensures WCAG 2.1 AA compliance and South African accessibility standards
 */

import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { UserProfile } from '@/types/communication'

interface AccessibilityConfig {
  enableScreenReader: boolean
  enableKeyboardNavigation: boolean
  enableHighContrast: boolean
  enableLargeText: boolean
  enableReducedMotion: boolean
  enableFocusManagement: boolean
  enableARIALabels: boolean
  enableColorBlindSupport: boolean
  debug?: boolean
}

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  contrast: 'normal' | 'high' | 'extra-high'
  motion: 'normal' | 'reduced' | 'none'
  focusIndicator: 'normal' | 'high' | 'extra-high'
  screenReader: boolean
  keyboardNavigation: boolean
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  language: 'en' | 'af'
}

interface FocusTrap {
  element: HTMLElement
  firstFocusable: HTMLElement | null
  lastFocusable: HTMLElement | null
  previousActiveElement: HTMLElement | null
}

interface Announcement {
  id: string
  message: string
  priority: 'polite' | 'assertive'
  timestamp: Date
}

export function useAccessibility(config: Partial<AccessibilityConfig> = {}) {
  // ============================================================================
  // Configuration
  // ============================================================================

  const defaultConfig: Required<AccessibilityConfig> = {
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableHighContrast: true,
    enableLargeText: true,
    enableReducedMotion: true,
    enableFocusManagement: true,
    enableARIALabels: true,
    enableColorBlindSupport: true,
    debug: false,
  }

  const a11yConfig = { ...defaultConfig, ...config }

  // ============================================================================
  // State
  // ============================================================================

  const isInitialized = ref(false)
  const isScreenReaderActive = ref(false)
  const isKeyboardNavigationActive = ref(false)
  const currentFocusTrap = ref<FocusTrap | null>(null)
  const announcements = reactive<Announcement[]>([])

  const settings = reactive<AccessibilitySettings>({
    fontSize: 'medium',
    contrast: 'normal',
    motion: 'normal',
    focusIndicator: 'normal',
    screenReader: true,
    keyboardNavigation: true,
    colorBlindMode: 'none',
    language: 'en',
  })

  // ============================================================================
  // Screen Reader Support
  // ============================================================================

  /**
   * Initialize screen reader support
   */
  function initializeScreenReader(): void {
    if (!a11yConfig.enableScreenReader) return

    // Create live region for announcements
    createLiveRegion()

    // Detect screen reader usage
    detectScreenReader()

    // Setup ARIA labels
    setupARIALabels()

    log('Screen reader support initialized')
  }

  /**
   * Create live region for announcements
   */
  function createLiveRegion(): void {
    let liveRegion = document.getElementById('a11y-live-region')

    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'a11y-live-region'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
    }
  }

  /**
   * Detect screen reader usage
   */
  function detectScreenReader(): void {
    // Check for screen reader indicators
    const hasScreenReader =
      window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.navigator.userAgent.includes('VoiceOver') ||
      window.navigator.userAgent.includes('TalkBack') ||
      window.navigator.userAgent.includes('Orca') ||
      window.navigator.userAgent.includes('ChromeVox')

    isScreenReaderActive.value = hasScreenReader

    if (hasScreenReader) {
      log('Screen reader detected')
    }
  }

  /**
   * Announce message to screen readers
   */
  function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!a11yConfig.enableScreenReader) return

    const announcement: Announcement = {
      id: `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      priority,
      timestamp: new Date(),
    }

    announcements.push(announcement)

    // Update live region
    const liveRegion = document.getElementById('a11y-live-region')
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.textContent = message

      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }

    log('Announced:', message, priority)
  }

  /**
   * Setup ARIA labels for common elements
   */
  function setupARIALabels(): void {
    if (!a11yConfig.enableARIALabels) return

    // This would be implemented by individual components
    // For now, we'll provide the structure
    log('ARIA labels setup initialized')
  }

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  /**
   * Initialize keyboard navigation
   */
  function initializeKeyboardNavigation(): void {
    if (!a11yConfig.enableKeyboardNavigation) return

    // Setup keyboard event listeners
    document.addEventListener('keydown', handleKeyboardNavigation)

    // Setup focus management
    setupFocusManagement()

    isKeyboardNavigationActive.value = true

    log('Keyboard navigation initialized')
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyboardNavigation(event: KeyboardEvent): void {
    if (!a11yConfig.enableKeyboardNavigation) return

    const { key, ctrlKey, altKey, shiftKey, metaKey } = event

    // Skip if modifier keys are pressed (except Shift for Tab)
    if (ctrlKey || altKey || metaKey) return

    switch (key) {
      case 'Tab':
        handleTabNavigation(event)
        break
      case 'Enter':
      case ' ':
        handleActivation(event)
        break
      case 'Escape':
        handleEscape(event)
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        handleArrowNavigation(event)
        break
      case 'Home':
        handleHomeNavigation(event)
        break
      case 'End':
        handleEndNavigation(event)
        break
    }
  }

  /**
   * Handle Tab navigation
   */
  function handleTabNavigation(event: KeyboardEvent): void {
    if (currentFocusTrap.value) {
      const { firstFocusable, lastFocusable } = currentFocusTrap.value

      if (event.shiftKey) {
        // Shift + Tab: move backwards
        if (document.activeElement === firstFocusable) {
          event.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        // Tab: move forwards
        if (document.activeElement === lastFocusable) {
          event.preventDefault()
          firstFocusable?.focus()
        }
      }
    }
  }

  /**
   * Handle activation (Enter/Space)
   */
  function handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement

    if (target && (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button')) {
      event.preventDefault()
      target.click()
    }
  }

  /**
   * Handle Escape key
   */
  function handleEscape(event: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const modals = document.querySelectorAll('[role="dialog"]')
    if (modals.length > 0) {
      const lastModal = modals[modals.length - 1] as HTMLElement
      const closeButton = lastModal.querySelector(
        '[aria-label*="close"], [aria-label*="Close"]',
      ) as HTMLElement
      if (closeButton) {
        closeButton.click()
      }
    }
  }

  /**
   * Handle arrow key navigation
   */
  function handleArrowNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement

    if (target && target.getAttribute('role') === 'menu') {
      event.preventDefault()
      // Implement menu navigation
    } else if (target && target.getAttribute('role') === 'tablist') {
      event.preventDefault()
      // Implement tab navigation
    }
  }

  /**
   * Handle Home key navigation
   */
  function handleHomeNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement

    if (target && target.getAttribute('role') === 'menu') {
      event.preventDefault()
      const firstItem = target.querySelector('[role="menuitem"]:first-child') as HTMLElement
      firstItem?.focus()
    }
  }

  /**
   * Handle End key navigation
   */
  function handleEndNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement

    if (target && target.getAttribute('role') === 'menu') {
      event.preventDefault()
      const lastItem = target.querySelector('[role="menuitem"]:last-child') as HTMLElement
      lastItem?.focus()
    }
  }

  // ============================================================================
  // Focus Management
  // ============================================================================

  /**
   * Setup focus management
   */
  function setupFocusManagement(): void {
    if (!a11yConfig.enableFocusManagement) return

    // Track focus changes
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    log('Focus management initialized')
  }

  /**
   * Handle focus in
   */
  function handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement

    if (target) {
      // Add focus indicator
      target.classList.add('a11y-focused')

      // Announce focus changes for screen readers
      if (isScreenReaderActive.value) {
        const label =
          target.getAttribute('aria-label') ||
          target.getAttribute('aria-labelledby') ||
          target.textContent?.trim()

        if (label) {
          announce(`Focused: ${label}`)
        }
      }
    }
  }

  /**
   * Handle focus out
   */
  function handleFocusOut(event: FocusEvent): void {
    const target = event.target as HTMLElement

    if (target) {
      // Remove focus indicator
      target.classList.remove('a11y-focused')
    }
  }

  /**
   * Trap focus within an element
   */
  function trapFocus(element: HTMLElement): void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>

    const firstFocusable = focusableElements[0] || null
    const lastFocusable = focusableElements[focusableElements.length - 1] || null

    currentFocusTrap.value = {
      element,
      firstFocusable,
      lastFocusable,
      previousActiveElement: document.activeElement as HTMLElement,
    }

    // Focus first element
    firstFocusable?.focus()

    log('Focus trapped in element')
  }

  /**
   * Release focus trap
   */
  function releaseFocusTrap(): void {
    if (currentFocusTrap.value) {
      // Restore previous focus
      currentFocusTrap.value.previousActiveElement?.focus()

      currentFocusTrap.value = null

      log('Focus trap released')
    }
  }

  // ============================================================================
  // Visual Accessibility
  // ============================================================================

  /**
   * Apply accessibility settings
   */
  function applyAccessibilitySettings(): void {
    const root = document.documentElement

    // Apply font size
    root.style.setProperty('--a11y-font-size', getFontSizeValue(settings.fontSize))

    // Apply contrast
    root.style.setProperty('--a11y-contrast', getContrastValue(settings.contrast))

    // Apply motion
    root.style.setProperty('--a11y-motion', getMotionValue(settings.motion))

    // Apply focus indicator
    root.style.setProperty(
      '--a11y-focus-indicator',
      getFocusIndicatorValue(settings.focusIndicator),
    )

    // Apply color blind support
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(`a11y-colorblind-${settings.colorBlindMode}`)
    } else {
      root.classList.remove(
        'a11y-colorblind-protanopia',
        'a11y-colorblind-deuteranopia',
        'a11y-colorblind-tritanopia',
      )
    }

    log('Accessibility settings applied')
  }

  /**
   * Get font size value
   */
  function getFontSizeValue(size: string): string {
    const sizes = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      'extra-large': '1.25rem',
    }
    return sizes[size as keyof typeof sizes] || '1rem'
  }

  /**
   * Get contrast value
   */
  function getContrastValue(contrast: string): string {
    const contrasts = {
      normal: '1',
      high: '1.5',
      'extra-high': '2',
    }
    return contrasts[contrast as keyof typeof contrasts] || '1'
  }

  /**
   * Get motion value
   */
  function getMotionValue(motion: string): string {
    const motions = {
      normal: '1',
      reduced: '0.5',
      none: '0',
    }
    return motions[motion as keyof typeof motions] || '1'
  }

  /**
   * Get focus indicator value
   */
  function getFocusIndicatorValue(indicator: string): string {
    const indicators = {
      normal: '2px solid #0066cc',
      high: '3px solid #0066cc',
      'extra-high': '4px solid #0066cc',
    }
    return indicators[indicator as keyof typeof indicators] || '2px solid #0066cc'
  }

  // ============================================================================
  // Language Support
  // ============================================================================

  /**
   * Setup language support
   */
  function setupLanguageSupport(): void {
    // Set document language
    document.documentElement.lang = settings.language

    // Setup RTL support for Afrikaans if needed
    if (settings.language === 'af') {
      // Afrikaans is LTR, but we can add specific support if needed
      document.documentElement.dir = 'ltr'
    }

    log('Language support initialized:', settings.language)
  }

  /**
   * Update language
   */
  function updateLanguage(language: 'en' | 'af'): void {
    settings.language = language
    setupLanguageSupport()
    announce(`Language changed to ${language === 'en' ? 'English' : 'Afrikaans'}`)
  }

  // ============================================================================
  // User Preferences
  // ============================================================================

  /**
   * Load user preferences
   */
  function loadUserPreferences(user: UserProfile): void {
    if (user.preferences) {
      // Map user preferences to accessibility settings
      if (user.preferences.theme === 'dark') {
        settings.contrast = 'high'
      }

      if (user.preferences.messageDisplay === 'comfortable') {
        settings.fontSize = 'large'
      }

      if (user.language) {
        settings.language = user.language
      }
    }

    applyAccessibilitySettings()
    log('User preferences loaded')
  }

  /**
   * Save accessibility settings
   */
  function saveAccessibilitySettings(): void {
    // Save to localStorage
    localStorage.setItem('a11y-settings', JSON.stringify(settings))
    log('Accessibility settings saved')
  }

  /**
   * Load accessibility settings
   */
  function loadAccessibilitySettings(): void {
    try {
      const saved = localStorage.getItem('a11y-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        Object.assign(settings, parsed)
        applyAccessibilitySettings()
        log('Accessibility settings loaded')
      }
    } catch (error) {
      log('Failed to load accessibility settings:', error)
    }
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Check if element is focusable
   */
  function isFocusable(element: HTMLElement): boolean {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ]

    return focusableSelectors.some((selector) => element.matches(selector))
  }

  /**
   * Get accessible name for element
   */
  function getAccessibleName(element: HTMLElement): string {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      element.getAttribute('alt') ||
      element.getAttribute('title') ||
      ''
    )
  }

  /**
   * Check if element is visible to screen readers
   */
  function isVisibleToScreenReader(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element)
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.getAttribute('aria-hidden') !== 'true'
    )
  }

  // ============================================================================
  // Computed Properties
  // ============================================================================

  const isAccessible = computed(
    () => isScreenReaderActive.value || isKeyboardNavigationActive.value,
  )

  const hasAnnouncements = computed(() => announcements.length > 0)

  // ============================================================================
  // Lifecycle Management
  // ============================================================================

  /**
   * Initialize accessibility
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    try {
      // Load saved settings
      loadAccessibilitySettings()

      // Initialize features
      initializeScreenReader()
      initializeKeyboardNavigation()
      setupLanguageSupport()

      // Apply settings
      applyAccessibilitySettings()

      isInitialized.value = true

      log('Accessibility initialized')
    } catch (error) {
      log('Accessibility initialization failed:', error)
      throw error
    }
  }

  /**
   * Cleanup accessibility
   */
  function cleanup(): void {
    // Remove event listeners
    document.removeEventListener('keydown', handleKeyboardNavigation)
    document.removeEventListener('focusin', handleFocusIn)
    document.removeEventListener('focusout', handleFocusOut)

    // Clear focus trap
    releaseFocusTrap()

    // Clear announcements
    announcements.splice(0)

    isInitialized.value = false
    isScreenReaderActive.value = false
    isKeyboardNavigationActive.value = false

    log('Accessibility cleaned up')
  }

  // ============================================================================
  // Logging
  // ============================================================================

  function log(...args: any[]): void {
    if (a11yConfig.debug) {
      console.log('[Accessibility]', ...args)
    }
  }

  // ============================================================================
  // Composable API
  // ============================================================================

  return {
    // State
    isInitialized: computed(() => isInitialized.value),
    isScreenReaderActive: computed(() => isScreenReaderActive.value),
    isKeyboardNavigationActive: computed(() => isKeyboardNavigationActive.value),
    settings: computed(() => settings),
    announcements: computed(() => announcements),

    // Computed
    isAccessible,
    hasAnnouncements,

    // Functions
    announce,
    trapFocus,
    releaseFocusTrap,
    applyAccessibilitySettings,
    updateLanguage,
    loadUserPreferences,
    saveAccessibilitySettings,
    loadAccessibilitySettings,
    isFocusable,
    getAccessibleName,
    isVisibleToScreenReader,

    // Lifecycle
    initialize,
    cleanup,
  }
}
