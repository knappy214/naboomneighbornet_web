import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

// Accessibility types
export interface AccessibilityConfig {
  enableScreenReader: boolean
  enableKeyboardNavigation: boolean
  enableHighContrast: boolean
  enableReducedMotion: boolean
  enableFocusIndicators: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  colorScheme: 'light' | 'dark' | 'auto'
  language: string
  announceChanges: boolean
}

export interface AccessibilityViolation {
  id: string
  type:
    | 'missing-label'
    | 'missing-alt'
    | 'missing-heading'
    | 'color-contrast'
    | 'keyboard-navigation'
    | 'focus-management'
  severity: 'low' | 'medium' | 'high' | 'critical'
  element: string
  message: string
  suggestion: string
  timestamp: Date
}

export interface AccessibilityAudit {
  totalViolations: number
  criticalViolations: number
  highViolations: number
  mediumViolations: number
  lowViolations: number
  violations: AccessibilityViolation[]
  score: number
  recommendations: string[]
}

// Accessibility state
const config = ref<AccessibilityConfig>({
  enableScreenReader: true,
  enableKeyboardNavigation: true,
  enableHighContrast: false,
  enableReducedMotion: false,
  enableFocusIndicators: true,
  fontSize: 'medium',
  colorScheme: 'auto',
  language: 'en',
  announceChanges: true,
})

const violations = ref<AccessibilityViolation[]>([])
const isAuditing = ref(false)
const currentFocus = ref<HTMLElement | null>(null)
const focusHistory = ref<HTMLElement[]>([])

export function useAccessibility() {
  const { t, locale } = useI18n()

  // Computed properties
  const hasViolations = computed(() => violations.value.length > 0)
  const criticalViolations = computed(() =>
    violations.value.filter((v) => v.severity === 'critical'),
  )
  const highViolations = computed(() => violations.value.filter((v) => v.severity === 'high'))
  const mediumViolations = computed(() => violations.value.filter((v) => v.severity === 'medium'))
  const lowViolations = computed(() => violations.value.filter((v) => v.severity === 'low'))

  const accessibilityScore = computed(() => {
    if (violations.value.length === 0) return 100

    const criticalWeight = criticalViolations.value.length * 10
    const highWeight = highViolations.value.length * 5
    const mediumWeight = mediumViolations.value.length * 2
    const lowWeight = lowViolations.value.length * 1

    const totalWeight = criticalWeight + highWeight + mediumWeight + lowWeight
    return Math.max(0, 100 - totalWeight)
  })

  // Initialize accessibility
  function initializeAccessibility() {
    loadConfig()
    setupKeyboardNavigation()
    setupScreenReaderSupport()
    setupFocusManagement()
    setupColorContrast()
    setupReducedMotion()
    setupFontSize()
  }

  // Load configuration from localStorage
  function loadConfig() {
    const saved = localStorage.getItem('accessibility_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        config.value = { ...config.value, ...parsed }
      } catch (error) {
        console.warn('Failed to load accessibility config:', error)
      }
    }
  }

  // Save configuration to localStorage
  function saveConfig() {
    localStorage.setItem('accessibility_config', JSON.stringify(config.value))
  }

  // Update configuration
  function updateConfig(updates: Partial<AccessibilityConfig>) {
    config.value = { ...config.value, ...updates }
    saveConfig()
    applyConfig()
  }

  // Apply configuration changes
  function applyConfig() {
    applyFontSize()
    applyColorScheme()
    applyReducedMotion()
    applyHighContrast()
    applyFocusIndicators()
  }

  // Font size management
  function applyFontSize() {
    const root = document.documentElement
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px',
    }

    root.style.fontSize = sizeMap[config.value.fontSize]
  }

  // Color scheme management
  function applyColorScheme() {
    const root = document.documentElement

    if (config.value.colorScheme === 'auto') {
      root.removeAttribute('data-color-scheme')
    } else {
      root.setAttribute('data-color-scheme', config.value.colorScheme)
    }
  }

  // Reduced motion management
  function applyReducedMotion() {
    const root = document.documentElement

    if (config.value.enableReducedMotion) {
      root.style.setProperty('--motion-duration', '0s')
      root.style.setProperty('--motion-delay', '0s')
    } else {
      root.style.removeProperty('--motion-duration')
      root.style.removeProperty('--motion-delay')
    }
  }

  // High contrast management
  function applyHighContrast() {
    const root = document.documentElement

    if (config.value.enableHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
  }

  // Focus indicators management
  function applyFocusIndicators() {
    const root = document.documentElement

    if (config.value.enableFocusIndicators) {
      root.classList.add('focus-indicators')
    } else {
      root.classList.remove('focus-indicators')
    }
  }

  // Keyboard navigation setup
  function setupKeyboardNavigation() {
    if (!config.value.enableKeyboardNavigation) return

    document.addEventListener('keydown', handleKeyboardNavigation)
  }

  function handleKeyboardNavigation(event: KeyboardEvent) {
    // Skip if user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return
    }

    switch (event.key) {
      case 'Tab':
        handleTabNavigation(event)
        break
      case 'Escape':
        handleEscapeKey(event)
        break
      case 'Enter':
      case ' ':
        handleActivationKey(event)
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        handleArrowNavigation(event)
        break
    }
  }

  function handleTabNavigation(event: KeyboardEvent) {
    const focusableElements = getFocusableElements()
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

    if (event.shiftKey) {
      // Shift + Tab: move backwards
      if (currentIndex > 0) {
        focusableElements[currentIndex - 1].focus()
      } else {
        focusableElements[focusableElements.length - 1].focus()
      }
    } else {
      // Tab: move forwards
      if (currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus()
      } else {
        focusableElements[0].focus()
      }
    }

    event.preventDefault()
  }

  function handleEscapeKey(event: KeyboardEvent) {
    // Close any open modals, dropdowns, or menus
    const modals = document.querySelectorAll('.modal[open]')
    modals.forEach((modal) => {
      const closeButton = modal.querySelector('[data-modal-close]') as HTMLElement
      if (closeButton) {
        closeButton.click()
      }
    })
  }

  function handleActivationKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    if (target && (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button')) {
      target.click()
    }
  }

  function handleArrowNavigation(event: KeyboardEvent) {
    // Implement arrow key navigation for custom components
    const target = event.target as HTMLElement
    const parent = target.closest('[role="menu"], [role="tablist"], [role="radiogroup"]')

    if (parent) {
      const items = Array.from(
        parent.querySelectorAll('[role="menuitem"], [role="tab"], [role="radio"]'),
      )
      const currentIndex = items.indexOf(target)

      let nextIndex = currentIndex
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
          break
        case 'ArrowDown':
        case 'ArrowRight':
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
          break
      }

      if (nextIndex !== currentIndex) {
        ;(items[nextIndex] as HTMLElement).focus()
        event.preventDefault()
      }
    }
  }

  // Screen reader support
  function setupScreenReaderSupport() {
    if (!config.value.enableScreenReader) return

    // Create live region for announcements
    createLiveRegion()

    // Monitor DOM changes for announcements
    setupChangeAnnouncements()
  }

  function createLiveRegion() {
    let liveRegion = document.getElementById('accessibility-live-region')
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'accessibility-live-region'
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

  function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!config.value.announceChanges) return

    const liveRegion = document.getElementById('accessibility-live-region')
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.textContent = message

      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }

  function setupChangeAnnouncements() {
    // Monitor for important changes that should be announced
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement
              if (element.hasAttribute('aria-live') || element.classList.contains('announce')) {
                const message = element.textContent || element.getAttribute('aria-label')
                if (message) {
                  announceToScreenReader(message)
                }
              }
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  // Focus management
  function setupFocusManagement() {
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
  }

  function handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement
    currentFocus.value = target
    focusHistory.value.push(target)

    // Keep only last 10 focus elements
    if (focusHistory.value.length > 10) {
      focusHistory.value = focusHistory.value.slice(-10)
    }
  }

  function handleFocusOut(event: FocusEvent) {
    // Focus management logic
  }

  // Focus utilities
  function focusElement(selector: string) {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      currentFocus.value = element
    }
  }

  function focusFirstFocusable() {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }

  function focusLastFocusable() {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus()
    }
  }

  function trapFocus(container: HTMLElement) {
    const focusableElements = getFocusableElements(container)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            event.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            event.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  function getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="radio"]',
      '[role="checkbox"]',
    ]

    const elements = container.querySelectorAll(focusableSelectors.join(', '))
    return Array.from(elements) as HTMLElement[]
  }

  // Color contrast checking
  function setupColorContrast() {
    if (!config.value.enableHighContrast) return

    // Add high contrast styles
    const style = document.createElement('style')
    style.textContent = `
      .high-contrast {
        --color-primary: #000000;
        --color-secondary: #000000;
        --color-accent: #000000;
        --color-neutral: #000000;
        --color-base-100: #ffffff;
        --color-base-200: #f0f0f0;
        --color-base-300: #e0e0e0;
        --color-base-content: #000000;
        --color-info: #0000ff;
        --color-success: #008000;
        --color-warning: #ff8000;
        --color-error: #ff0000;
      }

      .high-contrast * {
        border-color: currentColor !important;
      }

      .high-contrast button,
      .high-contrast input,
      .high-contrast select,
      .high-contrast textarea {
        border: 2px solid currentColor !important;
      }
    `
    document.head.appendChild(style)
  }

  // Accessibility audit
  function startAudit() {
    isAuditing.value = true
    violations.value = []

    // Run various accessibility checks
    checkMissingLabels()
    checkMissingAltText()
    checkMissingHeadings()
    checkColorContrast()
    checkKeyboardNavigation()
    checkFocusManagement()

    isAuditing.value = false
  }

  function checkMissingLabels() {
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea')

    inputs.forEach((input) => {
      const element = input as HTMLElement
      const id = element.getAttribute('id')
      const ariaLabel = element.getAttribute('aria-label')
      const ariaLabelledBy = element.getAttribute('aria-labelledby')

      if (!id && !ariaLabel && !ariaLabelledBy) {
        const label = document.querySelector(`label[for="${id}"]`)
        if (!label) {
          addViolation({
            type: 'missing-label',
            severity: 'high',
            element: element.tagName.toLowerCase(),
            message: 'Form element missing accessible label',
            suggestion: 'Add aria-label, aria-labelledby, or associate with a label element',
          })
        }
      }
    })
  }

  function checkMissingAltText() {
    const images = document.querySelectorAll('img')

    images.forEach((img) => {
      const element = img as HTMLImageElement
      const alt = element.getAttribute('alt')
      const role = element.getAttribute('role')

      if (!alt && role !== 'presentation') {
        addViolation({
          type: 'missing-alt',
          severity: 'high',
          element: 'img',
          message: 'Image missing alt text',
          suggestion: 'Add descriptive alt text or role="presentation" for decorative images',
        })
      }
    })
  }

  function checkMissingHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const headingLevels = Array.from(headings).map((h) => parseInt(h.tagName.charAt(1)))

    if (headingLevels.length === 0) {
      addViolation({
        type: 'missing-heading',
        severity: 'medium',
        element: 'page',
        message: 'Page missing heading structure',
        suggestion: 'Add heading elements to create a logical document structure',
      })
    } else if (!headingLevels.includes(1)) {
      addViolation({
        type: 'missing-heading',
        severity: 'high',
        element: 'page',
        message: 'Page missing h1 heading',
        suggestion: 'Add an h1 element to identify the main content',
      })
    }
  }

  function checkColorContrast() {
    // This is a simplified check - in a real implementation, you'd use a proper contrast checking library
    const elements = document.querySelectorAll('*')

    elements.forEach((element) => {
      const htmlElement = element as HTMLElement
      const computedStyle = window.getComputedStyle(htmlElement)
      const color = computedStyle.color
      const backgroundColor = computedStyle.backgroundColor

      // Basic contrast check (simplified)
      if (color && backgroundColor && color !== backgroundColor) {
        // In a real implementation, you'd calculate the actual contrast ratio
        // For now, we'll just check if colors are different
      }
    })
  }

  function checkKeyboardNavigation() {
    const focusableElements = getFocusableElements()

    focusableElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex')
      if (tabIndex === '-1' && !element.hasAttribute('aria-hidden')) {
        addViolation({
          type: 'keyboard-navigation',
          severity: 'medium',
          element: element.tagName.toLowerCase(),
          message: 'Element not keyboard accessible',
          suggestion: 'Remove tabindex="-1" or add proper keyboard navigation',
        })
      }
    })
  }

  function checkFocusManagement() {
    // Check for focus traps and proper focus management
    const modals = document.querySelectorAll('.modal, [role="dialog"]')

    modals.forEach((modal) => {
      const focusableElements = getFocusableElements(modal as HTMLElement)
      if (focusableElements.length === 0) {
        addViolation({
          type: 'focus-management',
          severity: 'high',
          element: 'modal',
          message: 'Modal missing focusable elements',
          suggestion: 'Add focusable elements or ensure proper focus management',
        })
      }
    })
  }

  function addViolation(violation: Omit<AccessibilityViolation, 'id' | 'timestamp'>) {
    const newViolation: AccessibilityViolation = {
      ...violation,
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    violations.value.push(newViolation)
  }

  // Generate accessibility audit report
  function generateAuditReport(): AccessibilityAudit {
    const totalViolations = violations.value.length
    const criticalViolations = criticalViolations.value.length
    const highViolations = highViolations.value.length
    const mediumViolations = mediumViolations.value.length
    const lowViolations = lowViolations.value.length

    const recommendations: string[] = []

    if (criticalViolations > 0) {
      recommendations.push('Fix critical accessibility violations immediately')
    }
    if (highViolations > 0) {
      recommendations.push('Address high-priority accessibility issues')
    }
    if (mediumViolations > 0) {
      recommendations.push('Improve medium-priority accessibility issues')
    }
    if (lowViolations > 0) {
      recommendations.push('Consider addressing low-priority accessibility issues')
    }

    if (totalViolations === 0) {
      recommendations.push('Great job! No accessibility violations found')
    }

    return {
      totalViolations,
      criticalViolations,
      highViolations,
      mediumViolations,
      lowViolations,
      violations: violations.value,
      score: accessibilityScore.value,
      recommendations,
    }
  }

  // Clear violations
  function clearViolations() {
    violations.value = []
  }

  // Lifecycle
  onMounted(() => {
    initializeAccessibility()
  })

  onUnmounted(() => {
    // Cleanup if needed
  })

  return {
    // State
    config,
    violations,
    isAuditing,
    currentFocus,
    focusHistory,
    hasViolations,
    criticalViolations,
    highViolations,
    mediumViolations,
    lowViolations,
    accessibilityScore,

    // Methods
    updateConfig,
    announceToScreenReader,
    focusElement,
    focusFirstFocusable,
    focusLastFocusable,
    trapFocus,
    getFocusableElements,
    startAudit,
    generateAuditReport,
    clearViolations,
  }
}
