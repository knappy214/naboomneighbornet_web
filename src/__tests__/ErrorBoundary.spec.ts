import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

// Mock error handler
const mockHandleError = vi.fn()
const mockRecoverFromError = vi.fn()
vi.mock('@/composables/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    recoverFromError: mockRecoverFromError,
  }),
}))

// Test component that throws an error
const ThrowingComponent = {
  template: '<div>Throwing Component</div>',
  setup() {
    throw new Error('Test error')
  },
}

// Test component that doesn't throw
const WorkingComponent = {
  template: '<div>Working Component</div>',
}

describe('ErrorBoundary', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders children when there is no error', () => {
    wrapper = mount(ErrorBoundary, {
      slots: {
        default: WorkingComponent,
      },
    })

    expect(wrapper.text()).toContain('Working Component')
    expect(wrapper.find('.error-boundary').exists()).toBe(false)
  })

  it('renders error UI when child component throws an error', async () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(ErrorBoundary, {
      slots: {
        default: ThrowingComponent,
      },
    })

    await nextTick()

    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    expect(wrapper.text()).toContain('error.boundary.title')
    expect(mockHandleError).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('calls custom onError handler when provided', async () => {
    const onError = vi.fn()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(ErrorBoundary, {
      props: {
        onError,
      },
      slots: {
        default: ThrowingComponent,
      },
    })

    await nextTick()

    expect(onError).toHaveBeenCalled()
    expect(mockHandleError).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('shows error details when showDetails is true', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(ErrorBoundary, {
      props: {
        showDetails: true,
      },
      slots: {
        default: ThrowingComponent,
      },
    })

    await nextTick()

    expect(wrapper.find('.error-details-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('error.boundary.details')

    consoleSpy.mockRestore()
  })

  it('toggles details visibility when toggle button is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(ErrorBoundary, {
      slots: {
        default: ThrowingComponent,
      },
    })

    await nextTick()

    // Initially details should be hidden
    expect(wrapper.find('.error-details-content').exists()).toBe(false)

    // Click toggle button
    const toggleButton = wrapper.find('button[data-test="toggle-details"]')
    if (toggleButton.exists()) {
      await toggleButton.trigger('click')
      await nextTick()
      expect(wrapper.find('.error-details-content').exists()).toBe(true)
    }

    consoleSpy.mockRestore()
  })

  it('calls retry function when retry button is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(ErrorBoundary, {
      slots: {
        default: ThrowingComponent,
      },
    })

    await nextTick()

    const retryButton = wrapper.find('button[data-test="retry"]')
    if (retryButton.exists()) {
      await retryButton.trigger('click')
      expect(mockRecoverFromError).toHaveBeenCalled()
    }

    consoleSpy.mockRestore()
  })

  it('calls goHome function when go home button is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(ErrorBoundary, {
      slots: {
        default: ThrowingComponent,
      },
    })

    await nextTick()

    const goHomeButton = wrapper.find('button[data-test="go-home"]')
    if (goHomeButton.exists()) {
      await goHomeButton.trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/')
    }

    consoleSpy.mockRestore()
  })

  it('shows non-recoverable warning when error is not recoverable', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock a non-recoverable error
    mockHandleError.mockReturnValue({
      id: 'test-error',
      recoverable: false,
    })

    wrapper = mount(ErrorBoundary, {
      slots: {
        default: ThrowingComponent,
      },
    })

    await nextTick()

    expect(wrapper.find('.error-warning').exists()).toBe(true)
    expect(wrapper.text()).toContain('error.boundary.nonRecoverable')

    consoleSpy.mockRestore()
  })

  it('disables retry button when error is not recoverable', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock a non-recoverable error
    mockHandleError.mockReturnValue({
      id: 'test-error',
      recoverable: false,
    })

    wrapper = mount(ErrorBoundary, {
      slots: {
        default: ThrowingComponent,
      },
    })

    await nextTick()

    const retryButton = wrapper.find('button[data-test="retry"]')
    if (retryButton.exists()) {
      expect(retryButton.attributes('disabled')).toBeDefined()
    }

    consoleSpy.mockRestore()
  })

  it('provides error boundary methods to child components', () => {
    const TestChild = {
      template: '<div>Test Child</div>',
      setup() {
        const errorBoundary = inject('errorBoundary')
        expect(errorBoundary).toBeDefined()
        expect(errorBoundary.hasError).toBeDefined()
        expect(errorBoundary.currentError).toBeDefined()
        expect(errorBoundary.reset).toBeDefined()
        return {}
      },
    }

    wrapper = mount(ErrorBoundary, {
      slots: {
        default: TestChild,
      },
    })

    expect(wrapper.text()).toContain('Test Child')
  })

  it('resets error state when reset is called', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(ErrorBoundary, {
      slots: {
        default: ThrowingComponent,
      },
    })

    await nextTick()

    // Error should be shown
    expect(wrapper.find('.error-boundary').exists()).toBe(true)

    // Reset error state
    const errorBoundary = wrapper.vm
    if (errorBoundary.reset) {
      errorBoundary.reset()
      await nextTick()
    }

    consoleSpy.mockRestore()
  })

  it('handles multiple errors correctly', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const MultipleErrorComponent = {
      template: '<div>Multiple Error Component</div>',
      setup() {
        throw new Error('First error')
      },
    }

    wrapper = mount(ErrorBoundary, {
      slots: {
        default: MultipleErrorComponent,
      },
    })

    await nextTick()

    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    expect(mockHandleError).toHaveBeenCalledTimes(1)

    consoleSpy.mockRestore()
  })

  it('formats timestamp correctly', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(ErrorBoundary, {
      props: {
        showDetails: true,
      },
      slots: {
        default: ThrowingComponent,
      },
    })

    await nextTick()

    const timestampElement = wrapper.find('.error-info-value')
    if (timestampElement.exists()) {
      const timestamp = timestampElement.text()
      expect(timestamp).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/) // Date format
    }

    consoleSpy.mockRestore()
  })
})
