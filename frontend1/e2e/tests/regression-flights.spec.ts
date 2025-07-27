import { test, expect, request } from '@playwright/test';
import { FlightsPage } from '../pages/flights.page';

function getUniqueFlightData(workerIndex?: number, testIndex?: number) {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  const workerSuffix = workerIndex !== undefined ? `-w${workerIndex}` : '';
  const testSuffix = testIndex !== undefined ? `-t${testIndex}` : '';
  
  return {
    airlineName: `Test Airline ${timestamp}${workerSuffix}${testSuffix}-${randomSuffix}`,
    totalSeats: '100',
    flightDate: '2099-12-31',
    price: '123.45',
    updatedAirlineName: `Updated Airline ${timestamp}${workerSuffix}${testSuffix}-${randomSuffix}`,
    updatedPrice: '150.00',
  };
}

function formatDateToShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${month}/${day}/${year.slice(-2)}`;
}

// Enhanced loading wait with better error handling
async function waitForLoadingToFinish(page: any, timeout = 10000) {
  try {
    await page.waitForSelector('.loading-spinner', { state: 'detached', timeout });
  } catch (error) {
    // If loading spinner doesn't exist, wait a bit for any async operations
    await page.waitForTimeout(1000);
  }
  
  // Additional wait for network requests to complete
  await page.waitForLoadState('networkidle', { timeout: 5000 });
}

// Enhanced cleanup with retry logic and worker isolation
async function cleanupTestFlights(requestContext: any, preserveAirlineNames: string[] = [], workerIndex?: number) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await requestContext.get('http://localhost:8080/api/flights');
      if (!response.ok()) {
        throw new Error(`API request failed: ${response.status()}`);
      }
      
      const flights = await response.json();
      const flightsToDelete = flights.filter((flight: any) => {
        if (!flight.airlineName) return false;
        
        const isTestFlight = flight.airlineName.startsWith('Test Airline') || 
                           flight.airlineName.startsWith('Updated Airline');
        
        const isPreserved = preserveAirlineNames.includes(flight.airlineName);
        
        // If workerIndex is provided, only clean flights from this worker
        const isFromThisWorker = workerIndex === undefined || 
                               flight.airlineName.includes(`-w${workerIndex}`);
        
        return isTestFlight && !isPreserved && isFromThisWorker;
      });
      
      // Delete flights with some delay to avoid overwhelming the API
      for (const flight of flightsToDelete) {
        try {
          await requestContext.delete(`http://localhost:8080/api/flights/${flight.id}`);
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        } catch (deleteError) {
          console.warn(`Failed to delete flight ${flight.id}:`, deleteError);
        }
      }
      
      break; // Success, exit retry loop
    } catch (error) {
      attempt++;
      console.warn(`Cleanup attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        console.error('Failed to cleanup test flights after maximum retries');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
      }
    }
  }
}

// Helper to wait for element with retry logic
async function waitForElementWithRetry(page: any, selector: string, options: any = {}, maxRetries = 5) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector, { timeout: 2000, ...options });
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(500);
    }
  }
  
  throw lastError;
}

test.describe('Regression: Flight Management', () => {
  test.beforeEach(async ({ request }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    await cleanupTestFlights(request, [], workerIndex);
    
    // Additional wait to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test.afterEach(async ({ request }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    await cleanupTestFlights(request, [], workerIndex);
  });

  test('should load flights page and display seeded flight', async ({ page }, testInfo) => {
    const flightsPage = new FlightsPage(page);
    const data = getUniqueFlightData(testInfo.workerIndex, 0);
    
    await flightsPage.navigateToFlights();
    await waitForLoadingToFinish(page);
    await flightsPage.verifyPageTitle();
    
    // Create a future flight first so there's something to display
    await flightsPage.addFlight(data.airlineName, data.totalSeats, data.flightDate, data.price);
    await waitForLoadingToFinish(page);
    
    // Wait for table to load and verify the created flight appears
    await waitForElementWithRetry(page, 'tbody tr');
    await expect(page.locator('tr', { hasText: data.airlineName })).toBeVisible();
    
    // Also verify that the page loads correctly with flights
    const formattedDate = formatDateToShortDate(data.flightDate);
    await expect(page.locator('tr', { hasText: data.airlineName }).filter({ hasText: formattedDate })).toBeVisible();
  });

  test('should add a new flight and verify it appears in the table', async ({ page }, testInfo) => {
    const flightsPage = new FlightsPage(page);
    const data = getUniqueFlightData(testInfo.workerIndex, 1);
    
    await flightsPage.navigateToFlights();
    await waitForLoadingToFinish(page);
    
    await flightsPage.addFlight(data.airlineName, data.totalSeats, data.flightDate, data.price);
    await waitForLoadingToFinish(page);
    
    const formattedDate = formatDateToShortDate(data.flightDate);
    
    // Wait for the row to appear with retry logic
    let flightId;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        const row = page.locator('tr', { hasText: data.airlineName }).filter({ hasText: formattedDate });
        await expect(row).toBeVisible({ timeout: 3000 });
        flightId = await row.locator('td').first().textContent();
        if (flightId) break;
      } catch (e) {
        attempts++;
        if (attempts === maxAttempts) {
          const allRows = await page.locator('tbody tr').allTextContents();
          console.log('All table rows after add:', allRows);
          await page.screenshot({ path: `test-results/flights-add-debug-worker-${testInfo.workerIndex}.png` });
          throw new Error(`Flight not found after ${maxAttempts} attempts: ${e}`);
        }
        await page.waitForTimeout(500);
      }
    }
    
    if (!flightId) throw new Error('Flight ID not found');
    expect(flightId).toBeTruthy();
    
    const strictRow = page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${flightId}")`) });
    await expect(strictRow).toBeVisible({ timeout: 7000 });
  });

  test('should search for a flight by airline name', async ({ page }, testInfo) => {
    const flightsPage = new FlightsPage(page);
    const data = getUniqueFlightData(testInfo.workerIndex, 2);
    const formattedDate = formatDateToShortDate(data.flightDate);

    await flightsPage.navigateToFlights();
    await waitForLoadingToFinish(page);
    
    await flightsPage.addFlight(data.airlineName, data.totalSeats, data.flightDate, data.price);
    await waitForLoadingToFinish(page);

    // Wait for flight to be added before searching
    await page.waitForTimeout(1000);
    
    await flightsPage.fillSearchFilters(data.airlineName);
    await waitForLoadingToFinish(page);

    // Enhanced search verification with retry
    let found = false;
    for (let attempt = 0; attempt < 15; attempt++) {
      const allRows = await page.locator('tbody tr').allTextContents();
      const matchingRows = allRows.filter(row => 
        row.includes(data.airlineName) && row.includes(formattedDate)
      );
      
      if (matchingRows.length > 0) {
        found = true;
        break;
      }
      
      if (attempt === 14) {
        console.log('All table rows after search (worker ${testInfo.workerIndex}):', allRows);
        await page.screenshot({ path: `test-results/flights-search-debug-worker-${testInfo.workerIndex}.png` });
      }
      
      await page.waitForTimeout(500);
    }
    
    if (!found) {
      throw new Error('Unique matching row for search not found');
    }

    // Find and verify the specific row
    const allRows = page.locator('tbody tr');
    const rowCount = await allRows.count();
    let matchedRow = null;
    let flightId = null;
    
    for (let i = 0; i < rowCount; i++) {
      const row = allRows.nth(i);
      const text = await row.textContent();
      if (text?.includes(data.airlineName) && text.includes(formattedDate)) {
        flightId = (await row.locator('td').first().textContent())?.trim();
        matchedRow = row;
        break;
      }
    }
    
    if (!matchedRow || !flightId) {
      throw new Error('Unique matching row for search not found');
    }
    
    const strictRow = page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${flightId}")`) });
    await expect(strictRow).toBeVisible({ timeout: 10000 });
    await expect(strictRow).toHaveText(new RegExp(data.airlineName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), { timeout: 10000 });
    await expect(strictRow).toHaveText(new RegExp(formattedDate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), { timeout: 10000 });
  });

  test('should update a flight and verify the update', async ({ page }, testInfo) => {
    const data = getUniqueFlightData(testInfo.workerIndex, 3);
    const formattedDate = formatDateToShortDate(data.flightDate);
    const browserName = testInfo.project.name;

    await page.goto('http://localhost:4200/flights');
    await waitForLoadingToFinish(page);

    // Add a flight
    await page.getByLabel('Airline Name').fill(data.airlineName);
    await page.getByLabel('Total Seats').fill(data.totalSeats);
    await page.getByLabel('Flight Date').fill(data.flightDate);
    await page.locator('#price').fill(data.price);
    
    const submitButton = page.locator('button[type="submit"]:visible, button:has-text("Submit"):visible').first();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    await waitForLoadingToFinish(page);

    // Firefox needs extra time for DOM updates
    if (browserName === 'firefox') {
      await page.waitForTimeout(2000);
    } else {
      await page.waitForTimeout(1000);
    }

    // Find the row with retry logic
    let newRow;
    let flightId;
    const maxAddAttempts = browserName === 'firefox' ? 15 : 10;
    
    for (let attempt = 0; attempt < maxAddAttempts; attempt++) {
      try {
        // Clear any existing search filters first
        await page.locator('#searchAirline').fill('');
        await page.waitForTimeout(200);
        
        newRow = page.locator('tbody tr', { hasText: data.airlineName });
        await expect(newRow).toBeVisible({ timeout: 3000 });
        
        const rowText = await newRow.textContent();
        flightId = rowText?.match(/^(\d+)/)?.[1];
        
        if (flightId) break;
      } catch (e) {
        if (attempt === maxAddAttempts - 1) {
          const allRows = await page.locator('tbody tr').allTextContents();
          console.log(`All table rows after add (update test, ${browserName}, worker ${testInfo.workerIndex}):`, allRows);
          throw e;
        }
        await page.waitForTimeout(browserName === 'firefox' ? 800 : 500);
      }
    }
    
    expect(flightId).toBeDefined();

    // Click Edit for that row
    if (!newRow) {
      throw new Error('Flight row not found for editing');
    }
    await newRow.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByLabel('Airline Name')).toBeVisible();
    await waitForLoadingToFinish(page);

    // Firefox-specific form clearing and filling
    if (browserName === 'firefox') {
      // Clear fields completely in Firefox
      await page.getByLabel('Airline Name').selectText();
      await page.getByLabel('Airline Name').press('Delete');
      await page.locator('#price').selectText();
      await page.locator('#price').press('Delete');
      await page.waitForTimeout(300);
    }

    // Update values
    await page.getByLabel('Airline Name').fill(data.updatedAirlineName);
    await page.locator('#price').fill(data.updatedPrice);

    const submitButtonEdit = page.locator('button[type="submit"]:visible, button:has-text("Submit"):visible').first();
    await expect(submitButtonEdit).toBeVisible({ timeout: 5000 });
    await expect(submitButtonEdit).toBeEnabled();
    await submitButtonEdit.click();
    await waitForLoadingToFinish(page);

    // Firefox needs extra time for update operations
    if (browserName === 'firefox') {
      await page.waitForTimeout(3000);
      // Force a page refresh in Firefox to ensure DOM is updated
      await page.reload();
      await waitForLoadingToFinish(page);
    } else {
      await page.waitForTimeout(1000);
    }

    // Verify update with enhanced retry logic for Firefox
    let updatedFlightId = null;
    const maxUpdateAttempts = browserName === 'firefox' ? 20 : 15;
    
    for (let attempt = 0; attempt < maxUpdateAttempts; attempt++) {
      // Clear search filters to ensure we see all flights
      try {
        await page.locator('#searchAirline').fill('');
        await page.waitForTimeout(200);
      } catch (e) {
        // Ignore if search field not available
      }
      
      const allRows = page.locator('tbody tr');
      const rowCount = await allRows.count();
      
      for (let i = 0; i < rowCount; i++) {
        const row = allRows.nth(i);
        const text = await row.textContent();
        if (text?.includes(data.updatedAirlineName) && text.includes(formattedDate)) {
          updatedFlightId = (await row.locator('td').first().textContent())?.trim();
          break;
        }
      }
      
      if (updatedFlightId) break;
      
      if (attempt === maxUpdateAttempts - 1) {
        const debug = await page.locator('tbody tr').allTextContents();
        console.log(`All table rows after update (${browserName}, worker ${testInfo.workerIndex}):`, debug);
        console.log(`Looking for: ${data.updatedAirlineName} and ${formattedDate}`);
        await page.screenshot({ path: `test-results/flights-update-debug-${browserName}-worker-${testInfo.workerIndex}.png` });
      }
      
      await page.waitForTimeout(browserName === 'firefox' ? 800 : 500);
    }
    
    if (!updatedFlightId) {
      throw new Error(`Updated row for airline not found after refresh in ${browserName}`);
    }
    
    const strictRow = page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${updatedFlightId}")`) });
    await expect(strictRow).toBeVisible({ timeout: 15000 });
    await expect(strictRow).toHaveText(new RegExp(data.updatedAirlineName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), { timeout: 15000 });
    await expect(strictRow).toHaveText(new RegExp(data.updatedPrice.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), { timeout: 15000 });
  });

  test('should delete a flight and verify it is removed', async ({ page }, testInfo) => {
    const flightsPage = new FlightsPage(page);
    const data = getUniqueFlightData(testInfo.workerIndex, 4);
    
    await flightsPage.navigateToFlights();
    await waitForLoadingToFinish(page);
    
    await flightsPage.addFlight(data.airlineName, data.totalSeats, data.flightDate, data.price);
    await waitForLoadingToFinish(page);
    
    // Wait for flight to be added
    await page.waitForTimeout(1000);
    
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
      console.log(`All table rows before delete (worker ${testInfo.workerIndex}):`, allRows);
      await page.screenshot({ path: `test-results/flights-delete-debug-worker-${testInfo.workerIndex}.png` });
      throw e;
    }
    
    if (!flightId) throw new Error('Flight ID not found');
    expect(flightId).toBeTruthy();
    
    const strictRow = page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${flightId}")`) });
    
    page.once('dialog', dialog => dialog.accept());
    await strictRow.locator('button:has-text("Delete")').first().click();
    await waitForLoadingToFinish(page);
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    await flightsPage.fillSearchFilters(data.airlineName);
    await waitForLoadingToFinish(page);
    
    await expect(page.locator('tr').filter({ has: page.locator(`td:first-child:text-is("${flightId}")`) })).toHaveCount(0, { timeout: 10000 });
  });

  test('should clear search filters', async ({ page }) => {
    const flightsPage = new FlightsPage(page);
    await flightsPage.navigateToFlights();
    await waitForLoadingToFinish(page);
    
    await flightsPage.fillSearchFilters('Delta Airlines', '299.99');
    await flightsPage.clearSearchFilters();
    await flightsPage.verifySearchFiltersCleared();
  });
});