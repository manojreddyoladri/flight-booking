import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test.describe('Navigation Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });



  test('should load the home page', async ({ page }) => {
    await homePage.navigateToHome();
    await homePage.verifyPageTitle('Flight Booking System');
    await expect(await homePage.isNavbarVisible()).toBeTruthy();
    await expect(await homePage.isNavbarBrandVisible()).toBeTruthy();
  });

  test('should have navigation links', async ({ page }) => {
    await homePage.navigateToHome();
    await homePage.verifyAllNavigationLinks();
  });

  test('should navigate to flights page', async ({ page }) => {
    await homePage.navigateToHome();
    await homePage.navigateToFlights();
    await expect(page.url()).toContain('/flights');
  });

  test('should navigate to customers page', async ({ page }) => {
    await homePage.navigateToHome();
    await homePage.navigateToCustomers();
    await expect(page.url()).toContain('/customers');
  });

  test('should navigate to bookings page', async ({ page }) => {
    await homePage.navigateToHome();
    await homePage.navigateToBookings();
    await expect(page.url()).toContain('/bookings');
  });

  test('should navigate to reports page', async ({ page }) => {
    await homePage.navigateToHome();
    await homePage.navigateToReports();
    await expect(page.url()).toContain('/reports');
  });
}); 