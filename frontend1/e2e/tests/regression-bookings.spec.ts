import { test, expect, request, APIRequestContext } from '@playwright/test';
import { BookingsPage } from '../pages/bookings.page';

const TEST_RUN_ID = `E2E-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

function getUniqueCustomerId() {
  return Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
}

async function createTestCustomer(requestContext: APIRequestContext) {
  const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
  const customer = {
    name: `Test Customer ${TEST_RUN_ID} - ${unique}`,
    email: `test${unique}@example.com`
  };
  const response = await requestContext.post('http://localhost:8080/api/customers', { data: customer });
  const data = await response.json();
  return data;
}

async function createTestFlight(requestContext: APIRequestContext, flightDate: string, availableSeats: number = 100) {
  const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
  const flight = {
    airlineName: `Test Airline ${TEST_RUN_ID} - ${unique}`,
    totalSeats: availableSeats,
    flightDate,
    price: 123.45
  };
  const response = await requestContext.post('http://localhost:8080/api/flights', { data: flight });
  const data = await response.json();
  return data;
}

async function cleanupTestFlights(requestContext: APIRequestContext) {
  let attempts = 0;
  const maxAttempts = 5;
  while (attempts < maxAttempts) {
    const response = await requestContext.get('http://localhost:8080/api/flights');
    const flights = await response.json();
    const testFlights = flights.filter((flight: any) => flight.airlineName && flight.airlineName.includes(TEST_RUN_ID));
    if (testFlights.length === 0) break;
    for (const flight of testFlights) {
      await requestContext.delete(`http://localhost:8080/api/flights/${flight.id}`);
    }
    attempts++;
    if (testFlights.length > 0) {
      await new Promise(res => setTimeout(res, 500));
    }
  }
}

async function cleanupTestCustomers(requestContext: APIRequestContext) {
  let attempts = 0;
  const maxAttempts = 5;
  while (attempts < maxAttempts) {
    const response = await requestContext.get('http://localhost:8080/api/customers');
    const customers = await response.json();
    const testCustomers = customers.filter((customer: any) => customer.name && customer.name.includes(TEST_RUN_ID));
    if (testCustomers.length === 0) break;
    for (const customer of testCustomers) {
      await requestContext.delete(`http://localhost:8080/api/customers/${customer.id}`);
    }
    attempts++;
    if (testCustomers.length > 0) {
      await new Promise(res => setTimeout(res, 500));
    }
  }
}

async function cleanupTestBookings(requestContext: APIRequestContext) {
  // Clean up any bookings that might be left from previous test runs
  const response = await requestContext.get('http://localhost:8080/api/bookings');
  const bookings = await response.json();
  for (const booking of bookings) {
    try {
      await requestContext.delete(`http://localhost:8080/api/bookings/${booking.id}`);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

test.describe('Regression: Booking Management', () => {
  const FAR_FUTURE_DATE = '2099-12-31';
  let testCustomer: any;
  let testFlight: any;

  test.beforeEach(async ({ request }) => {
    // Clean up in order: bookings first, then flights, then customers
    await cleanupTestBookings(request);
    await cleanupTestFlights(request);
    await cleanupTestCustomers(request);
    
    testCustomer = await createTestCustomer(request);
    testFlight = await createTestFlight(request, FAR_FUTURE_DATE);

    // Verify flight was created
    const flightsByDateResponse = await request.get(`http://localhost:8080/api/flights/by-date?date=${FAR_FUTURE_DATE}`);
    const flightsByDate = await flightsByDateResponse.json();
    console.log('Flights created for test date:', flightsByDate);
  });

  test.afterEach(async ({ request }) => {
    // Clean up after each test
    await cleanupTestBookings(request);
    await cleanupTestFlights(request);
    await cleanupTestCustomers(request);
  });

  test('should load bookings page and display booking form', async ({ page }) => {
    const bookingsPage = new BookingsPage(page);
    await bookingsPage.navigateToBookings();
    
    // Wait for page to load
    await expect(page.locator('h2')).toContainText('Booking Management');
    
    // Select date and wait for flights to load
    await bookingsPage.selectDate(FAR_FUTURE_DATE);
    
    // Wait for flights to be populated in dropdown
    await expect.poll(async () => {
      const options = await page.locator('#flightId option').count();
      return options > 1; // More than just the default "Select Flight" option
    }, { timeout: 10000 }).toBe(true);
    
    // Check that the booking form fields are visible
    await expect(page.locator('#selectedDate')).toBeVisible();
    await expect(page.locator('#customerId')).toBeVisible();
    await expect(page.locator('#flightId')).toBeVisible();
    await expect(page.locator('#price')).toBeVisible();
  });

  test('should not allow booking for past dates', async ({ page }) => {
    const bookingsPage = new BookingsPage(page);
    await bookingsPage.navigateToBookings();
    
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    await bookingsPage.selectDate(yesterday);
    
    // Wait for the warning message or empty flight list
    await page.waitForTimeout(1000);
    
    // Should show warning message
    await expect(page.locator('.alert-warning')).toBeVisible();
    
    // Should have no flight options except the default
    const options = await page.locator('#flightId option').count();
    expect(options).toBeLessThanOrEqual(1); // Only default option or none
  });

  test('should auto-fill price when flight is selected', async ({ page }) => {
    const bookingsPage = new BookingsPage(page);
    await bookingsPage.navigateToBookings();
    await bookingsPage.selectDate(FAR_FUTURE_DATE);
    
    // Wait for flights to load
    await expect.poll(async () => {
      const options = await page.locator('#flightId option').count();
      return options > 1;
    }, { timeout: 10000 }).toBe(true);
    
    // Select the test flight
    await page.locator('#flightId').selectOption(testFlight.id.toString());
    
    // Wait for price to be auto-filled
    await expect.poll(async () => {
      const price = await page.locator('#price').inputValue();
      return price !== '';
    }, { timeout: 5000 }).toBe(true);
    
    const price = await page.locator('#price').inputValue();
    expect(parseFloat(price)).toBe(testFlight.price);
  });

  test('should reset form after successful booking', async ({ page }) => {
    const bookingsPage = new BookingsPage(page);
    await bookingsPage.navigateToBookings();
    await bookingsPage.selectDate(FAR_FUTURE_DATE);
    
    // Wait for flights to load
    await expect.poll(async () => {
      const options = await page.locator('#flightId option').count();
      return options > 1;
    }, { timeout: 10000 }).toBe(true);
    
    // Fill the form
    await page.locator('#customerId').fill(testCustomer.id.toString());
    await page.locator('#flightId').selectOption(testFlight.id.toString());
    
    // Wait for form to be valid
    await expect.poll(async () => {
      const isEnabled = await page.locator('button:has-text("Create Booking")').isEnabled();
      return isEnabled;
    }, { timeout: 5000 }).toBe(true);
    
    // Submit the form
    await page.locator('button:has-text("Create Booking")').click();
    
    // Wait for success notification or form reset
    await page.waitForTimeout(2000);
    
    // Verify form is reset
    await expect(page.locator('#customerId')).toHaveValue('');
    await expect(page.locator('#flightId')).toHaveValue('');
    await expect(page.locator('#price')).toHaveValue('');
  });

  test('should update flight availability after booking', async ({ page, request }) => {
    const bookingsPage = new BookingsPage(page);
    await bookingsPage.navigateToBookings();
    await bookingsPage.selectDate(FAR_FUTURE_DATE);
    
    // Wait for flights to load
    await expect.poll(async () => {
      const options = await page.locator('#flightId option').count();
      return options > 1;
    }, { timeout: 10000 }).toBe(true);
    
    // Get initial available seats from the flights table
    const flightRow = page.locator('tbody tr').filter({ hasText: testFlight.airlineName });
    await expect(flightRow).toBeVisible();
    
    const beforeText = await flightRow.textContent();
    const beforeSeatsMatch = beforeText?.match(/(\d+)\s*Available/);
    const beforeSeats = beforeSeatsMatch ? parseInt(beforeSeatsMatch[1]) : 0;
    
    console.log('Initial available seats:', beforeSeats);
    
    // Fill and submit booking form
    await page.locator('#customerId').fill(testCustomer.id.toString());
    await page.locator('#flightId').selectOption(testFlight.id.toString());
    
    await expect(page.locator('button:has-text("Create Booking")')).toBeEnabled();
    await page.locator('button:has-text("Create Booking")').click();
    
    // Wait a moment for the booking to be processed
    await page.waitForTimeout(2000);
    
    // Use expect.poll to wait for the seat count to decrease
    await expect.poll(async () => {
      // Find the flight row again (it might have been refreshed)
      const updatedFlightRow = page.locator('tbody tr').filter({ hasText: testFlight.airlineName });
      if (await updatedFlightRow.count() === 0) {
        return false; // Flight row not found yet
      }
      
      const afterText = await updatedFlightRow.textContent();
      const afterSeatsMatch = afterText?.match(/(\d+)\s*Available/);
      const afterSeats = afterSeatsMatch ? parseInt(afterSeatsMatch[1]) : 0;
      
      console.log('Current available seats:', afterSeats, 'Expected to be less than:', beforeSeats);
      
      // Return true if seats decreased, false if still the same
      return afterSeats < beforeSeats;
    }, { 
      timeout: 15000,
      intervals: [1000, 2000, 3000] // Check every 1-3 seconds
    }).toBe(true);
    
    // Additional verification: get the final seat count
    const finalFlightRow = page.locator('tbody tr').filter({ hasText: testFlight.airlineName });
    const finalText = await finalFlightRow.textContent();
    const finalSeatsMatch = finalText?.match(/(\d+)\s*Available/);
    const finalSeats = finalSeatsMatch ? parseInt(finalSeatsMatch[1]) : 0;
    
    console.log('Final available seats:', finalSeats);
    expect(finalSeats).toBeLessThan(beforeSeats);
  });


  test('should handle flight with no available seats', async ({ page, request }) => {
    // Create a flight with 0 seats
    const fullFlight = await createTestFlight(request, FAR_FUTURE_DATE, 0);
    
    const bookingsPage = new BookingsPage(page);
    await bookingsPage.navigateToBookings();
    await bookingsPage.selectDate(FAR_FUTURE_DATE);
    
    // Wait for flights to load
    await page.waitForTimeout(1000);
    
    // The full flight should not appear in the dropdown (since availableSeats = 0)
    // But it should appear in the flights table marked as "Full"
    const fullFlightRow = page.locator('tbody tr').filter({ hasText: fullFlight.airlineName });
    if (await fullFlightRow.count() > 0) {
      await expect(fullFlightRow.locator('.badge')).toContainText('Full');
    }
    
    // The dropdown should only contain flights with available seats
    const dropdownOptions = await page.locator('#flightId option').allTextContents();
    const fullFlightInDropdown = dropdownOptions.some(option => 
      option.includes(fullFlight.airlineName)
    );
    expect(fullFlightInDropdown).toBe(false);
  });
});