import { test, expect } from '@playwright/test';
import { FlightsPage } from '../pages/flights.page';
import { CustomersPage } from '../pages/customers.page';
import { BookingsPage } from '../pages/bookings.page';
import { ReportsPage } from '../pages/reports.page';

test.describe('Simple Feature E2E Tests', () => {
  
  test.describe('Flights Page', () => {
    let flightsPage: FlightsPage;

    test.beforeEach(async ({ page }) => {
      flightsPage = new FlightsPage(page);
      await flightsPage.navigateToFlights();
    });

    test('should display flights page title', async ({ page }) => {
      await flightsPage.verifyPageTitle();
    });

    test('should display search form fields', async ({ page }) => {
      await flightsPage.verifySearchFormFields();
    });

    test('should display add flight form', async ({ page }) => {
      await flightsPage.verifyAddFlightFormFields();
    });

    test('should fill and clear search filters', async ({ page }) => {
      // Fill search fields
      await flightsPage.fillSearchFilters('Test Airline', '100');
      
      // Verify values
      await flightsPage.verifySearchFilterValues('Test Airline', '100');
      
      // Clear filters
      await flightsPage.clearSearchFilters();
      
      // Verify cleared
      await flightsPage.verifySearchFiltersCleared();
    });
  });

  test.describe('Customers Page', () => {
    let customersPage: CustomersPage;

    test.beforeEach(async ({ page }) => {
      customersPage = new CustomersPage(page);
      await customersPage.navigateToCustomers();
    });

    test('should display customers page title', async ({ page }) => {
      await customersPage.verifyPageTitle();
    });

    test('should display add customer form', async ({ page }) => {
      await customersPage.verifyAddCustomerFormFields();
    });

    test('should display search customer form', async ({ page }) => {
      await customersPage.verifySearchCustomerForm();
    });

    test('should fill customer form fields', async ({ page }) => {
      const name = 'Test Customer ' + Date.now();
      const email = `test${Date.now()}@example.com`;
      
      await customersPage.fillAddCustomerForm(name, email);
      
      await customersPage.verifyFormFieldValue('name', name);
      await customersPage.verifyFormFieldValue('email', email);
    });
  });

  test.describe('Bookings Page', () => {
    let bookingsPage: BookingsPage;

    test.beforeEach(async ({ page }) => {
      bookingsPage = new BookingsPage(page);
      await bookingsPage.navigateToBookings();
    });

    test('should display bookings page title', async ({ page }) => {
      await bookingsPage.verifyPageTitle();
    });

    test('should display create booking form', async ({ page }) => {
      await bookingsPage.verifyCreateBookingFormFields();
    });

    test('should select a date for booking', async ({ page }) => {
      const tomorrow = bookingsPage.getTomorrowDate();
      
      await bookingsPage.selectDate(tomorrow);
      await bookingsPage.verifySelectedDate(tomorrow);
    });

    test('should fill customer ID for booking', async ({ page }) => {
      await bookingsPage.fillCustomerId('1');
      await bookingsPage.verifyCustomerId('1');
    });
  });

  test.describe('Reports Page', () => {
    let reportsPage: ReportsPage;

    test.beforeEach(async ({ page }) => {
      reportsPage = new ReportsPage(page);
      await reportsPage.navigateToReports();
    });

    test('should display reports page title', async ({ page }) => {
      await reportsPage.verifyPageTitle();
    });

    test('should display filter form elements', async ({ page }) => {
      await reportsPage.verifyFilterFormElements();
    });

    test('should set date range filters', async ({ page }) => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      await reportsPage.setDateRangeFilters(startDate, endDate);
      await reportsPage.verifyDateRangeFilters(startDate, endDate);
    });

    test('should display dashboard cards', async ({ page }) => {
      await reportsPage.verifyDashboardCards();
    });
  });
}); 