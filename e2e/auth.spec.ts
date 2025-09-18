import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete sign up flow', async ({ page }) => {
    // Open sign up modal
    await page.getByRole('button', { name: /get started/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Fill out sign up form
    await page.getByLabel(/full name/i).fill('John Doe')
    await page.getByLabel(/email/i).fill('john.doe@example.com')
    await page.getByLabel(/password/i).fill('password123')

    // Submit form
    await page.getByRole('button', { name: /create account/i }).click()

    // Should show loading state
    await expect(page.getByText(/loading/i)).toBeVisible()

    // Should redirect to home page after successful signup
    await expect(page).toHaveURL('/home')
    await expect(page.getByText(/jobgenie/i)).toBeVisible()
  })

  test('should complete sign in flow', async ({ page }) => {
    // Open sign in modal
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Fill out sign in form
    await page.getByLabel(/email/i).fill('john.doe@example.com')
    await page.getByLabel(/password/i).fill('password123')

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should show loading state
    await expect(page.getByText(/loading/i)).toBeVisible()

    // Should redirect to home page after successful signin
    await expect(page).toHaveURL('/home')
  })

  test('should validate form inputs', async ({ page }) => {
    // Open sign up modal
    await page.getByRole('button', { name: /get started/i }).click()

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create account/i }).click()

    // Should show validation errors
    await expect(page.getByText(/name is required/i)).toBeVisible()
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    // Open sign up modal
    await page.getByRole('button', { name: /get started/i }).click()

    // Fill with invalid email
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByRole('button', { name: /create account/i }).click()

    // Should show email validation error
    await expect(page.getByText(/email is invalid/i)).toBeVisible()
  })

  test('should validate password length', async ({ page }) => {
    // Open sign up modal
    await page.getByRole('button', { name: /get started/i }).click()

    // Fill with short password
    await page.getByLabel(/password/i).fill('123')
    await page.getByRole('button', { name: /create account/i }).click()

    // Should show password validation error
    await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible()
  })

  test('should switch between sign in and sign up modes', async ({ page }) => {
    // Open sign up modal
    await page.getByRole('button', { name: /get started/i }).click()
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()

    // Switch to sign in
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

    // Switch back to sign up
    await page.getByRole('button', { name: /sign up/i }).click()
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
  })

  test('should close modal when clicking close button', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /get started/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Close modal
    await page.getByRole('button', { name: /close/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})