import { ref, computed } from 'vue'
import { useLogging } from './useLogging'
import { useErrorHandler } from './useErrorHandler'

// E2E Testing types
export interface E2ETestScenario {
  id: string
  name: string
  description: string
  category:
    | 'authentication'
    | 'messaging'
    | 'events'
    | 'profile'
    | 'search'
    | 'offline'
    | 'multilingual'
    | 'navigation'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  duration?: number
  error?: string
  steps: E2ETestStep[]
  prerequisites?: string[]
  expectedOutcome: string
  tags: string[]
}

export interface E2ETestStep {
  id: string
  name: string
  type:
    | 'navigate'
    | 'click'
    | 'type'
    | 'wait'
    | 'assert'
    | 'upload'
    | 'download'
    | 'api'
    | 'websocket'
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  duration?: number
  error?: string
  selector?: string
  text?: string
  value?: string
  expected?: any
  actual?: any
  screenshot?: string
  data?: Record<string, any>
}

export interface E2ETestResult {
  scenarioId: string
  scenarioName: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  timestamp: Date
  steps: E2ETestStep[]
  error?: string
  screenshots: string[]
  metrics: {
    pageLoadTime: number
    interactionTime: number
    apiResponseTime: number
    memoryUsage: number
  }
  environment: {
    browser: string
    version: string
    platform: string
    viewport: { width: number; height: number }
  }
}

export interface E2ETestSuite {
  id: string
  name: string
  description: string
  scenarios: E2ETestScenario[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: Date
  endTime?: Date
  duration?: number
  results: E2ETestResult[]
}

// E2E Testing state
const testSuites = ref<E2ETestSuite[]>([])
const currentScenario = ref<E2ETestScenario | null>(null)
const isRunning = ref(false)
const testResults = ref<E2ETestResult[]>([])
const screenshots = ref<string[]>([])

// Default test scenarios
const DEFAULT_SCENARIOS: E2ETestScenario[] = [
  {
    id: 'user-registration-flow',
    name: 'User Registration Flow',
    description: 'Complete user registration process from start to finish',
    category: 'authentication',
    priority: 'critical',
    status: 'pending',
    steps: [
      {
        id: 'navigate-to-register',
        name: 'Navigate to registration page',
        type: 'navigate',
        status: 'pending',
        data: { url: '/register' },
      },
      {
        id: 'fill-registration-form',
        name: 'Fill registration form',
        type: 'type',
        status: 'pending',
        selector: 'input[name="email"]',
        value: 'test@example.com',
      },
      {
        id: 'fill-password',
        name: 'Enter password',
        type: 'type',
        status: 'pending',
        selector: 'input[name="password"]',
        value: 'password123',
      },
      {
        id: 'fill-confirm-password',
        name: 'Confirm password',
        type: 'type',
        status: 'pending',
        selector: 'input[name="confirmPassword"]',
        value: 'password123',
      },
      {
        id: 'submit-registration',
        name: 'Submit registration form',
        type: 'click',
        status: 'pending',
        selector: 'button[type="submit"]',
      },
      {
        id: 'verify-success',
        name: 'Verify registration success',
        type: 'assert',
        status: 'pending',
        expected: { message: 'Registration successful' },
      },
    ],
    expectedOutcome: 'User successfully registered and logged in',
    tags: ['auth', 'registration', 'critical'],
  },
  {
    id: 'user-login-flow',
    name: 'User Login Flow',
    description: 'Complete user login process',
    category: 'authentication',
    priority: 'critical',
    status: 'pending',
    steps: [
      {
        id: 'navigate-to-login',
        name: 'Navigate to login page',
        type: 'navigate',
        status: 'pending',
        data: { url: '/login' },
      },
      {
        id: 'fill-email',
        name: 'Enter email',
        type: 'type',
        status: 'pending',
        selector: 'input[name="email"]',
        value: 'test@example.com',
      },
      {
        id: 'fill-password',
        name: 'Enter password',
        type: 'type',
        status: 'pending',
        selector: 'input[name="password"]',
        value: 'password123',
      },
      {
        id: 'submit-login',
        name: 'Submit login form',
        type: 'click',
        status: 'pending',
        selector: 'button[type="submit"]',
      },
      {
        id: 'verify-dashboard',
        name: 'Verify dashboard access',
        type: 'assert',
        status: 'pending',
        expected: { url: '/dashboard' },
      },
    ],
    expectedOutcome: 'User successfully logged in and redirected to dashboard',
    tags: ['auth', 'login', 'critical'],
  },
  {
    id: 'community-messaging',
    name: 'Community Messaging',
    description: 'Send and receive messages in community channels',
    category: 'messaging',
    priority: 'high',
    status: 'pending',
    prerequisites: ['user-login-flow'],
    steps: [
      {
        id: 'navigate-to-hub',
        name: 'Navigate to community hub',
        type: 'navigate',
        status: 'pending',
        data: { url: '/hub' },
      },
      {
        id: 'select-channel',
        name: 'Select a channel',
        type: 'click',
        status: 'pending',
        selector: '[data-testid="channel-general"]',
      },
      {
        id: 'type-message',
        name: 'Type a message',
        type: 'type',
        status: 'pending',
        selector: '[data-testid="message-input"]',
        value: 'Hello community!',
      },
      {
        id: 'send-message',
        name: 'Send message',
        type: 'click',
        status: 'pending',
        selector: '[data-testid="send-button"]',
      },
      {
        id: 'verify-message-sent',
        name: 'Verify message appears',
        type: 'assert',
        status: 'pending',
        expected: { text: 'Hello community!' },
      },
      {
        id: 'verify-typing-indicator',
        name: 'Verify typing indicator',
        type: 'assert',
        status: 'pending',
        expected: { element: '[data-testid="typing-indicator"]' },
      },
    ],
    expectedOutcome: 'Message successfully sent and displayed in channel',
    tags: ['messaging', 'realtime', 'community'],
  },
  {
    id: 'event-creation',
    name: 'Event Creation',
    description: 'Create and manage community events',
    category: 'events',
    priority: 'high',
    status: 'pending',
    prerequisites: ['user-login-flow'],
    steps: [
      {
        id: 'navigate-to-events',
        name: 'Navigate to events page',
        type: 'navigate',
        status: 'pending',
        data: { url: '/events' },
      },
      {
        id: 'click-create-event',
        name: 'Click create event button',
        type: 'click',
        status: 'pending',
        selector: '[data-testid="create-event-button"]',
      },
      {
        id: 'fill-event-title',
        name: 'Fill event title',
        type: 'type',
        status: 'pending',
        selector: 'input[name="title"]',
        value: 'Community Meeting',
      },
      {
        id: 'fill-event-description',
        name: 'Fill event description',
        type: 'type',
        status: 'pending',
        selector: 'textarea[name="description"]',
        value: 'Monthly community meeting to discuss neighborhood safety',
      },
      {
        id: 'set-event-date',
        name: 'Set event date',
        type: 'type',
        status: 'pending',
        selector: 'input[name="date"]',
        value: '2024-12-25',
      },
      {
        id: 'set-event-time',
        name: 'Set event time',
        type: 'type',
        status: 'pending',
        selector: 'input[name="time"]',
        value: '19:00',
      },
      {
        id: 'submit-event',
        name: 'Submit event',
        type: 'click',
        status: 'pending',
        selector: 'button[type="submit"]',
      },
      {
        id: 'verify-event-created',
        name: 'Verify event created',
        type: 'assert',
        status: 'pending',
        expected: { text: 'Community Meeting' },
      },
    ],
    expectedOutcome: 'Event successfully created and visible in events list',
    tags: ['events', 'creation', 'community'],
  },
  {
    id: 'profile-management',
    name: 'Profile Management',
    description: 'Update user profile information',
    category: 'profile',
    priority: 'medium',
    status: 'pending',
    prerequisites: ['user-login-flow'],
    steps: [
      {
        id: 'navigate-to-profile',
        name: 'Navigate to profile page',
        type: 'navigate',
        status: 'pending',
        data: { url: '/profile' },
      },
      {
        id: 'click-edit-profile',
        name: 'Click edit profile button',
        type: 'click',
        status: 'pending',
        selector: '[data-testid="edit-profile-button"]',
      },
      {
        id: 'update-display-name',
        name: 'Update display name',
        type: 'type',
        status: 'pending',
        selector: 'input[name="displayName"]',
        value: 'John Doe',
      },
      {
        id: 'update-bio',
        name: 'Update bio',
        type: 'type',
        status: 'pending',
        selector: 'textarea[name="bio"]',
        value: 'Community safety advocate',
      },
      {
        id: 'upload-avatar',
        name: 'Upload avatar image',
        type: 'upload',
        status: 'pending',
        selector: 'input[type="file"]',
        data: { file: 'test-avatar.jpg' },
      },
      {
        id: 'save-profile',
        name: 'Save profile changes',
        type: 'click',
        status: 'pending',
        selector: 'button[type="submit"]',
      },
      {
        id: 'verify-profile-updated',
        name: 'Verify profile updated',
        type: 'assert',
        status: 'pending',
        expected: { text: 'John Doe' },
      },
    ],
    expectedOutcome: 'Profile successfully updated with new information',
    tags: ['profile', 'update', 'user'],
  },
  {
    id: 'message-search',
    name: 'Message Search',
    description: 'Search for messages in community channels',
    category: 'search',
    priority: 'medium',
    status: 'pending',
    prerequisites: ['user-login-flow', 'community-messaging'],
    steps: [
      {
        id: 'navigate-to-search',
        name: 'Navigate to search page',
        type: 'navigate',
        status: 'pending',
        data: { url: '/search' },
      },
      {
        id: 'enter-search-term',
        name: 'Enter search term',
        type: 'type',
        status: 'pending',
        selector: 'input[name="search"]',
        value: 'safety',
      },
      {
        id: 'click-search',
        name: 'Click search button',
        type: 'click',
        status: 'pending',
        selector: '[data-testid="search-button"]',
      },
      {
        id: 'wait-for-results',
        name: 'Wait for search results',
        type: 'wait',
        status: 'pending',
        data: { duration: 2000 },
      },
      {
        id: 'verify-search-results',
        name: 'Verify search results',
        type: 'assert',
        status: 'pending',
        expected: { minResults: 1 },
      },
      {
        id: 'click-search-result',
        name: 'Click on search result',
        type: 'click',
        status: 'pending',
        selector: '[data-testid="search-result-0"]',
      },
      {
        id: 'verify-message-context',
        name: 'Verify message context',
        type: 'assert',
        status: 'pending',
        expected: { text: 'safety' },
      },
    ],
    expectedOutcome: 'Search results displayed and user can navigate to specific messages',
    tags: ['search', 'messages', 'discovery'],
  },
  {
    id: 'offline-messaging',
    name: 'Offline Messaging',
    description: 'Test offline message queuing and synchronization',
    category: 'offline',
    priority: 'high',
    status: 'pending',
    prerequisites: ['user-login-flow'],
    steps: [
      {
        id: 'navigate-to-hub',
        name: 'Navigate to community hub',
        type: 'navigate',
        status: 'pending',
        data: { url: '/hub' },
      },
      {
        id: 'simulate-offline',
        name: 'Simulate offline mode',
        type: 'api',
        status: 'pending',
        data: { action: 'simulate-offline' },
      },
      {
        id: 'type-offline-message',
        name: 'Type message while offline',
        type: 'type',
        status: 'pending',
        selector: '[data-testid="message-input"]',
        value: 'This message was typed offline',
      },
      {
        id: 'send-offline-message',
        name: 'Send message while offline',
        type: 'click',
        status: 'pending',
        selector: '[data-testid="send-button"]',
      },
      {
        id: 'verify-offline-indicator',
        name: 'Verify offline indicator',
        type: 'assert',
        status: 'pending',
        expected: { element: '[data-testid="offline-indicator"]' },
      },
      {
        id: 'simulate-online',
        name: 'Simulate online mode',
        type: 'api',
        status: 'pending',
        data: { action: 'simulate-online' },
      },
      {
        id: 'verify-message-synced',
        name: 'Verify message synced',
        type: 'assert',
        status: 'pending',
        expected: { text: 'This message was typed offline' },
      },
    ],
    expectedOutcome: 'Message queued offline and synced when connection restored',
    tags: ['offline', 'sync', 'messaging'],
  },
  {
    id: 'multilingual-support',
    name: 'Multilingual Support',
    description: 'Test language switching and multilingual content',
    category: 'multilingual',
    priority: 'medium',
    status: 'pending',
    prerequisites: ['user-login-flow'],
    steps: [
      {
        id: 'navigate-to-settings',
        name: 'Navigate to settings',
        type: 'navigate',
        status: 'pending',
        data: { url: '/settings' },
      },
      {
        id: 'open-language-selector',
        name: 'Open language selector',
        type: 'click',
        status: 'pending',
        selector: '[data-testid="language-selector"]',
      },
      {
        id: 'select-afrikaans',
        name: 'Select Afrikaans language',
        type: 'click',
        status: 'pending',
        selector: '[data-value="af"]',
      },
      {
        id: 'verify-afrikaans-content',
        name: 'Verify Afrikaans content',
        type: 'assert',
        status: 'pending',
        expected: { text: 'Welkom' },
      },
      {
        id: 'navigate-to-hub-af',
        name: 'Navigate to hub in Afrikaans',
        type: 'navigate',
        status: 'pending',
        data: { url: '/hub' },
      },
      {
        id: 'verify-afrikaans-ui',
        name: 'Verify Afrikaans UI elements',
        type: 'assert',
        status: 'pending',
        expected: { text: 'Gemeenskap' },
      },
      {
        id: 'switch-back-to-english',
        name: 'Switch back to English',
        type: 'click',
        status: 'pending',
        selector: '[data-testid="language-selector"]',
      },
      {
        id: 'select-english',
        name: 'Select English language',
        type: 'click',
        status: 'pending',
        selector: '[data-value="en"]',
      },
      {
        id: 'verify-english-content',
        name: 'Verify English content',
        type: 'assert',
        status: 'pending',
        expected: { text: 'Welcome' },
      },
    ],
    expectedOutcome: 'Language switching works correctly and content is properly translated',
    tags: ['multilingual', 'i18n', 'localization'],
  },
]

export function useE2ETesting() {
  const { logSystemEvent, logError } = useLogging()
  const { handleError } = useErrorHandler()

  // Computed properties
  const totalScenarios = computed(() =>
    testSuites.value.reduce((sum, suite) => sum + suite.scenarios.length, 0),
  )

  const passedScenarios = computed(
    () => testResults.value.filter((result) => result.status === 'passed').length,
  )

  const failedScenarios = computed(
    () => testResults.value.filter((result) => result.status === 'failed').length,
  )

  const skippedScenarios = computed(
    () => testResults.value.filter((result) => result.status === 'skipped').length,
  )

  const successRate = computed(() => {
    if (testResults.value.length === 0) return 0
    return (passedScenarios.value / testResults.value.length) * 100
  })

  const runningScenarios = computed(
    () => testSuites.value.filter((suite) => suite.status === 'running').length,
  )

  // Initialize E2E testing
  function initializeE2ETesting() {
    // Create default test suite
    const defaultSuite: E2ETestSuite = {
      id: 'default-suite',
      name: 'Default E2E Test Suite',
      description: 'Default set of end-to-end test scenarios',
      scenarios: DEFAULT_SCENARIOS,
      status: 'pending',
      results: [],
    }

    testSuites.value.push(defaultSuite)
    logSystemEvent('E2E testing initialized')
  }

  // Create test suite
  function createTestSuite(suite: Omit<E2ETestSuite, 'id' | 'results'>): E2ETestSuite {
    const newSuite: E2ETestSuite = {
      ...suite,
      id: `suite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      results: [],
    }

    testSuites.value.push(newSuite)
    logSystemEvent(`Test suite created: ${newSuite.name}`)

    return newSuite
  }

  // Add scenario to suite
  function addScenarioToSuite(
    suiteId: string,
    scenario: Omit<E2ETestScenario, 'id' | 'status'>,
  ): E2ETestScenario {
    const suite = testSuites.value.find((s) => s.id === suiteId)
    if (!suite) {
      throw new Error(`Test suite not found: ${suiteId}`)
    }

    const newScenario: E2ETestScenario = {
      ...scenario,
      id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
    }

    suite.scenarios.push(newScenario)
    logSystemEvent(`Scenario added to suite: ${newScenario.name}`)

    return newScenario
  }

  // Run single scenario
  async function runScenario(scenarioId: string): Promise<E2ETestResult> {
    const scenario = findScenarioById(scenarioId)
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`)
    }

    currentScenario.value = scenario
    scenario.status = 'running'

    const startTime = performance.now()
    const result: E2ETestResult = {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      status: 'passed',
      duration: 0,
      timestamp: new Date(),
      steps: [],
      screenshots: [],
      metrics: {
        pageLoadTime: 0,
        interactionTime: 0,
        apiResponseTime: 0,
        memoryUsage: 0,
      },
      environment: {
        browser: 'chromium',
        version: '119.0',
        platform: 'linux',
        viewport: { width: 1280, height: 720 },
      },
    }

    try {
      logSystemEvent(`Starting scenario: ${scenario.name}`)

      // Execute scenario steps
      for (const step of scenario.steps) {
        const stepResult = await executeTestStep(step)
        result.steps.push(stepResult)

        if (stepResult.status === 'failed') {
          result.status = 'failed'
          result.error = stepResult.error
          break
        }
      }

      scenario.status = result.status
    } catch (error) {
      scenario.status = 'failed'
      result.status = 'failed'
      result.error = error instanceof Error ? error.message : String(error)
      logError(`Scenario failed: ${scenario.name}`, { error: result.error })
    } finally {
      result.duration = performance.now() - startTime
      testResults.value.push(result)
      currentScenario.value = null

      logSystemEvent(`Scenario completed: ${scenario.name}`, {
        status: result.status,
        duration: result.duration,
      })
    }

    return result
  }

  // Execute test step
  async function executeTestStep(step: E2ETestStep): Promise<E2ETestStep> {
    const startTime = performance.now()
    step.status = 'running'

    try {
      switch (step.type) {
        case 'navigate':
          await executeNavigateStep(step)
          break
        case 'click':
          await executeClickStep(step)
          break
        case 'type':
          await executeTypeStep(step)
          break
        case 'wait':
          await executeWaitStep(step)
          break
        case 'assert':
          await executeAssertStep(step)
          break
        case 'upload':
          await executeUploadStep(step)
          break
        case 'download':
          await executeDownloadStep(step)
          break
        case 'api':
          await executeApiStep(step)
          break
        case 'websocket':
          await executeWebSocketStep(step)
          break
        default:
          throw new Error(`Unknown step type: ${step.type}`)
      }

      step.status = 'passed'
    } catch (error) {
      step.status = 'failed'
      step.error = error instanceof Error ? error.message : String(error)
    } finally {
      step.duration = performance.now() - startTime
    }

    return step
  }

  // Execute navigate step
  async function executeNavigateStep(step: E2ETestStep): Promise<void> {
    const { url } = step.data || {}
    if (!url) {
      throw new Error('Navigate step missing URL')
    }

    logSystemEvent(`Navigating to: ${url}`)
    // In a real implementation, this would use Playwright's page.goto()
    // For now, we'll simulate the navigation
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Execute click step
  async function executeClickStep(step: E2ETestStep): Promise<void> {
    const { selector } = step
    if (!selector) {
      throw new Error('Click step missing selector')
    }

    logSystemEvent(`Clicking element: ${selector}`)
    // In a real implementation, this would use Playwright's page.click()
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  // Execute type step
  async function executeTypeStep(step: E2ETestStep): Promise<void> {
    const { selector, value } = step
    if (!selector || !value) {
      throw new Error('Type step missing selector or value')
    }

    logSystemEvent(`Typing in element: ${selector}`)
    // In a real implementation, this would use Playwright's page.fill()
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Execute wait step
  async function executeWaitStep(step: E2ETestStep): Promise<void> {
    const { duration = 1000 } = step.data || {}
    logSystemEvent(`Waiting: ${duration}ms`)
    await new Promise((resolve) => setTimeout(resolve, duration))
  }

  // Execute assert step
  async function executeAssertStep(step: E2ETestStep): Promise<void> {
    const { expected, selector, text } = step
    logSystemEvent(`Asserting: ${step.name}`)

    // In a real implementation, this would use Playwright's expect()
    // For now, we'll simulate the assertion
    if (expected && typeof expected === 'object') {
      if (expected.text && !text?.includes(expected.text)) {
        throw new Error(`Assertion failed: expected text "${expected.text}" not found`)
      }
      if (expected.url && !window.location.href.includes(expected.url)) {
        throw new Error(`Assertion failed: expected URL "${expected.url}" not found`)
      }
    }
  }

  // Execute upload step
  async function executeUploadStep(step: E2ETestStep): Promise<void> {
    const { selector, data } = step
    if (!selector || !data?.file) {
      throw new Error('Upload step missing selector or file data')
    }

    logSystemEvent(`Uploading file: ${data.file}`)
    // In a real implementation, this would use Playwright's page.setInputFiles()
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  // Execute download step
  async function executeDownloadStep(step: E2ETestStep): Promise<void> {
    const { selector } = step
    if (!selector) {
      throw new Error('Download step missing selector')
    }

    logSystemEvent(`Downloading from: ${selector}`)
    // In a real implementation, this would use Playwright's page.click() with download handling
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Execute API step
  async function executeApiStep(step: E2ETestStep): Promise<void> {
    const { data } = step
    if (!data?.action) {
      throw new Error('API step missing action')
    }

    logSystemEvent(`Executing API action: ${data.action}`)
    // In a real implementation, this would make actual API calls
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  // Execute WebSocket step
  async function executeWebSocketStep(step: E2ETestStep): Promise<void> {
    const { data } = step
    if (!data?.action) {
      throw new Error('WebSocket step missing action')
    }

    logSystemEvent(`Executing WebSocket action: ${data.action}`)
    // In a real implementation, this would handle WebSocket connections
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Run test suite
  async function runTestSuite(suiteId: string): Promise<E2ETestResult[]> {
    const suite = testSuites.value.find((s) => s.id === suiteId)
    if (!suite) {
      throw new Error(`Test suite not found: ${suiteId}`)
    }

    suite.status = 'running'
    suite.startTime = new Date()
    isRunning.value = true

    const results: E2ETestResult[] = []

    try {
      logSystemEvent(`Starting test suite: ${suite.name}`)

      // Run scenarios in sequence (in a real implementation, you might want parallel execution)
      for (const scenario of suite.scenarios) {
        if (scenario.status !== 'skipped') {
          const result = await runScenario(scenario.id)
          results.push(result)
        }
      }

      suite.status = 'completed'
    } catch (error) {
      suite.status = 'failed'
      logError(`Test suite failed: ${suite.name}`, {
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      suite.endTime = new Date()
      suite.duration = suite.endTime.getTime() - (suite.startTime?.getTime() || 0)
      suite.results = results
      isRunning.value = false

      logSystemEvent(`Test suite completed: ${suite.name}`, {
        status: suite.status,
        duration: suite.duration,
        results: results.length,
      })
    }

    return results
  }

  // Run all test suites
  async function runAllTestSuites(): Promise<E2ETestResult[]> {
    const allResults: E2ETestResult[] = []

    for (const suite of testSuites.value) {
      if (suite.status !== 'skipped') {
        const results = await runTestSuite(suite.id)
        allResults.push(...results)
      }
    }

    return allResults
  }

  // Find scenario by ID
  function findScenarioById(scenarioId: string): E2ETestScenario | null {
    for (const suite of testSuites.value) {
      const scenario = suite.scenarios.find((s) => s.id === scenarioId)
      if (scenario) return scenario
    }
    return null
  }

  // Get test results by status
  function getTestResultsByStatus(status: 'passed' | 'failed' | 'skipped'): E2ETestResult[] {
    return testResults.value.filter((result) => result.status === status)
  }

  // Get test results by category
  function getTestResultsByCategory(category: E2ETestScenario['category']): E2ETestResult[] {
    return testResults.value.filter((result) => {
      const scenario = findScenarioById(result.scenarioId)
      return scenario?.category === category
    })
  }

  // Generate test report
  function generateTestReport(): any {
    return {
      timestamp: new Date().toISOString(),
      totalScenarios: totalScenarios.value,
      passedScenarios: passedScenarios.value,
      failedScenarios: failedScenarios.value,
      skippedScenarios: skippedScenarios.value,
      successRate: successRate.value,
      testSuites: testSuites.value.map((suite) => ({
        id: suite.id,
        name: suite.name,
        status: suite.status,
        duration: suite.duration,
        scenarioCount: suite.scenarios.length,
        results: suite.results.length,
      })),
      results: testResults.value,
    }
  }

  // Clear test results
  function clearTestResults() {
    testResults.value = []
    testSuites.value.forEach((suite) => {
      suite.results = []
      suite.status = 'pending'
      suite.scenarios.forEach((scenario) => {
        scenario.status = 'pending'
        scenario.steps.forEach((step) => {
          step.status = 'pending'
          step.error = undefined
          step.duration = undefined
        })
      })
    })

    logSystemEvent('Test results cleared')
  }

  // Export test data
  function exportTestData(format: 'json' | 'csv' = 'json'): string {
    const report = generateTestReport()

    if (format === 'json') {
      return JSON.stringify(report, null, 2)
    } else {
      // CSV format
      const headers = ['scenarioId', 'scenarioName', 'status', 'duration', 'timestamp', 'error']
      const csvRows = [headers.join(',')]

      testResults.value.forEach((result) => {
        const row = [
          result.scenarioId,
          result.scenarioName,
          result.status,
          result.duration,
          result.timestamp.toISOString(),
          result.error || '',
        ]
        csvRows.push(row.join(','))
      })

      return csvRows.join('\n')
    }
  }

  return {
    // State
    testSuites,
    currentScenario,
    isRunning,
    testResults,
    screenshots,
    totalScenarios,
    passedScenarios,
    failedScenarios,
    skippedScenarios,
    successRate,
    runningScenarios,

    // Methods
    initializeE2ETesting,
    createTestSuite,
    addScenarioToSuite,
    runScenario,
    runTestSuite,
    runAllTestSuites,
    findScenarioById,
    getTestResultsByStatus,
    getTestResultsByCategory,
    generateTestReport,
    clearTestResults,
    exportTestData,
  }
}
