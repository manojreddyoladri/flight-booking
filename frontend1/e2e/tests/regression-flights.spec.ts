import { test, expect, request } from '@playwright/test';
import { FlightsPage } from '../pages/flights.page';

function getUniqueFlightData() {
  const timestamp = Date.now();
  return {
    airlineName: `Test Airline ${timestamp}`,
    totalSeats: '100',
    flightDate: '2099-12-31',
    price: '123.45',
    updatedAirlineName: `Updated Airline ${timestamp}`,
    updatedPrice: '150.00',
  };
}

function formatDateToShortDate(isoDate: string): string {
  // Converts 'YYYY-MM-DD' to 'MM/DD/YY' (e.g., '2099-12-31' -> '12/31/99')
  const [year, month, day] = isoDate.split('-');
  return `${month}/${day}/${year.slice(-2)}`;
}

// Helper to wait for the loading spinner to disappear
async function waitForLoadingToFinish(page: any) {
  await page.waitForSelector('.loading-spinner', { state: 'detached', timeout: 10000 });
}

// Helper to clean up test flights before each test
async function cleanupTestFlights(requestContext: any) {
  // Fetch all flights
  const response = await requestContext.get('http://localhost:8080/api/flights');
  const flights = await response.json();
  for (const flight of flights) {
    if (flight.airlineName && flight.airlineName.startsWith('Test Airline')) {
      await requestContext.delete(`http://localhost:8080/api/flights/${flight.id}`);
    }
  }
}

test.describe('Regression: Flight Management', () => {
  test.beforeEach(async ({ request }) => {
    await cleanupTestFlights(request);
  });

  test('should load flights page and display seeded flight', async ({ page }) => {
    const flightsPage = new FlightsPage(page);
    await flightsPage.navigateToFlights();
    await flightsPage.verifyPageTitle();
    await expect(page.locator('tr', { hasText: 'Delta Airlines' })).toBeVisible();
  });

  test('should add a new flight and verify it appears in the table', async ({ page }) => {
    const flightsPage = new FlightsPage(page);
    const data = getUniqueFlightData();
    await flightsPage.navigateToFlights();
    await waitForLoadingToFinish(page);
    await flightsPage.addFlight(data.airlineName, data.totalSeats, data.flightDate, data.price);
    await waitForLoadingToFinish(page);
    const formattedDate = formatDateToShortDate(data.flightDate);
    // Find the row by airline and date, then extract the unique ID
    const row = page.locator('tr', { hasText: data.airlineName }).filter({ hasText: formattedDate });
    let flightId;
    try {
      await expect(row).toBeVisible({ timeout: 7000 });
      flightId = await row.locator('td').first().textContent();
    } catch (e) {
      const allRows = await page.locator('tbody tr').allTextContents();
      console.log('All table rows after add:', allRows);
      await page.screenshot({ path: 'test-results/flights-add-debug.png' });
      throw e;
    }
    if (!flightId) throw new Error('Flight ID not found');
    expect(flightId).toBeTruthy();
    // Now, strictly select the row by ID in the first cell
    const strictRow = page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${flightId}")`) });
    await expect(strictRow).toBeVisible({ timeout: 7000 });
  });

  test('should search for a flight by airline name', async ({ page }) => {
    const flightsPage = new FlightsPage(page);
    const data = getUniqueFlightData();
    await flightsPage.navigateToFlights();
    await waitForLoadingToFinish(page);
    await flightsPage.addFlight(data.airlineName, data.totalSeats, data.flightDate, data.price);
    await waitForLoadingToFinish(page);
    await flightsPage.fillSearchFilters(data.airlineName);
    await waitForLoadingToFinish(page);
    const formattedDate = formatDateToShortDate(data.flightDate);
    const row = page.locator('tr', { hasText: data.airlineName }).filter({ hasText: formattedDate });
    let flightId;
    try {
      await expect(row).toBeVisible({ timeout: 7000 });
      flightId = await row.locator('td').first().textContent();
    } catch (e) {
      const allRows = await page.locator('tbody tr').allTextContents();
      console.log('All table rows after search:', allRows);
      await page.screenshot({ path: 'test-results/flights-search-debug.png' });
      throw e;
    }
    if (!flightId) throw new Error('Flight ID not found');
    // Strictly select the row by ID in the first cell
    const strictRow = page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${flightId}")`) });
    await expect(strictRow).toBeVisible({ timeout: 7000 });
  });

  test('should update a flight and verify the update', async ({ page }) => {
    const flightsPage = new FlightsPage(page);
    const data = getUniqueFlightData();
    await flightsPage.navigateToFlights();
    await waitForLoadingToFinish(page);
    await flightsPage.addFlight(data.airlineName, data.totalSeats, data.flightDate, data.price);
    await waitForLoadingToFinish(page);
    await flightsPage.fillSearchFilters(data.airlineName);
    await waitForLoadingToFinish(page);
    const formattedDate = formatDateToShortDate(data.flightDate);
    const row = page.locator('tr', { hasText: data.airlineName }).filter({ hasText: formattedDate });
    let flightId;
    try {
      flightId = await row.locator('td').first().textContent({ timeout: 7000 });
    } catch (e) {
      const allRows = await page.locator('tbody tr').allTextContents();
      console.log('All table rows before update:', allRows);
      await page.screenshot({ path: 'test-results/flights-update-debug.png' });
      throw e;
    }
    if (!flightId) throw new Error('Flight ID not found');
    expect(flightId).toBeTruthy();
    // Strictly select the row by ID in the first cell
    const strictRow = page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${flightId}")`) });
    await strictRow.locator('button:has-text("Edit")').first().click();
    // Wait for form to be populated
    await expect(page.locator('#airlineName')).toHaveValue(data.airlineName, { timeout: 7000 });
    await expect(page.locator('#totalSeats')).toHaveValue(data.totalSeats);
    await expect(page.locator('#flightDate')).toHaveValue(data.flightDate);
    await expect(page.locator('#price')).toHaveValue(data.price);
    await flightsPage.fillAddFlightForm(data.updatedAirlineName, data.totalSeats, data.flightDate, data.updatedPrice);
    await flightsPage.submitAddFlightForm(true);
    await waitForLoadingToFinish(page);
    await flightsPage.fillSearchFilters(data.updatedAirlineName);
    await waitForLoadingToFinish(page);
    const updatedRow = page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${flightId}")`) });
    try {
      await expect(updatedRow).toBeVisible({ timeout: 7000 });
      await expect(updatedRow).toContainText(data.updatedPrice);
    } catch (e) {
      const allRows = await page.locator('tbody tr').allTextContents();
      console.log('All table rows after update:', allRows);
      await page.screenshot({ path: 'test-results/flights-update-fail-debug.png' });
      throw e;
    }
  });

  test('should delete a flight and verify it is removed', async ({ page }) => {
    const flightsPage = new FlightsPage(page);
    const data = getUniqueFlightData();
    await flightsPage.navigateToFlights();
    await waitForLoadingToFinish(page);
    await flightsPage.addFlight(data.airlineName, data.totalSeats, data.flightDate, data.price);
    await waitForLoadingToFinish(page);
    await flightsPage.fillSearchFilters(data.airlineName);
    await waitForLoadingToFinish(page);
    const formattedDate = formatDateToShortDate(data.flightDate);
    const row = page.locator('tr', { hasText: data.airlineName }).filter({ hasText: formattedDate });
    let flightId;
    try {
      flightId = await row.locator('td').first().textContent({ timeout: 7000 });
    } catch (e) {
      const allRows = await page.locator('tbody tr').allTextContents();
      console.log('All table rows before delete:', allRows);
      await page.screenshot({ path: 'test-results/flights-delete-debug.png' });
      throw e;
    }
    if (!flightId) throw new Error('Flight ID not found');
    expect(flightId).toBeTruthy();
    // Strictly select the row by ID in the first cell
    const strictRow = page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${flightId}")`) });
    page.once('dialog', dialog => dialog.accept());
    await strictRow.locator('button:has-text("Delete")').first().click();
    await waitForLoadingToFinish(page);
    await flightsPage.fillSearchFilters(data.airlineName);
    await waitForLoadingToFinish(page);
    await expect(page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${flightId}")`) })).toHaveCount(0);
  });

  test('should clear search filters', async ({ page }) => {
    const flightsPage = new FlightsPage(page);
    await flightsPage.navigateToFlights();
    await flightsPage.fillSearchFilters('Delta Airlines', '299.99');
    await flightsPage.clearSearchFilters();
    await flightsPage.verifySearchFiltersCleared();
  });
}); 