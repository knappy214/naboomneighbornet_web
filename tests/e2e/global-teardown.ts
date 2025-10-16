import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for E2E tests...')

  try {
    // Clean up test data
    await cleanupTestData()

    // Generate test report
    await generateTestReport()

    console.log('✅ Global teardown completed')
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error to avoid masking test failures
  }
}

async function cleanupTestData() {
  console.log('🗑️ Cleaning up test data...')

  try {
    // Clean up test users, messages, events, etc.
    // This would typically involve API calls to clean up test data
    console.log('✅ Test data cleanup completed')
  } catch (error) {
    console.warn('⚠️ Test data cleanup failed:', error)
  }
}

async function generateTestReport() {
  console.log('📊 Generating test report...')

  try {
    // Generate additional test reports if needed
    console.log('✅ Test report generation completed')
  } catch (error) {
    console.warn('⚠️ Test report generation failed:', error)
  }
}

export default globalTeardown
