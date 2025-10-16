import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...')

  // Start browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...')
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3000')

    // Wait for the application to load
    await page.waitForLoadState('networkidle')

    // Check if the application is running
    const title = await page.title()
    console.log(`📱 Application title: ${title}`)

    // Verify the application is accessible
    await page.waitForSelector('body', { timeout: 10000 })

    console.log('✅ Application is ready for testing')

    // Set up test data if needed
    await setupTestData(page)
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

async function setupTestData(page: any) {
  console.log('🔧 Setting up test data...')

  try {
    // Create test users if needed
    // This would typically involve API calls to create test data
    console.log('👤 Test data setup completed')
  } catch (error) {
    console.warn('⚠️ Test data setup failed:', error)
    // Don't fail the entire setup if test data setup fails
  }
}

export default globalSetup
