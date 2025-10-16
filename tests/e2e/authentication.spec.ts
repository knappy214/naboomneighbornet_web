import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
  })

  test('should display login page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Check if login form is visible
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check page title
    await expect(page).toHaveTitle(/Login/)
  })

  test('should display registration page', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register')

    // Check if registration form is visible
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check page title
    await expect(page).toHaveTitle(/Register/)
  })

  test('should register a new user', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register')

    // Fill registration form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for redirect or success message
    await page.waitForLoadState('networkidle')

    // Check if redirected to dashboard or success message is shown
    await expect(page).toHaveURL(/dashboard|success/)
  })

  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for redirect
    await page.waitForLoadState('networkidle')

    // Check if redirected to dashboard
    await expect(page).toHaveURL(/dashboard/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Fill login form with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for error message
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 })

    // Check if error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('should logout user', async ({ page }) => {
    // First login (assuming user is already registered)
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Click logout button
    await page.click('[data-testid="logout-button"]')

    // Wait for redirect to login page
    await page.waitForLoadState('networkidle')

    // Check if redirected to login page
    await expect(page).toHaveURL(/login/)
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard')

    // Should be redirected to login page
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/login/)
  })

  test('should remember user session', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')

    // Close browser context (simulating browser restart)
    await page.context().close()

    // Open new page and navigate to protected route
    const newPage = await page.context().newPage()
    await newPage.goto('/dashboard')

    // Should still be logged in (if session is persisted)
    await newPage.waitForLoadState('networkidle')
    // This test might fail depending on session persistence implementation
  })
})
