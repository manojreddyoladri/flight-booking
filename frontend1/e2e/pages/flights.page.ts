import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class FlightsPage extends BasePage {
  // Locators - Search Form
  private searchAirlineInput = this.page.locator('#searchAirline');
  private searchDateInput = this.page.locator('#searchDate');
  private searchPriceInput = this.page.locator('#searchPrice');
  private clearFiltersButton = this.page.locator('.card.mb-4 button:has-text("Clear Filters")').first();

  // Locators - Add Flight Form
  private airlineNameInput = this.page.locator('#airlineName');
  private totalSeatsInput = this.page.locator('#totalSeats');
  private flightDateInput = this.page.locator('#flightDate');
  private priceInput = this.page.locator('#price');
  private addFlightButton = this.page.locator('text=Add Flight');
  private updateFlightButton = this.page.locator('text=Update Flight');

  // Locators - Page Elements
  private pageTitle = this.page.locator('h2');

  /**
   * Navigate to flights page
   */
  async navigateToFlights() {
    await this.navigateTo('/flights');
  }

  /**
   * Verify page title
   */
  async verifyPageTitle() {
    await expect(this.pageTitle).toContainText('Flight Management');
  }

  /**
   * Check if search form fields are visible
   */
  async verifySearchFormFields() {
    await expect(this.searchAirlineInput).toBeVisible();
    await expect(this.searchDateInput).toBeVisible();
    await expect(this.searchPriceInput).toBeVisible();
  }

  /**
   * Check if add flight form fields are visible
   */
  async verifyAddFlightFormFields() {
    await expect(this.airlineNameInput).toBeVisible();
    await expect(this.totalSeatsInput).toBeVisible();
    await expect(this.flightDateInput).toBeVisible();
    await expect(this.priceInput).toBeVisible();
  }

  /**
   * Fill search filters
   */
  async fillSearchFilters(airline?: string, price?: string) {
    if (airline) {
      await this.searchAirlineInput.fill(airline);
    }
    if (price) {
      await this.searchPriceInput.fill(price);
    }
  }

  /**
   * Clear search filters
   */
  async clearSearchFilters() {
    await this.clearFiltersButton.click();
  }

  /**
   * Verify search filter values
   */
  async verifySearchFilterValues(airline?: string, price?: string) {
    if (airline) {
      await expect(this.searchAirlineInput).toHaveValue(airline);
    }
    if (price) {
      await expect(this.searchPriceInput).toHaveValue(price);
    }
  }

  /**
   * Verify search filters are cleared
   */
  async verifySearchFiltersCleared() {
    await expect(this.searchAirlineInput).toHaveValue('');
    await expect(this.searchPriceInput).toHaveValue('');
  }

  /**
   * Fill add flight form
   */
  async fillAddFlightForm(airlineName: string, totalSeats: string, flightDate: string, price: string) {
    await this.airlineNameInput.fill(airlineName);
    await this.totalSeatsInput.fill(totalSeats);
    await this.flightDateInput.fill(flightDate);
    await this.priceInput.fill(price);
  }

  /**
   * Submit add flight form
   */
  async submitAddFlightForm(isEditing = false) {
    if (isEditing) {
      await this.updateFlightButton.click();
    } else {
      await this.addFlightButton.click();
    }
  }

  /**
   * Add a new flight (complete flow)
   */
  async addFlight(airlineName: string, totalSeats: string, flightDate: string, price: string) {
    await this.fillAddFlightForm(airlineName, totalSeats, flightDate, price);
    await this.submitAddFlightForm();
  }

  /**
   * Verify add flight form is reset
   */
  async verifyAddFlightFormReset() {
    await expect(this.airlineNameInput).toHaveValue('');
    await expect(this.totalSeatsInput).toHaveValue('');
    await expect(this.priceInput).toHaveValue('');
    await expect(this.flightDateInput).toHaveValue('');
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
} 