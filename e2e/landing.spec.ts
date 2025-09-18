import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /find your dream job/i })).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await expect(page.getByRole('link', { name: /jobgenie/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should open auth modal when clicking get started', async ({ page }) => {
    await page.getByRole('button', { name: /get started/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
  })

  test('should open auth modal when clicking sign in', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('should display features section', async ({ page }) => {
    await expect(page.getByText(/why choose jobgenie/i)).toBeVisible()
    await expect(page.getByText(/smart matching/i)).toBeVisible()
    await expect(page.getByText(/instant applications/i)).toBeVisible()
    await expect(page.getByText(/career coaching/i)).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { name: /find your dream job/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible()
  })

  test('should have proper accessibility', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()

    // Check for alt text on images (if any)
    const images = page.locator('img')
    const imageCount = await images.count()
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      await expect(img).toHaveAttribute('alt')
    }

    // Check for proper button labels
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)
  })
})