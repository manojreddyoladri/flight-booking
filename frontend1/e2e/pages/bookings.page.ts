import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class BookingsPage extends BasePage {
  // Locators - Create Booking Form
  private readonly selectedDateInput = this.page.locator('#selectedDate');
  private readonly flightIdSelect = this.page.locator('#flightId');
  private readonly customerIdInput = this.page.locator('#customerId');
  private readonly priceInput = this.page.locator('#price');
  private readonly createBookingButton = this.page.locator('button:has-text("Create Booking")');

  // Locators - Search Section
  private readonly searchCustomerIdInput = this.page.locator('input[placeholder="Enter Customer ID"]');
  private readonly searchButton = this.page.locator('button:has-text("Search Bookings")');

  // Locators - Page Elements
  private readonly pageTitle = this.page.locator('h2:has-text("Booking Management")');
  private readonly flightsTable = this.page.locator('.table-responsive table');
  private readonly customerBookingsSection = this.page.locator('.card:has-text("Customer Bookings")');
  private readonly warningAlert = this.page.locator('.alert-warning');
  private readonly successAlert = this.page.locator('.alert-success');
  private readonly errorAlert = this.page.locator('.alert-danger');

  /**
   * Navigate to bookings page and wait for it to load
   */
  async navigateToBookings(): Promise<void> {
    await this.navigateTo('/bookings');
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
    // Wait for the page title to be visible
    await this.pageTitle.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Verify page title is displayed
   */
  async verifyPageTitle(): Promise<void> {
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify all required form fields are visible
   */
  async verifyCreateBookingFormFields(): Promise<void> {
    await expect(this.selectedDateInput).toBeVisible();
    await expect(this.flightIdSelect).toBeVisible();
    await expect(this.customerIdInput).toBeVisible();
    await expect(this.priceInput).toBeVisible();
    await expect(this.createBookingButton).toBeVisible();
  }

  /**
   * Select a date and trigger change event
   */
  async selectDate(dateString: string): Promise<void> {
    await this.selectedDateInput.fill(dateString);
    await this.selectedDateInput.dispatchEvent('change');
    
    // Give Angular time to process the change
    await this.page.waitForTimeout(500);
  }

  /**
   * Wait for flights to be loaded in dropdown
   */
  async waitForFlightsToLoad(timeout: number = 15000): Promise<void> {
    await expect.poll(async () => {
      const options = await this.flightIdSelect.locator('option').count();
      return options > 1; // More than just "Select Flight"
    }, { 
      timeout,
      message: 'Flights failed to load in dropdown within timeout'
    }).toBe(true);
  }

  /**
   * Fill customer ID field
   */
  async fillCustomerId(customerId: string): Promise<void> {
    await this.customerIdInput.fill(customerId);
  }

  /**
   * Select flight by ID value and wait for price auto-fill
   */
  async selectFlightByValue(flightValue: string): Promise<void> {
    await this.flightIdSelect.selectOption(flightValue);
    
    // Wait for price to be auto-filled
    await expect.poll(async () => {
      const price = await this.priceInput.inputValue();
      return price !== '' && price !== '0';
    }, { 
      timeout: 5000,
      message: 'Price was not auto-filled after flight selection'
    }).toBe(true);
  }

  /**
   * Fill complete booking form
   */
  async fillCreateBookingForm(
    selectedDate: string, 
    customerId: string, 
    flightId?: string
  ): Promise<void> {
    await this.selectDate(selectedDate);
    await this.waitForFlightsToLoad();
    
    await this.fillCustomerId(customerId);
    
    if (flightId) {
      await this.selectFlightByValue(flightId);
    }
  }

  /**
   * Submit booking form and wait for completion
   */
  async submitCreateBookingForm(): Promise<void> {
    await this.waitForBookingButtonEnabled();
    await this.createBookingButton.click();
    
    // Wait for form submission to complete
    await this.page.waitForTimeout(2000);
  }

  /**
   * Complete booking creation flow
   */
  async createBooking(
    selectedDate: string, 
    customerId: string, 
    flightId?: string
  ): Promise<void> {
    await this.fillCreateBookingForm(selectedDate, customerId, flightId);
    await this.submitCreateBookingForm();
  }

  /**
   * Verify booking form is reset to initial state
   */
  async verifyCreateBookingFormReset(): Promise<void> {
    await expect(this.customerIdInput).toHaveValue('');
    await expect(this.flightIdSelect).toHaveValue('');
    await expect(this.priceInput).toHaveValue('');
  }

  /**
   * Get available flight options from dropdown (excluding default option)
   */
  async getAvailableFlightOptions(): Promise<string[]> {
    const options = await this.flightIdSelect.locator('option').allTextContents();
    return options.filter(option => 
      option.trim() !== '' && 
      !option.toLowerCase().includes('select flight')
    );
  }

  /**
   * Get form field value by field ID
   */
  async getFormFieldValue(fieldId: string): Promise<string> {
    return await this.page.locator(`#${fieldId}`).inputValue();
  }

  /**
   * Check if form field is visible
   */
  async isFormFieldVisible(fieldId: string): Promise<boolean> {
    return await this.page.locator(`#${fieldId}`).isVisible();
  }

  /**
   * Search for customer bookings
   */
  async searchCustomerBookings(customerId: string): Promise<void> {
    await expect(this.searchCustomerIdInput).toBeVisible({ timeout: 5000 });
    await this.searchCustomerIdInput.fill(customerId);
    
    await expect(this.searchButton).toBeVisible();
    await this.searchButton.click();
    
    // Wait for search results to load
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get count of customer bookings displayed
   */
  async getCustomerBookingsCount(): Promise<number> {
    try {
      await expect(this.customerBookingsSection).toBeVisible({ timeout: 5000 });
      const bookingRows = this.customerBookingsSection.locator('tbody tr');
      return await bookingRows.count();
    } catch {
      return 0; // No bookings found
    }
  }

  /**
   * Get flight row by airline name
   */
  getFlightRowByAirline(airlineName: string): Locator {
    return this.flightsTable.locator('tbody tr').filter({ hasText: airlineName });
  }

  /**
   * Get available seats count for a specific flight
   */
  async getAvailableSeatsForFlight(airlineName: string): Promise<number> {
    const flightRow = this.getFlightRowByAirline(airlineName);
    await expect(flightRow).toBeVisible({ timeout: 10000 });
    
    const rowText = await flightRow.textContent();
    const seatsMatch = rowText?.match(/(\d+)\s*Available/);
    return seatsMatch ? parseInt(seatsMatch[1]) : 0;
  }

  /**
   * Check if warning alert is visible
   */
  async isWarningVisible(): Promise<boolean> {
    try {
      await expect(this.warningAlert).toBeVisible({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if success alert is visible
   */
  async isSuccessVisible(): Promise<boolean> {
    try {
      await expect(this.successAlert).toBeVisible({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if error alert is visible
   */
  async isErrorVisible(): Promise<boolean> {
    try {
      await expect(this.errorAlert).toBeVisible({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for booking button to be enabled
   */
  async waitForBookingButtonEnabled(timeout: number = 10000): Promise<void> {
    await expect(this.createBookingButton).toBeEnabled({ timeout });
  }

  /**
   * Check if booking button is enabled
   */
  async isBookingButtonEnabled(): Promise<boolean> {
    return await this.createBookingButton.isEnabled();
  }

  /**
   * Cancel a booking (handles confirmation dialog)
   */
  async cancelBooking(bookingId: number): Promise<void> {
    // Set up dialog handler before clicking
    this.page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure');
      await dialog.accept();
    });

    const cancelButton = this.customerBookingsSection
      .locator('tbody tr')
      .first()
      .locator('button:has-text("Cancel")');
    
    await cancelButton.click();
    
    // Wait for cancellation to complete
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verify selected date value
   */
  async verifySelectedDate(expectedDate: string): Promise<void> {
    await expect(this.selectedDateInput).toHaveValue(expectedDate);
  }

  /**
   * Verify customer ID value
   */
  async verifyCustomerId(expectedCustomerId: string): Promise<void> {
    await expect(this.customerIdInput).toHaveValue(expectedCustomerId);
  }

  /**
   * Get tomorrow's date in YYYY-MM-DD format
   */
  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  /**
   * Get future date in YYYY-MM-DD format
   */
  getFutureDate(daysFromNow: number): string {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);
    return futureDate.toISOString().split('T')[0];
  }

  /**
   * Get yesterday's date in YYYY-MM-DD format
   */
  getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  /**
   * Take screenshot for debugging
   */
  async takeBookingFormScreenshot(name: string): Promise<void> {
    await this.takeScreenshot(name);
  }

  /**
   * Wait for any loading to complete
   */
  async waitForLoadingComplete(timeout: number = 10000): Promise<void> {
    // Wait for any loading spinners to disappear
    const loadingSpinner = this.page.locator('.loading-spinner, .spinner-border');
    try {
      await expect(loadingSpinner).toBeHidden({ timeout });
    } catch {
      // No loading spinner found, which is fine
    }
  }

  /**
   * Get all flights displayed in the table
   */
  async getAllFlightsFromTable(): Promise<string[]> {
    const flightRows = this.flightsTable.locator('tbody tr');
    const count = await flightRows.count();
    const flights: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const rowText = await flightRows.nth(i).textContent();
      if (rowText) {
        flights.push(rowText.trim());
      }
    }
    
    return flights;
  }

  /**
   * Verify no flights are displayed
   */
  async verifyNoFlightsDisplayed(): Promise<void> {
    const flightRows = this.flightsTable.locator('tbody tr');
    const count = await flightRows.count();
    expect(count).toBe(0);
  }
}