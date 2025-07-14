import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class BookingsPage extends BasePage {
  // Locators - Create Booking Form
  private selectedDateInput = this.page.locator('#selectedDate');
  private flightIdSelect = this.page.locator('#flightId');
  private customerIdInput = this.page.locator('#customerId');
  private createBookingButton = this.page.locator('text=Create Booking');

  // Locators - Page Elements
  private pageTitle = this.page.locator('h2');

  /**
   * Navigate to bookings page
   */
  async navigateToBookings() {
    await this.navigateTo('/bookings');
  }

  /**
   * Verify page title
   */
  async verifyPageTitle() {
    await expect(this.pageTitle).toContainText('Booking Management');
  }

  /**
   * Check if create booking form fields are visible
   */
  async verifyCreateBookingFormFields() {
    await expect(this.selectedDateInput).toBeVisible();
    await expect(this.flightIdSelect).toBeVisible();
    await expect(this.customerIdInput).toBeVisible();
  }

  /**
   * Fill create booking form
   */
  async fillCreateBookingForm(selectedDate: string, customerId: string, flightId?: string) {
    await this.selectedDateInput.fill(selectedDate);
    await this.customerIdInput.fill(customerId);
    
    if (flightId) {
      await this.flightIdSelect.selectOption(flightId, { force: true });
    }
  }

  /**
   * Submit create booking form
   */
  async submitCreateBookingForm() {
    await this.createBookingButton.click();
  }

  /**
   * Create a new booking (complete flow)
   */
  async createBooking(selectedDate: string, customerId: string, flightId?: string) {
    await this.fillCreateBookingForm(selectedDate, customerId, flightId);
    await this.submitCreateBookingForm();
  }

  /**
   * Verify create booking form is reset
   */
  async verifyCreateBookingFormReset() {
    await expect(this.customerIdInput).toHaveValue('');
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
   * Get a future date in YYYY-MM-DD format
   */
  getFutureDate(daysFromNow: number): string {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);
    return futureDate.toISOString().split('T')[0];
  }

  /**
   * Select a date for booking
   */
  async selectDate(dateString: string) {
    await this.selectedDateInput.fill(dateString);
  }

  /**
   * Verify selected date
   */
  async verifySelectedDate(expectedDate: string) {
    await expect(this.selectedDateInput).toHaveValue(expectedDate);
  }

  /**
   * Fill customer ID for booking
   */
  async fillCustomerId(customerId: string) {
    await this.customerIdInput.fill(customerId);
  }

  /**
   * Verify customer ID
   */
  async verifyCustomerId(expectedCustomerId: string) {
    await expect(this.customerIdInput).toHaveValue(expectedCustomerId);
  }

  /**
   * Get available flight options
   */
  async getAvailableFlightOptions(): Promise<string[]> {
    const options = await this.flightIdSelect.locator('option').allTextContents();
    return options.filter(option => option.trim() !== '');
  }

  /**
   * Select flight by option text
   */
  async selectFlightByText(flightText: string) {
    await this.flightIdSelect.selectOption({ label: flightText });
  }

  /**
   * Select flight by value
   */
  async selectFlightByValue(flightValue: string) {
    await this.flightIdSelect.selectOption(flightValue);
  }

  /**
   * Get form field value
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
   * Take screenshot of booking form
   */
  async takeBookingFormScreenshot(name: string) {
    await this.takeScreenshot(name);
  }
} 