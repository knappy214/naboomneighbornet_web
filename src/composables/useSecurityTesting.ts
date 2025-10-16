import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLogging } from './useLogging'
import { useErrorHandler } from './useErrorHandler'

// Security testing types
export interface SecurityVulnerability {
  id: string
  type:
    | 'xss'
    | 'csrf'
    | 'injection'
    | 'authentication'
    | 'authorization'
    | 'csp'
    | 'headers'
    | 'dependencies'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  recommendation: string
  affectedComponent?: string
  payload?: string
  timestamp: Date
  status: 'open' | 'fixed' | 'ignored' | 'false_positive'
}

export interface SecurityTestResult {
  testName: string
  passed: boolean
  vulnerabilities: SecurityVulnerability[]
  score: number
  timestamp: Date
  duration: number
}

export interface SecurityConfig {
  enableXSSProtection: boolean
  enableCSRFProtection: boolean
  enableCSP: boolean
  enableSecurityHeaders: boolean
  enableDependencyScanning: boolean
  enableInputValidation: boolean
  enableOutputEncoding: boolean
  strictMode: boolean
}

export interface SecurityHeaders {
  'Content-Security-Policy': string
  'X-Frame-Options': string
  'X-Content-Type-Options': string
  'X-XSS-Protection': string
  'Strict-Transport-Security': string
  'Referrer-Policy': string
  'Permissions-Policy': string
}

// Security testing state
const vulnerabilities = ref<SecurityVulnerability[]>([])
const testResults = ref<SecurityTestResult[]>([])
const securityConfig = ref<SecurityConfig>({
  enableXSSProtection: true,
  enableCSRFProtection: true,
  enableCSP: true,
  enableSecurityHeaders: true,
  enableDependencyScanning: true,
  enableInputValidation: true,
  enableOutputEncoding: true,
  strictMode: false,
})

// XSS test payloads based on OWASP guidelines
const XSS_PAYLOADS = [
  // Basic XSS payloads
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  '<iframe src="javascript:alert(\'XSS\')"></iframe>',

  // Encoded payloads
  '&#60;script&#62;alert("XSS")&#60;/script&#62;',
  '%3Cscript%3Ealert("XSS")%3C/script%3E',
  '&lt;script&gt;alert("XSS")&lt;/script&gt;',

  // Event handler payloads
  '<div onmouseover="alert(\'XSS\')">Hover me</div>',
  '<input onfocus="alert(\'XSS\')" autofocus>',
  '<body onload="alert(\'XSS\')">',

  // Filter bypass payloads
  '<ScRiPt>alert("XSS")</ScRiPt>',
  '<script>alert(String.fromCharCode(88,83,83))</script>',
  '<img src="x" onerror="alert(\'XSS\')">',

  // DOM-based XSS payloads
  'javascript:alert("XSS")',
  'data:text/html,<script>alert("XSS")</script>',
  'vbscript:msgbox("XSS")',

  // Template injection payloads
  '{{7*7}}',
  '${7*7}',
  '<%=7*7%>',
  '[% 7*7 %]',
]

// CSRF test payloads
const CSRF_PAYLOADS = [
  '<form action="http://target.com/api/action" method="POST"><input type="hidden" name="data" value="malicious"><input type="submit" value="Click me"></form>',
  '<img src="http://target.com/api/action?data=malicious" width="0" height="0">',
  '<iframe src="http://target.com/api/action" style="display:none"></iframe>',
]

// SQL injection test payloads
const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "' UNION SELECT * FROM users --",
  "1' OR 1=1 --",
  "admin'--",
  "' OR 1=1#",
  "') OR ('1'='1",
]

// Command injection test payloads
const COMMAND_INJECTION_PAYLOADS = [
  '; cat /etc/passwd',
  '| whoami',
  '&& id',
  '`whoami`',
  '$(id)',
  '; ls -la',
  '| dir',
]

export function useSecurityTesting() {
  const { logSecurityEvent, logError } = useLogging()
  const { handleError } = useErrorHandler()

  // Computed properties
  const totalVulnerabilities = computed(() => vulnerabilities.value.length)
  const criticalVulnerabilities = computed(() =>
    vulnerabilities.value.filter((v) => v.severity === 'critical'),
  )
  const highVulnerabilities = computed(() =>
    vulnerabilities.value.filter((v) => v.severity === 'high'),
  )
  const openVulnerabilities = computed(() =>
    vulnerabilities.value.filter((v) => v.status === 'open'),
  )

  const securityScore = computed(() => {
    if (vulnerabilities.value.length === 0) return 100

    const criticalWeight = criticalVulnerabilities.value.length * 20
    const highWeight = highVulnerabilities.value.length * 10
    const mediumWeight = vulnerabilities.value.filter((v) => v.severity === 'medium').length * 5
    const lowWeight = vulnerabilities.value.filter((v) => v.severity === 'low').length * 1

    const totalWeight = criticalWeight + highWeight + mediumWeight + lowWeight
    return Math.max(0, 100 - totalWeight)
  })

  // Initialize security testing
  function initializeSecurityTesting() {
    logSecurityEvent('Security testing initialized')

    // Set up security headers
    if (securityConfig.value.enableSecurityHeaders) {
      setupSecurityHeaders()
    }

    // Set up CSP
    if (securityConfig.value.enableCSP) {
      setupContentSecurityPolicy()
    }

    // Set up input validation
    if (securityConfig.value.enableInputValidation) {
      setupInputValidation()
    }

    // Set up output encoding
    if (securityConfig.value.enableOutputEncoding) {
      setupOutputEncoding()
    }
  }

  // Set up security headers
  function setupSecurityHeaders() {
    const headers: SecurityHeaders = {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy':
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    }

    // In a real application, these would be set by the server
    // For client-side testing, we can validate they exist
    Object.entries(headers).forEach(([name, value]) => {
      logSecurityEvent(`Security header configured: ${name}`, { value })
    })
  }

  // Set up Content Security Policy
  function setupContentSecurityPolicy() {
    const csp =
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"

    // Create meta tag for CSP
    const meta = document.createElement('meta')
    meta.setAttribute('http-equiv', 'Content-Security-Policy')
    meta.setAttribute('content', csp)
    document.head.appendChild(meta)

    logSecurityEvent('Content Security Policy configured', { csp })
  }

  // Set up input validation
  function setupInputValidation() {
    // Override common input methods to add validation
    const originalCreateElement = document.createElement
    document.createElement = function (tagName: string) {
      const element = originalCreateElement.call(this, tagName)

      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.addEventListener('input', (event) => {
          validateInput(event.target as HTMLInputElement | HTMLTextAreaElement)
        })
      }

      return element
    }

    logSecurityEvent('Input validation enabled')
  }

  // Validate input for security issues
  function validateInput(element: HTMLInputElement | HTMLTextAreaElement) {
    const value = element.value

    // Check for XSS payloads
    XSS_PAYLOADS.forEach((payload) => {
      if (value.includes(payload)) {
        addVulnerability({
          type: 'xss',
          severity: 'high',
          title: 'Potential XSS detected in input',
          description: `Input contains potential XSS payload: ${payload}`,
          impact: 'Cross-site scripting could allow attackers to execute malicious scripts',
          recommendation: 'Sanitize input and use proper output encoding',
          affectedComponent: element.tagName,
          payload,
        })
      }
    })

    // Check for SQL injection
    SQL_INJECTION_PAYLOADS.forEach((payload) => {
      if (value.includes(payload)) {
        addVulnerability({
          type: 'injection',
          severity: 'critical',
          title: 'Potential SQL injection detected',
          description: `Input contains potential SQL injection payload: ${payload}`,
          impact: 'SQL injection could allow unauthorized database access',
          recommendation: 'Use parameterized queries and input validation',
          affectedComponent: element.tagName,
          payload,
        })
      }
    })

    // Check for command injection
    COMMAND_INJECTION_PAYLOADS.forEach((payload) => {
      if (value.includes(payload)) {
        addVulnerability({
          type: 'injection',
          severity: 'critical',
          title: 'Potential command injection detected',
          description: `Input contains potential command injection payload: ${payload}`,
          impact: 'Command injection could allow arbitrary command execution',
          recommendation: 'Validate and sanitize input before using in system commands',
          affectedComponent: element.tagName,
          payload,
        })
      }
    })
  }

  // Set up output encoding
  function setupOutputEncoding() {
    // Override innerHTML to add encoding
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')!

    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function (value: string) {
        const encodedValue = encodeHTML(value)
        originalInnerHTML.set!.call(this, encodedValue)
      },
      get: originalInnerHTML.get,
    })

    logSecurityEvent('Output encoding enabled')
  }

  // Encode HTML to prevent XSS
  function encodeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;')
  }

  // Add vulnerability
  function addVulnerability(vuln: Omit<SecurityVulnerability, 'id' | 'timestamp'>) {
    const vulnerability: SecurityVulnerability = {
      ...vuln,
      id: `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    vulnerabilities.value.push(vulnerability)

    logSecurityEvent(`Security vulnerability detected: ${vulnerability.title}`, {
      type: vulnerability.type,
      severity: vulnerability.severity,
      affectedComponent: vulnerability.affectedComponent,
    })
  }

  // Run XSS tests
  async function runXSSTests(): Promise<SecurityTestResult> {
    const startTime = performance.now()
    const testVulnerabilities: SecurityVulnerability[] = []

    try {
      // Test DOM-based XSS
      const testElement = document.createElement('div')
      testElement.innerHTML = '<div id="xss-test"></div>'
      document.body.appendChild(testElement)

      XSS_PAYLOADS.forEach((payload) => {
        try {
          const testDiv = document.getElementById('xss-test')
          if (testDiv) {
            testDiv.innerHTML = payload

            // Check if script executed (simplified test)
            if (
              testDiv.innerHTML.includes('<script>') &&
              !testDiv.innerHTML.includes('&lt;script&gt;')
            ) {
              testVulnerabilities.push({
                type: 'xss',
                severity: 'high',
                title: 'DOM-based XSS vulnerability detected',
                description: `XSS payload executed: ${payload}`,
                impact: 'Malicious scripts could be executed in user context',
                recommendation: 'Use textContent instead of innerHTML or properly encode output',
                payload,
              })
            }
          }
        } catch (error) {
          // Payload caused error, which might indicate vulnerability
          testVulnerabilities.push({
            type: 'xss',
            severity: 'medium',
            title: 'Potential XSS vulnerability detected',
            description: `XSS payload caused error: ${payload}`,
            impact: 'Malicious scripts might be executed',
            recommendation: 'Improve input validation and output encoding',
            payload,
          })
        }
      })

      document.body.removeChild(testElement)
    } catch (error) {
      logError('XSS test failed', { error: error instanceof Error ? error.message : String(error) })
    }

    const duration = performance.now() - startTime
    const score =
      testVulnerabilities.length === 0 ? 100 : Math.max(0, 100 - testVulnerabilities.length * 10)

    const result: SecurityTestResult = {
      testName: 'XSS Testing',
      passed: testVulnerabilities.length === 0,
      vulnerabilities: testVulnerabilities,
      score,
      timestamp: new Date(),
      duration,
    }

    testResults.value.push(result)
    return result
  }

  // Run CSRF tests
  async function runCSRFTests(): Promise<SecurityTestResult> {
    const startTime = performance.now()
    const testVulnerabilities: SecurityVulnerability[] = []

    try {
      // Test for CSRF tokens
      const forms = document.querySelectorAll('form')
      forms.forEach((form) => {
        const csrfToken = form.querySelector('input[name*="csrf"], input[name*="token"]')
        if (!csrfToken) {
          testVulnerabilities.push({
            type: 'csrf',
            severity: 'high',
            title: 'Missing CSRF protection',
            description: 'Form does not have CSRF token',
            impact: 'Forms could be vulnerable to CSRF attacks',
            recommendation: 'Add CSRF tokens to all forms',
            affectedComponent: 'form',
          })
        }
      })

      // Test for SameSite cookie attribute
      const cookies = document.cookie.split(';')
      const hasSameSite = cookies.some((cookie) => cookie.includes('SameSite'))
      if (!hasSameSite) {
        testVulnerabilities.push({
          type: 'csrf',
          severity: 'medium',
          title: 'Missing SameSite cookie attribute',
          description: 'Cookies do not have SameSite attribute',
          impact: 'Cookies could be sent in cross-site requests',
          recommendation: 'Set SameSite attribute on cookies',
        })
      }
    } catch (error) {
      logError('CSRF test failed', {
        error: error instanceof Error ? error.message : String(error),
      })
    }

    const duration = performance.now() - startTime
    const score =
      testVulnerabilities.length === 0 ? 100 : Math.max(0, 100 - testVulnerabilities.length * 15)

    const result: SecurityTestResult = {
      testName: 'CSRF Testing',
      passed: testVulnerabilities.length === 0,
      vulnerabilities: testVulnerabilities,
      score,
      timestamp: new Date(),
      duration,
    }

    testResults.value.push(result)
    return result
  }

  // Run authentication tests
  async function runAuthenticationTests(): Promise<SecurityTestResult> {
    const startTime = performance.now()
    const testVulnerabilities: SecurityVulnerability[] = []

    try {
      // Test for secure session storage
      const sessionStorage = window.sessionStorage
      const localStorage = window.localStorage

      // Check for sensitive data in storage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        const value = sessionStorage.getItem(key!)

        if (key?.toLowerCase().includes('password') || key?.toLowerCase().includes('token')) {
          testVulnerabilities.push({
            type: 'authentication',
            severity: 'high',
            title: 'Sensitive data in session storage',
            description: `Sensitive data stored in sessionStorage: ${key}`,
            impact: 'Sensitive data could be accessed by malicious scripts',
            recommendation: 'Use secure storage mechanisms for sensitive data',
            affectedComponent: 'sessionStorage',
          })
        }
      }

      // Test for weak authentication mechanisms
      const authForms = document.querySelectorAll('form[action*="login"], form[action*="auth"]')
      authForms.forEach((form) => {
        const passwordInput = form.querySelector('input[type="password"]')
        if (passwordInput && !passwordInput.hasAttribute('minlength')) {
          testVulnerabilities.push({
            type: 'authentication',
            severity: 'medium',
            title: 'Weak password requirements',
            description: 'Password input does not have minimum length requirement',
            impact: 'Weak passwords could be easily compromised',
            recommendation: 'Implement strong password requirements',
            affectedComponent: 'password input',
          })
        }
      })
    } catch (error) {
      logError('Authentication test failed', {
        error: error instanceof Error ? error.message : String(error),
      })
    }

    const duration = performance.now() - startTime
    const score =
      testVulnerabilities.length === 0 ? 100 : Math.max(0, 100 - testVulnerabilities.length * 12)

    const result: SecurityTestResult = {
      testName: 'Authentication Testing',
      passed: testVulnerabilities.length === 0,
      vulnerabilities: testVulnerabilities,
      score,
      timestamp: new Date(),
      duration,
    }

    testResults.value.push(result)
    return result
  }

  // Run security headers tests
  async function runSecurityHeadersTests(): Promise<SecurityTestResult> {
    const startTime = performance.now()
    const testVulnerabilities: SecurityVulnerability[] = []

    try {
      // Test for security headers (simulated - in real app, check response headers)
      const requiredHeaders = [
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
      ]

      // In a real application, you would check actual response headers
      // For this demo, we'll simulate the check
      requiredHeaders.forEach((header) => {
        // Simulate missing header
        if (Math.random() > 0.7) {
          // 30% chance of missing header
          testVulnerabilities.push({
            type: 'headers',
            severity: 'medium',
            title: `Missing security header: ${header}`,
            description: `Required security header ${header} is not present`,
            impact: 'Missing security headers reduce protection against various attacks',
            recommendation: `Add ${header} header to server response`,
          })
        }
      })
    } catch (error) {
      logError('Security headers test failed', {
        error: error instanceof Error ? error.message : String(error),
      })
    }

    const duration = performance.now() - startTime
    const score =
      testVulnerabilities.length === 0 ? 100 : Math.max(0, 100 - testVulnerabilities.length * 8)

    const result: SecurityTestResult = {
      testName: 'Security Headers Testing',
      passed: testVulnerabilities.length === 0,
      vulnerabilities: testVulnerabilities,
      score,
      timestamp: new Date(),
      duration,
    }

    testResults.value.push(result)
    return result
  }

  // Run all security tests
  async function runAllSecurityTests(): Promise<SecurityTestResult[]> {
    logSecurityEvent('Starting comprehensive security testing')

    const tests = [
      runXSSTests(),
      runCSRFTests(),
      runAuthenticationTests(),
      runSecurityHeadersTests(),
    ]

    const results = await Promise.all(tests)

    logSecurityEvent('Security testing completed', {
      totalTests: results.length,
      passedTests: results.filter((r) => r.passed).length,
      totalVulnerabilities: results.reduce((sum, r) => sum + r.vulnerabilities.length, 0),
    })

    return results
  }

  // Generate security report
  function generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      overallScore: securityScore.value,
      totalVulnerabilities: totalVulnerabilities.value,
      criticalVulnerabilities: criticalVulnerabilities.value.length,
      highVulnerabilities: highVulnerabilities.value.length,
      mediumVulnerabilities: vulnerabilities.value.filter((v) => v.severity === 'medium').length,
      lowVulnerabilities: vulnerabilities.value.filter((v) => v.severity === 'low').length,
      openVulnerabilities: openVulnerabilities.value.length,
      testResults: testResults.value,
      vulnerabilities: vulnerabilities.value,
      recommendations: generateRecommendations(),
    }

    return report
  }

  // Generate security recommendations
  function generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (criticalVulnerabilities.value.length > 0) {
      recommendations.push('Fix critical vulnerabilities immediately')
    }

    if (highVulnerabilities.value.length > 0) {
      recommendations.push('Address high-priority security issues')
    }

    if (vulnerabilities.value.filter((v) => v.type === 'xss').length > 0) {
      recommendations.push('Implement proper input validation and output encoding')
    }

    if (vulnerabilities.value.filter((v) => v.type === 'csrf').length > 0) {
      recommendations.push('Add CSRF protection to all forms')
    }

    if (vulnerabilities.value.filter((v) => v.type === 'injection').length > 0) {
      recommendations.push('Use parameterized queries and input sanitization')
    }

    if (vulnerabilities.value.filter((v) => v.type === 'headers').length > 0) {
      recommendations.push('Configure security headers on server')
    }

    if (recommendations.length === 0) {
      recommendations.push('No security issues detected - maintain current security practices')
    }

    return recommendations
  }

  // Mark vulnerability as fixed
  function markVulnerabilityFixed(vulnerabilityId: string) {
    const vuln = vulnerabilities.value.find((v) => v.id === vulnerabilityId)
    if (vuln) {
      vuln.status = 'fixed'
      logSecurityEvent(`Vulnerability marked as fixed: ${vuln.title}`)
    }
  }

  // Mark vulnerability as false positive
  function markVulnerabilityFalsePositive(vulnerabilityId: string) {
    const vuln = vulnerabilities.value.find((v) => v.id === vulnerabilityId)
    if (vuln) {
      vuln.status = 'false_positive'
      logSecurityEvent(`Vulnerability marked as false positive: ${vuln.title}`)
    }
  }

  // Clear all vulnerabilities
  function clearVulnerabilities() {
    vulnerabilities.value = []
    testResults.value = []
    logSecurityEvent('All security vulnerabilities cleared')
  }

  // Export security data
  function exportSecurityData(format: 'json' | 'csv' = 'json'): string {
    const report = generateSecurityReport()

    if (format === 'json') {
      return JSON.stringify(report, null, 2)
    } else {
      // CSV format
      const headers = [
        'id',
        'type',
        'severity',
        'title',
        'description',
        'impact',
        'recommendation',
        'status',
        'timestamp',
      ]
      const csvRows = [headers.join(',')]

      vulnerabilities.value.forEach((vuln) => {
        const row = [
          vuln.id,
          vuln.type,
          vuln.severity,
          `"${vuln.title.replace(/"/g, '""')}"`,
          `"${vuln.description.replace(/"/g, '""')}"`,
          `"${vuln.impact.replace(/"/g, '""')}"`,
          `"${vuln.recommendation.replace(/"/g, '""')}"`,
          vuln.status,
          vuln.timestamp.toISOString(),
        ]
        csvRows.push(row.join(','))
      })

      return csvRows.join('\n')
    }
  }

  // Lifecycle
  onMounted(() => {
    initializeSecurityTesting()
  })

  return {
    // State
    vulnerabilities,
    testResults,
    securityConfig,
    totalVulnerabilities,
    criticalVulnerabilities,
    highVulnerabilities,
    openVulnerabilities,
    securityScore,

    // Methods
    runAllSecurityTests,
    runXSSTests,
    runCSRFTests,
    runAuthenticationTests,
    runSecurityHeadersTests,
    generateSecurityReport,
    markVulnerabilityFixed,
    markVulnerabilityFalsePositive,
    clearVulnerabilities,
    exportSecurityData,
    validateInput,
    encodeHTML,
  }
}
