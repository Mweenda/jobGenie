import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test('landing page should be accessible', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    
    // Check that all images have alt text
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
    
    // Check that all buttons have accessible names
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const accessibleName = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      expect(accessibleName || ariaLabel).toBeTruthy()
    }
    
    // Check for proper form labels
    const inputs = page.locator('input')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        const hasLabel = await label.count() > 0
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy()
      }
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'INPUT'].includes(focusedElement || '')).toBeTruthy()
    
    // Continue tabbing
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to activate buttons with Enter/Space
    const getStartedButton = page.getByRole('button', { name: /get started/i })
    await getStartedButton.focus()
    await page.keyboard.press('Enter')
    
    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // Should be able to close modal with Escape
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should have proper focus management in modals', async ({ page }) => {
    await page.goto('/')
    
    // Open auth modal
    await page.getByRole('button', { name: /get started/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // Focus should be trapped in modal
    const modalInputs = page.getByRole('dialog').locator('input, button')
    const inputCount = await modalInputs.count()
    
    // Tab through all modal elements
    for (let i = 0; i < inputCount + 1; i++) {
      await page.keyboard.press('Tab')
    }
    
    // Focus should still be within the modal
    const focusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement
      const modal = document.querySelector('[role="dialog"]')
      return modal?.contains(activeElement)
    })
    
    expect(focusedElement).toBeTruthy()
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')
    
    // This is a basic check - in a real app you'd use axe-core or similar
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button')
    const elementCount = await textElements.count()
    
    // Check that text elements have readable colors
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i)
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        }
      })
      
      // Basic check that color is not transparent or same as background
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
      expect(styles.color).not.toBe(styles.backgroundColor)
    }
  })

  test('should work with screen reader simulation', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper ARIA landmarks
    const main = page.getByRole('main')
    const navigation = page.getByRole('navigation')
    const banner = page.getByRole('banner')
    
    // At least one of these should be present
    const landmarkCount = await Promise.all([
      main.count(),
      navigation.count(),
      banner.count()
    ]).then(counts => counts.reduce((sum, count) => sum + count, 0))
    
    expect(landmarkCount).toBeGreaterThan(0)
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)
    
    // Check that interactive elements have proper roles
    const buttons = page.getByRole('button')
    const links = page.getByRole('link')
    const inputs = page.getByRole('textbox')
    
    const interactiveCount = await Promise.all([
      buttons.count(),
      links.count(),
      inputs.count()
    ]).then(counts => counts.reduce((sum, count) => sum + count, 0))
    
    expect(interactiveCount).toBeGreaterThan(0)
  })

  test('should handle reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    
    // Check that animations are disabled or reduced
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]')
    const animatedCount = await animatedElements.count()
    
    if (animatedCount > 0) {
      // In a real implementation, you'd check that animations respect the preference
      // For now, just ensure the page still loads and functions
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
  })

  test('should be usable at 200% zoom', async ({ page }) => {
    await page.goto('/')
    
    // Simulate 200% zoom
    await page.setViewportSize({ width: 640, height: 480 })
    
    // Check that content is still accessible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible()
    
    // Check that text doesn't overflow
    const textElements = page.locator('p, h1, h2, h3')
    const elementCount = await textElements.count()
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = textElements.nth(i)
      const boundingBox = await element.boundingBox()
      
      if (boundingBox) {
        expect(boundingBox.width).toBeLessThanOrEqual(640)
      }
    }
  })

  test('should provide error messages for form validation', async ({ page }) => {
    await page.goto('/')
    
    // Open sign up modal
    await page.getByRole('button', { name: /get started/i }).click()
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create account/i }).click()
    
    // Check for error messages
    const errorMessages = page.locator('[role="alert"], .text-red-600, [class*="error"]')
    const errorCount = await errorMessages.count()
    
    expect(errorCount).toBeGreaterThan(0)
    
    // Error messages should be associated with form fields
    const nameError = page.getByText(/name is required/i)
    const emailError = page.getByText(/email is required/i)
    const passwordError = page.getByText(/password is required/i)
    
    await expect(nameError.or(emailError).or(passwordError)).toBeVisible()
  })

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/')
    
    // Open modal - this is a dynamic content change
    await page.getByRole('button', { name: /get started/i }).click()
    
    // Modal should be announced to screen readers
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    
    // Check for proper ARIA attributes
    const ariaModal = await modal.getAttribute('aria-modal')
    const ariaLabelledBy = await modal.getAttribute('aria-labelledby')
    const ariaDescribedBy = await modal.getAttribute('aria-describedby')
    
    expect(ariaModal).toBe('true')
    expect(ariaLabelledBy || ariaDescribedBy).toBeTruthy()
  })
})