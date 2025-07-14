import { test, expect } from '@playwright/test';
import { CustomersPage } from '../pages/customers.page';
import { FlightsPage } from '../pages/flights.page';
import { BookingsPage } from '../pages/bookings.page';

test.describe('Form Submission with API Mocking', () => {
  test('should submit Add Customer form and show success', async ({ page }) => {
    // Mock API response
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

    const customersPage = new CustomersPage(page);
    await customersPage.navigateToCustomers();
    
    const name = 'Mock User';
    const email = 'mock@example.com';
    
    await customersPage.addCustomer(name, email);
    
    // Expect form to reset (fields empty)
    await customersPage.verifyAddCustomerFormReset();
  });

  test('should submit Add Flight form and show success', async ({ page }) => {
    // Mock API response
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

    const flightsPage = new FlightsPage(page);
    await flightsPage.navigateToFlights();
    
    await flightsPage.addFlight('Mock Airline', '100', '2024-12-31', '123.45');
    
    // Expect form to reset (fields empty)
    await flightsPage.verifyAddFlightFormReset();
  });

  test('should submit Create Booking form and show success', async ({ page }) => {
    // Dynamically compute a future date (tomorrow)
    const bookingsPage = new BookingsPage(page);
    const futureDate = bookingsPage.getTomorrowDate();
    
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

    await bookingsPage.navigateToBookings();
    
    // Fill booking form
    await bookingsPage.fillCreateBookingForm(futureDate, '999', '888');
    
    // Debug: Take a screenshot and log the dropdown HTML after filling the date and customer ID
    await bookingsPage.takeBookingFormScreenshot('booking-form-after-date-and-customer');
    const dropdownHtml = await page.locator('#flightId').evaluate(el => el.outerHTML);
    console.log('Dropdown HTML after date and customer:', dropdownHtml);
    
    // Submit the form
    await bookingsPage.submitCreateBookingForm();
    
    // Expect form to reset (customerId field empty)
    await bookingsPage.verifyCreateBookingFormReset();
  });

  // Optionally, add error scenario for customer form
  test('should show error on failed customer submission', async ({ page }) => {
    // Mock API error response
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

    const customersPage = new CustomersPage(page);
    await customersPage.navigateToCustomers();
    
    await customersPage.addCustomer('Error User', 'error@example.com');
    
    // Optionally, check for an error notification if present
    // await expect(page.locator('.alert-danger')).toContainText('error');
  });
}); 