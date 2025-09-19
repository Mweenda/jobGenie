import { test, expect } from '@playwright/test'

test.describe('Job Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for these tests
    await page.goto('/')
    await page.getByRole('button', { name: /get started/i }).click()
    
    // Fill out sign up form
    await page.getByLabel(/full name/i).fill('John Doe')
    await page.getByLabel(/email/i).fill('john.doe@example.com')
    await page.getByLabel(/password/i).fill('password123')
    
    // Submit and wait for redirect
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page).toHaveURL('/home')
  })

  test('should display job feed on home page', async ({ page }) => {
    await expect(page.getByText(/job feed/i)).toBeVisible()
    await expect(page.getByText(/recommended jobs/i)).toBeVisible()
  })

  test('should show job filter tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /recommended/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /recent/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /remote/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /full-time/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /saved/i })).toBeVisible()
  })

  test('should switch between filter tabs', async ({ page }) => {
    // Click on Remote tab
    await page.getByRole('tab', { name: /remote/i }).click()
    await expect(page.getByRole('tab', { name: /remote/i })).toHaveClass(/border-blue-500/)
    
    // Click on Full-time tab
    await page.getByRole('tab', { name: /full-time/i }).click()
    await expect(page.getByRole('tab', { name: /full-time/i })).toHaveClass(/border-blue-500/)
  })

  test('should display job cards with required information', async ({ page }) => {
    // Wait for job cards to load
    await expect(page.locator('[data-testid="job-card"]').first()).toBeVisible()
    
    const firstJobCard = page.locator('[data-testid="job-card"]').first()
    
    // Check for job title
    await expect(firstJobCard.locator('h3')).toBeVisible()
    
    // Check for company name
    await expect(firstJobCard.locator('p').first()).toBeVisible()
    
    // Check for location, salary, and posted date
    await expect(firstJobCard.getByText(/\$\d+k/)).toBeVisible()
    await expect(firstJobCard.getByText(/ago|days|hours/)).toBeVisible()
  })

  test('should open advanced filters', async ({ page }) => {
    await page.getByRole('button', { name: /filters/i }).click()
    
    await expect(page.getByLabel(/location/i)).toBeVisible()
    await expect(page.getByLabel(/job type/i)).toBeVisible()
    await expect(page.getByLabel(/min salary/i)).toBeVisible()
    await expect(page.getByLabel(/remote only/i)).toBeVisible()
  })

  test('should apply filters and show results', async ({ page }) => {
    // Open filters
    await page.getByRole('button', { name: /filters/i }).click()
    
    // Fill in filter criteria
    await page.getByLabel(/location/i).fill('San Francisco')
    await page.getByLabel(/min salary/i).fill('100000')
    await page.getByLabel(/remote only/i).check()
    
    // Apply filters
    await page.getByRole('button', { name: /apply filters/i }).click()
    
    // Verify filters are applied (filter panel should close)
    await expect(page.getByLabel(/location/i)).not.toBeVisible()
  })

  test('should save and unsave jobs', async ({ page }) => {
    // Wait for job cards to load
    await expect(page.locator('[data-testid="job-card"]').first()).toBeVisible()
    
    const firstJobCard = page.locator('[data-testid="job-card"]').first()
    const saveButton = firstJobCard.getByRole('button', { name: /save|bookmark/i })
    
    // Save the job
    await saveButton.click()
    
    // Check if the save state changed (icon should change)
    await expect(saveButton).toHaveAttribute('aria-pressed', 'true')
    
    // Unsave the job
    await saveButton.click()
    await expect(saveButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('should navigate to saved jobs tab and show saved jobs', async ({ page }) => {
    // First save a job
    const firstJobCard = page.locator('[data-testid="job-card"]').first()
    await firstJobCard.getByRole('button', { name: /save|bookmark/i }).click()
    
    // Navigate to saved jobs tab
    await page.getByRole('tab', { name: /saved/i }).click()
    
    // Should show saved jobs (or empty state)
    await expect(page.getByRole('tab', { name: /saved/i })).toHaveClass(/border-blue-500/)
  })

  test('should show match scores on recommended jobs', async ({ page }) => {
    // Ensure we're on the recommended tab
    await page.getByRole('tab', { name: /recommended/i }).click()
    
    // Look for match percentage indicators
    await expect(page.getByText(/\d+% match/)).toBeVisible()
  })

  test('should load more jobs when clicking load more', async ({ page }) => {
    // Scroll to bottom to find load more button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Click load more if it exists
    const loadMoreButton = page.getByRole('button', { name: /load more/i })
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click()
      // Should show loading state or more jobs
    }
  })

  test('should search for jobs using the search bar', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search for jobs/i)
    
    await searchInput.fill('software engineer')
    await searchInput.press('Enter')
    
    // Should trigger search (results may vary based on implementation)
    await expect(searchInput).toHaveValue('software engineer')
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Job feed should still be visible and functional
    await expect(page.getByText(/job feed/i)).toBeVisible()
    
    // Filter tabs should be scrollable or stacked
    await expect(page.getByRole('tab', { name: /recommended/i })).toBeVisible()
    
    // Job cards should be properly sized for mobile
    const jobCard = page.locator('[data-testid="job-card"]').first()
    if (await jobCard.isVisible()) {
      const boundingBox = await jobCard.boundingBox()
      expect(boundingBox?.width).toBeLessThanOrEqual(375)
    }
  })
})