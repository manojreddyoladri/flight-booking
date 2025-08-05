import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ReportsPage extends BasePage {
  // Locators - Filter Form
  private airlineSelect = this.page.locator('#airline');
  private startDateInput = this.page.locator('#startDate');
  private endDateInput = this.page.locator('#endDate');

  // Locators - Page Elements
  private pageTitle = this.page.locator('h2');
  private dashboardCards = this.page.locator('.card-title');

  /**
   * Navigate to reports page
   */
  async navigateToReports() {
    await this.navigateTo('/reports');
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
    // Wait for the page title to be visible with increased timeout
    await this.pageTitle.waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Verify page title
   */
  async verifyPageTitle() {
    await expect(this.pageTitle).toContainText('Reports Dashboard', { timeout: 30000 });
  }

  /**
   * Check if filter form elements are visible
   */
  async verifyFilterFormElements() {
    await expect(this.airlineSelect).toBeVisible();
    await expect(this.startDateInput).toBeVisible();
    await expect(this.endDateInput).toBeVisible();
  }

  /**
   * Set date range filters
   */
  async setDateRangeFilters(startDate: string, endDate: string) {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
  }

  /**
   * Verify date range filters
   */
  async verifyDateRangeFilters(startDate: string, endDate: string) {
    await expect(this.startDateInput).toHaveValue(startDate);
    await expect(this.endDateInput).toHaveValue(endDate);
  }

  /**
   * Select airline filter
   */
  async selectAirline(airline: string) {
    await this.airlineSelect.selectOption(airline);
  }

  /**
   * Get selected airline
   */
  async getSelectedAirline(): Promise<string> {
    return await this.airlineSelect.inputValue();
  }

  /**
   * Check if dashboard cards are present
   */
  async verifyDashboardCards() {
    const cardTitles = await this.dashboardCards.allTextContents();
    expect(cardTitles.length).toBeGreaterThan(0);
  }

  /**
   * Get dashboard card titles
   */
  async getDashboardCardTitles(): Promise<string[]> {
    return await this.dashboardCards.allTextContents();
  }

  /**
   * Get number of dashboard cards
   */
  async getDashboardCardsCount(): Promise<number> {
    return await this.dashboardCards.count();
  }

  /**
   * Check if specific dashboard card exists
   */
  async hasDashboardCard(cardTitle: string): Promise<boolean> {
    const cardTitles = await this.getDashboardCardTitles();
    return cardTitles.some(title => title.includes(cardTitle));
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
   * Set default date range (current year)
   */
  async setDefaultDateRange() {
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
    
    await this.setDateRangeFilters(startDate, endDate);
  }

  /**
   * Get current year date range
   */
  getCurrentYearDateRange(): { startDate: string; endDate: string } {
    const currentYear = new Date().getFullYear();
    return {
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`
    };
  }

  /**
   * Get last year date range
   */
  getLastYearDateRange(): { startDate: string; endDate: string } {
    const lastYear = new Date().getFullYear() - 1;
    return {
      startDate: `${lastYear}-01-01`,
      endDate: `${lastYear}-12-31`
    };
  }

  /**
   * Get last 30 days date range
   */
  getLast30DaysDateRange(): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
} 