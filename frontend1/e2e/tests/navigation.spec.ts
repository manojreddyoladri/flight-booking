import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    // Use the actual title set in your Angular app (update if needed)
    await expect(page).toHaveTitle('Flight Booking System');
    await expect(page.locator('nav.navbar')).toBeVisible();
    await expect(page.locator('.navbar-brand')).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const navLinks = ['Flights', 'Customers', 'Bookings', 'Reports'];
    for (const link of navLinks) {
      await expect(page.locator('nav.navbar a.nav-link', { hasText: link })).toBeVisible();
    }
  });

  test('should navigate to flights page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('text=Flights');
    await page.waitForURL('**/flights');
    await expect(page.url()).toContain('/flights');
  });

  test('should navigate to customers page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('text=Customers');
    await page.waitForURL('**/customers');
    await expect(page.url()).toContain('/customers');
  });

  test('should navigate to bookings page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('text=Bookings');
    await page.waitForURL('**/bookings');
    await expect(page.url()).toContain('/bookings');
  });

  test('should navigate to reports page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('text=Reports');
    await page.waitForURL('**/reports');
    await expect(page.url()).toContain('/reports');
    await expect(page.locator('h2')).toContainText('Reports Dashboard');
  });
}); 