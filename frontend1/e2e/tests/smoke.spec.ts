import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { FlightsPage } from '../pages/flights.page';
import { CustomersPage } from '../pages/customers.page';
import { BookingsPage } from '../pages/bookings.page';
import { ReportsPage } from '../pages/reports.page';

test.describe('Smoke Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to load
    await page.goto('/');
    // Wait for Angular to load
    await page.waitForLoadState('networkidle');
    // Wait for any loading spinners to disappear
    await page.waitForSelector('app-loading-spinner', { state: 'hidden', timeout: 10000 }).catch(() => {});
  });

  test('Home page loads and displays title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigateToHome();
    await homePage.verifyPageTitle('Flight Booking System');
    await expect(await homePage.isNavbarVisible()).toBeTruthy();
  });

  test('Flights page loads and displays title', async ({ page }) => {
    const flightsPage = new FlightsPage(page);
    await flightsPage.navigateToFlights();
    
    // Wait for the page to load and check for title
    await page.waitForSelector('h2', { timeout: 15000 });
    await flightsPage.verifyPageTitle();
    
    // Check search form fields are visible
    await expect(async () => { await flightsPage.verifySearchFormFields(); }).not.toThrow();
  });

  test('Customers page loads and displays title', async ({ page }) => {
    const customersPage = new CustomersPage(page);
    await customersPage.navigateToCustomers();
    
    // Wait for the page to load and check for title
    await page.waitForSelector('h2', { timeout: 15000 });
    await customersPage.verifyPageTitle();
    
    // Check add customer form fields are visible
    await expect(async () => { await customersPage.verifyAddCustomerFormFields(); }).not.toThrow();
  });

  test('Bookings page loads and displays title', async ({ page }) => {
    const bookingsPage = new BookingsPage(page);
    await bookingsPage.navigateToBookings();
    
    // Wait for the page to load and check for title
    await page.waitForSelector('h2', { timeout: 15000 });
    await bookingsPage.verifyPageTitle();
    
    // Check create booking form fields are visible
    await expect(async () => { await bookingsPage.verifyCreateBookingFormFields(); }).not.toThrow();
  });

  test('Reports page loads and displays title', async ({ page }) => {
    const reportsPage = new ReportsPage(page);
    await reportsPage.navigateToReports();
    
    // Wait for the page to load and check for title
    await page.waitForSelector('h2', { timeout: 15000 });
    await reportsPage.verifyPageTitle();
    
    await expect(async () => { await reportsPage.verifyFilterFormElements(); }).not.toThrow();
  });
}); 