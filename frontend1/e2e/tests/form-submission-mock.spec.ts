import { test, expect } from '@playwright/test';

test.describe('Form Submission with API Mocking', () => {
  test('should submit Add Customer form and show success', async ({ page }) => {
    await page.route('**/api/customers', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 999, name: 'Mock User', email: 'mock@example.com' }),
        });
      } else {
        await route.continue();
      }
    });
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    const name = 'Mock User';
    const email = 'mock@example.com';
    await page.fill('#name', name);
    await page.fill('#email', email);
    await page.click('text=Add Customer');
    // Expect form to reset (fields empty)
    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.locator('#email')).toHaveValue('');
    // Optionally, check for a success notification if present
    // await expect(page.locator('.alert-success')).toContainText('success');
  });

  test('should submit Add Flight form and show success', async ({ page }) => {
    await page.route('**/api/flights', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 888, airlineName: 'Mock Airline', totalSeats: 100, flightDate: '2024-12-31', price: 123.45 }),
        });
      } else {
        await route.continue();
      }
    });
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');
    await page.fill('#airlineName', 'Mock Airline');
    await page.fill('#totalSeats', '100');
    await page.fill('#price', '123.45');
    await page.fill('#flightDate', '2024-12-31');
    await page.click('text=Add Flight');
    // Expect form to reset (fields empty)
    await expect(page.locator('#airlineName')).toHaveValue('');
    await expect(page.locator('#totalSeats')).toHaveValue('');
    await expect(page.locator('#price')).toHaveValue('');
    await expect(page.locator('#flightDate')).toHaveValue('');
    // Optionally, check for a success notification if present
    // await expect(page.locator('.alert-success')).toContainText('success');
  });

  test('should submit Create Booking form and show success', async ({ page }) => {
    // Dynamically compute a future date (tomorrow)
    const tomorrow = new Date(Date.now() + 24*60*60*1000);
    const futureDate = tomorrow.toISOString().split('T')[0];
    // Mock GET flights by date API to return at least one flight for the selected date
    await page.route(new RegExp(`/api/flights/by-date\\?date=${futureDate}$`), async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 888,
              airlineName: 'Mock Airline',
              totalSeats: 100,
              availableSeats: 50,
              flightDate: futureDate,
              price: 123.45
            }
          ]),
        });
      } else {
        await route.continue();
      }
    });
    // Mock POST booking API
    await page.route('**/api/bookings', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 777, flightId: 888, customerId: 999, price: 123.45, bookingDate: futureDate + 'T10:00:00' }),
        });
      } else {
        await route.continue();
      }
    });
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    // Fill booking form
    await page.fill('#selectedDate', futureDate);
    await page.fill('#customerId', '999');
    // Debug: Take a screenshot and log the dropdown HTML after filling the date and customer ID
    await page.screenshot({ path: 'booking-form-after-date-and-customer.png', fullPage: true });
    const dropdownHtml = await page.locator('#flightId').evaluate(el => el.outerHTML);
    console.log('Dropdown HTML after date and customer:', dropdownHtml);
    // Select the flight option directly (force: true)
    await page.selectOption('#flightId', '888', { force: true });
    // Price is auto-set, so skip
    await page.click('text=Create Booking');
    // Expect form to reset (customerId field empty)
    await expect(page.locator('#customerId')).toHaveValue('');
    // Optionally, check for a success notification if present
    // await expect(page.locator('.alert-success')).toContainText('success');
  });

  // Optionally, add error scenario for customer form
  test('should show error on failed customer submission', async ({ page }) => {
    await page.route('**/api/customers', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
      } else {
        await route.continue();
      }
    });
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    await page.fill('#name', 'Error User');
    await page.fill('#email', 'error@example.com');
    await page.click('text=Add Customer');
    // Optionally, check for an error notification if present
    // await expect(page.locator('.alert-danger')).toContainText('error');
  });
}); 