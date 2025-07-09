import { test, expect } from '@playwright/test';

test.describe('Simple Feature E2E Tests', () => {
  
  test.describe('Flights Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/flights');
      await page.waitForLoadState('networkidle');
    });

    test('should display flights page title', async ({ page }) => {
      await expect(page.locator('h2')).toContainText('Flight Management');
    });

    test('should display search form fields', async ({ page }) => {
      await expect(page.locator('#searchAirline')).toBeVisible();
      await expect(page.locator('#searchDate')).toBeVisible();
      await expect(page.locator('#searchPrice')).toBeVisible();
    });

    test('should display add flight form', async ({ page }) => {
      await expect(page.locator('#airlineName')).toBeVisible();
      await expect(page.locator('#totalSeats')).toBeVisible();
      await expect(page.locator('#flightDate')).toBeVisible();
      await expect(page.locator('#price')).toBeVisible();
    });

    test('should fill and clear search filters', async ({ page }) => {
      // Fill search fields
      await page.fill('#searchAirline', 'Test Airline');
      await page.fill('#searchPrice', '100');
      
      // Verify values
      await expect(page.locator('#searchAirline')).toHaveValue('Test Airline');
      await expect(page.locator('#searchPrice')).toHaveValue('100');
      
      // Clear filters
      await page.click('text=Clear Filters');
      
      // Verify cleared
      await expect(page.locator('#searchAirline')).toHaveValue('');
      await expect(page.locator('#searchPrice')).toHaveValue('');
    });
  });

  test.describe('Customers Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/customers');
      await page.waitForLoadState('networkidle');
    });

    test('should display customers page title', async ({ page }) => {
      await expect(page.locator('h2')).toContainText('Customer Management');
    });

    test('should display add customer form', async ({ page }) => {
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
    });

    test('should display search customer form', async ({ page }) => {
      await expect(page.locator('input[placeholder="Enter Customer ID"]')).toBeVisible();
    });

    test('should fill customer form fields', async ({ page }) => {
      const name = 'Test Customer ' + Date.now();
      const email = `test${Date.now()}@example.com`;
      
      await page.fill('#name', name);
      await page.fill('#email', email);
      
      await expect(page.locator('#name')).toHaveValue(name);
      await expect(page.locator('#email')).toHaveValue(email);
    });
  });

  test.describe('Bookings Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');
    });

    test('should display bookings page title', async ({ page }) => {
      await expect(page.locator('h2')).toContainText('Booking Management');
    });

    test('should display create booking form', async ({ page }) => {
      await expect(page.locator('#selectedDate')).toBeVisible();
      await expect(page.locator('#flightId')).toBeVisible();
      await expect(page.locator('#customerId')).toBeVisible();
    });

    test('should select a date for booking', async ({ page }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      await page.fill('#selectedDate', dateString);
      await expect(page.locator('#selectedDate')).toHaveValue(dateString);
    });

    test('should fill customer ID for booking', async ({ page }) => {
      await page.fill('#customerId', '1');
      await expect(page.locator('#customerId')).toHaveValue('1');
    });
  });

  test.describe('Reports Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');
    });

    test('should display reports page title', async ({ page }) => {
      await expect(page.locator('h2')).toContainText('Reports Dashboard');
    });

    test('should display filter form elements', async ({ page }) => {
      await expect(page.locator('#airline')).toBeVisible();
      await expect(page.locator('#startDate')).toBeVisible();
      await expect(page.locator('#endDate')).toBeVisible();
    });

    test('should set date range filters', async ({ page }) => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      await page.fill('#startDate', startDate);
      await page.fill('#endDate', endDate);
      
      await expect(page.locator('#startDate')).toHaveValue(startDate);
      await expect(page.locator('#endDate')).toHaveValue(endDate);
    });

    test('should display dashboard cards', async ({ page }) => {
      // Check if any of the overview cards are present
      const cardTitles = await page.locator('.card-title').allTextContents();
      expect(cardTitles.length).toBeGreaterThan(0);
    });
  });


}); 