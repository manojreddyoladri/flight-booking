import { test, expect } from '@playwright/test';
import { BookingsPage } from '../pages/bookings.page';

test.describe('Regression: Booking Management', () => {
  test('should load bookings page and display booking form', async ({ page }) => {
    const bookingsPage = new BookingsPage(page);
    await bookingsPage.navigateToBookings();
    // Check that the booking form fields are visible
    await expect(page.locator('#selectedDate')).toBeVisible();
    await expect(page.locator('#customerId')).toBeVisible();
    await expect(page.locator('#flightId')).toBeVisible();
  });
}); 