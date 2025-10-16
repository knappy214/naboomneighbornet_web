import { test, expect } from '@playwright/test'

test.describe('Community Hub', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
  })

  test('should display community hub', async ({ page }) => {
    // Navigate to community hub
    await page.goto('/hub')

    // Check if hub is visible
    await expect(page.locator('[data-testid="community-hub"]')).toBeVisible()

    // Check for channel list
    await expect(page.locator('[data-testid="channel-list"]')).toBeVisible()

    // Check for message input
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible()
  })

  test('should switch between channels', async ({ page }) => {
    // Navigate to community hub
    await page.goto('/hub')

    // Click on a channel
    await page.click('[data-testid="channel-general"]')

    // Check if channel is selected
    await expect(page.locator('[data-testid="channel-general"]')).toHaveClass(/active/)

    // Click on another channel
    await page.click('[data-testid="channel-announcements"]')

    // Check if new channel is selected
    await expect(page.locator('[data-testid="channel-announcements"]')).toHaveClass(/active/)
  })

  test('should send a message', async ({ page }) => {
    // Navigate to community hub
    await page.goto('/hub')

    // Select a channel
    await page.click('[data-testid="channel-general"]')

    // Type a message
    await page.fill('[data-testid="message-input"]', 'Hello community!')

    // Send message
    await page.click('[data-testid="send-button"]')

    // Wait for message to appear
    await page.waitForSelector('[data-testid="message-list"]')

    // Check if message is displayed
    await expect(page.locator('[data-testid="message-list"]')).toContainText('Hello community!')
  })

  test('should display typing indicator', async ({ page }) => {
    // Navigate to community hub
    await page.goto('/hub')

    // Select a channel
    await page.click('[data-testid="channel-general"]')

    // Start typing
    await page.fill('[data-testid="message-input"]', 'Typing...')

    // Check if typing indicator appears
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible()

    // Clear input
    await page.fill('[data-testid="message-input"]', '')

    // Check if typing indicator disappears
    await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible()
  })

  test('should display message history', async ({ page }) => {
    // Navigate to community hub
    await page.goto('/hub')

    // Select a channel
    await page.click('[data-testid="channel-general"]')

    // Check if message history is loaded
    await expect(page.locator('[data-testid="message-list"]')).toBeVisible()

    // Check if there are messages
    const messages = page.locator('[data-testid="message-item"]')
    await expect(messages).toHaveCount.greaterThan(0)
  })

  test('should handle message reactions', async ({ page }) => {
    // Navigate to community hub
    await page.goto('/hub')

    // Select a channel
    await page.click('[data-testid="channel-general"]')

    // Send a message
    await page.fill('[data-testid="message-input"]', 'Test message')
    await page.click('[data-testid="send-button"]')

    // Wait for message to appear
    await page.waitForSelector('[data-testid="message-item"]')

    // Click on reaction button
    await page.click('[data-testid="reaction-button"]')

    // Select an emoji
    await page.click('[data-testid="emoji-thumbs-up"]')

    // Check if reaction is added
    await expect(page.locator('[data-testid="reaction-thumbs-up"]')).toBeVisible()
  })

  test('should handle message editing', async ({ page }) => {
    // Navigate to community hub
    await page.goto('/hub')

    // Select a channel
    await page.click('[data-testid="channel-general"]')

    // Send a message
    await page.fill('[data-testid="message-input"]', 'Original message')
    await page.click('[data-testid="send-button"]')

    // Wait for message to appear
    await page.waitForSelector('[data-testid="message-item"]')

    // Click on edit button
    await page.click('[data-testid="edit-message-button"]')

    // Edit the message
    await page.fill('[data-testid="edit-message-input"]', 'Edited message')

    // Save changes
    await page.click('[data-testid="save-edit-button"]')

    // Check if message is updated
    await expect(page.locator('[data-testid="message-item"]')).toContainText('Edited message')
  })

  test('should handle message deletion', async ({ page }) => {
    // Navigate to community hub
    await page.goto('/hub')

    // Select a channel
    await page.click('[data-testid="channel-general"]')

    // Send a message
    await page.fill('[data-testid="message-input"]', 'Message to delete')
    await page.click('[data-testid="send-button"]')

    // Wait for message to appear
    await page.waitForSelector('[data-testid="message-item"]')

    // Click on delete button
    await page.click('[data-testid="delete-message-button"]')

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]')

    // Check if message is removed
    await expect(page.locator('[data-testid="message-item"]')).not.toContainText(
      'Message to delete',
    )
  })

  test('should handle real-time updates', async ({ page }) => {
    // Navigate to community hub
    await page.goto('/hub')

    // Select a channel
    await page.click('[data-testid="channel-general"]')

    // Wait for WebSocket connection
    await page.waitForSelector('[data-testid="connection-status"]')

    // Check if connection status shows connected
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected')
  })

  test('should handle offline mode', async ({ page }) => {
    // Navigate to community hub
    await page.goto('/hub')

    // Simulate offline mode
    await page.context().setOffline(true)

    // Check if offline indicator appears
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()

    // Try to send a message while offline
    await page.fill('[data-testid="message-input"]', 'Offline message')
    await page.click('[data-testid="send-button"]')

    // Check if message is queued
    await expect(page.locator('[data-testid="queued-message"]')).toBeVisible()

    // Simulate online mode
    await page.context().setOffline(false)

    // Check if offline indicator disappears
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible()

    // Check if queued message is sent
    await page.waitForSelector('[data-testid="message-item"]')
    await expect(page.locator('[data-testid="message-item"]')).toContainText('Offline message')
  })
})
