import { test, expect } from '@playwright/test'

test.describe('Event Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
  })

  test('should display events page', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Check if events page is visible
    await expect(page.locator('[data-testid="events-page"]')).toBeVisible()

    // Check for events list
    await expect(page.locator('[data-testid="events-list"]')).toBeVisible()

    // Check for create event button
    await expect(page.locator('[data-testid="create-event-button"]')).toBeVisible()
  })

  test('should create a new event', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Click create event button
    await page.click('[data-testid="create-event-button"]')

    // Check if create event modal/form is visible
    await expect(page.locator('[data-testid="create-event-form"]')).toBeVisible()

    // Fill event form
    await page.fill('input[name="title"]', 'Community Safety Meeting')
    await page.fill(
      'textarea[name="description"]',
      'Monthly community safety meeting to discuss neighborhood security',
    )
    await page.fill('input[name="date"]', '2024-12-25')
    await page.fill('input[name="time"]', '19:00')
    await page.fill('input[name="location"]', 'Community Center')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for event to be created
    await page.waitForSelector('[data-testid="event-item"]')

    // Check if event appears in list
    await expect(page.locator('[data-testid="event-item"]')).toContainText(
      'Community Safety Meeting',
    )
  })

  test('should edit an existing event', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Wait for events to load
    await page.waitForSelector('[data-testid="event-item"]')

    // Click on edit button for first event
    await page.click('[data-testid="edit-event-button"]')

    // Check if edit form is visible
    await expect(page.locator('[data-testid="edit-event-form"]')).toBeVisible()

    // Update event title
    await page.fill('input[name="title"]', 'Updated Event Title')

    // Save changes
    await page.click('button[type="submit"]')

    // Check if event is updated
    await expect(page.locator('[data-testid="event-item"]')).toContainText('Updated Event Title')
  })

  test('should delete an event', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Wait for events to load
    await page.waitForSelector('[data-testid="event-item"]')

    // Click on delete button for first event
    await page.click('[data-testid="delete-event-button"]')

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]')

    // Check if event is removed
    await expect(page.locator('[data-testid="event-item"]')).toHaveCount(0)
  })

  test('should filter events by date', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Wait for events to load
    await page.waitForSelector('[data-testid="event-item"]')

    // Set date filter
    await page.fill('input[name="date-filter"]', '2024-12-25')

    // Apply filter
    await page.click('[data-testid="apply-filter-button"]')

    // Check if only events on that date are shown
    const events = page.locator('[data-testid="event-item"]')
    await expect(events).toHaveCount.greaterThan(0)
  })

  test('should search events by title', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Wait for events to load
    await page.waitForSelector('[data-testid="event-item"]')

    // Search for events
    await page.fill('input[name="search"]', 'Safety')

    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]')

    // Check if search results contain the search term
    await expect(page.locator('[data-testid="search-results"]')).toContainText('Safety')
  })

  test('should display event details', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Wait for events to load
    await page.waitForSelector('[data-testid="event-item"]')

    // Click on event to view details
    await page.click('[data-testid="event-item"]')

    // Check if event details modal is visible
    await expect(page.locator('[data-testid="event-details-modal"]')).toBeVisible()

    // Check if event details are displayed
    await expect(page.locator('[data-testid="event-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="event-description"]')).toBeVisible()
    await expect(page.locator('[data-testid="event-date"]')).toBeVisible()
    await expect(page.locator('[data-testid="event-time"]')).toBeVisible()
    await expect(page.locator('[data-testid="event-location"]')).toBeVisible()
  })

  test('should handle event RSVP', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Wait for events to load
    await page.waitForSelector('[data-testid="event-item"]')

    // Click on event to view details
    await page.click('[data-testid="event-item"]')

    // Click RSVP button
    await page.click('[data-testid="rsvp-button"]')

    // Check if RSVP status is updated
    await expect(page.locator('[data-testid="rsvp-status"]')).toContainText('Attending')
  })

  test('should handle event discussion', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Wait for events to load
    await page.waitForSelector('[data-testid="event-item"]')

    // Click on event to view details
    await page.click('[data-testid="event-item"]')

    // Check if discussion section is visible
    await expect(page.locator('[data-testid="event-discussion"]')).toBeVisible()

    // Add a comment
    await page.fill('[data-testid="comment-input"]', 'Looking forward to this event!')
    await page.click('[data-testid="add-comment-button"]')

    // Check if comment is added
    await expect(page.locator('[data-testid="comment-item"]')).toContainText(
      'Looking forward to this event!',
    )
  })

  test('should handle event reminders', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Wait for events to load
    await page.waitForSelector('[data-testid="event-item"]')

    // Click on event to view details
    await page.click('[data-testid="event-item"]')

    // Set reminder
    await page.click('[data-testid="set-reminder-button"]')

    // Select reminder time
    await page.selectOption('select[name="reminder-time"]', '1-hour')

    // Save reminder
    await page.click('[data-testid="save-reminder-button"]')

    // Check if reminder is set
    await expect(page.locator('[data-testid="reminder-status"]')).toContainText('Reminder set')
  })

  test('should handle event sharing', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events')

    // Wait for events to load
    await page.waitForSelector('[data-testid="event-item"]')

    // Click on event to view details
    await page.click('[data-testid="event-item"]')

    // Click share button
    await page.click('[data-testid="share-event-button"]')

    // Check if share options are visible
    await expect(page.locator('[data-testid="share-options"]')).toBeVisible()

    // Select share method
    await page.click('[data-testid="share-email"]')

    // Fill share form
    await page.fill('input[name="email"]', 'friend@example.com')
    await page.fill('textarea[name="message"]', 'Check out this event!')

    // Send share
    await page.click('[data-testid="send-share-button"]')

    // Check if share is sent
    await expect(page.locator('[data-testid="share-success"]')).toBeVisible()
  })
})
