import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CustomersPage extends BasePage {
  // Locators - Add Customer Form
  private nameInput = this.page.locator('#name');
  private emailInput = this.page.locator('#email');
  private addCustomerButton = this.page.locator('text=Add Customer');

  // Locators - Search Customer
  private searchIdInput = this.page.locator('input[placeholder="Enter Customer ID"]');
  private searchCustomerButton = this.page.locator('button.btn-info');

  // Locators - Page Elements
  private pageTitle = this.page.locator('h2');
  private searchedCustomerSection = this.page.locator('.card', { hasText: 'Searched Customer' });
  private customersTable = this.page.locator('table tbody tr');
  private refreshButton = this.page.locator('text=Refresh');

  /**
   * Navigate to customers page
   */
  async navigateToCustomers() {
    await this.navigateTo('/customers');
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
    // Wait for the page title to be visible
    await this.pageTitle.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Verify page title
   */
  async verifyPageTitle() {
    await expect(this.pageTitle).toContainText('Customer Management', { timeout: 15000 });
  }

  /**
   * Check if add customer form fields are visible
   */
  async verifyAddCustomerFormFields() {
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
  }

  /**
   * Check if search customer form is visible
   */
  async verifySearchCustomerForm() {
    await expect(this.searchIdInput).toBeVisible();
  }

  /**
   * Fill add customer form
   */
  async fillAddCustomerForm(name: string, email: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
  }

  /**
   * Submit add customer form
   */
  async submitAddCustomerForm() {
    await this.addCustomerButton.click();
  }

  /**
   * Add a new customer (complete flow)
   */
  async addCustomer(name: string, email: string) {
    await this.fillAddCustomerForm(name, email);
    await this.submitAddCustomerForm();
  }

  /**
   * Verify add customer form is reset
   */
  async verifyAddCustomerFormReset() {
    await expect(this.nameInput).toHaveValue('');
    await expect(this.emailInput).toHaveValue('');
  }

  /**
   * Fill search customer form
   */
  async fillSearchCustomerForm(customerId: string) {
    await this.searchIdInput.fill(customerId);
  }

  /**
   * Submit search customer form
   */
  async submitSearchCustomerForm() {
    await this.searchCustomerButton.click();
  }

  /**
   * Search for a customer (complete flow)
   */
  async searchCustomer(customerId: string) {
    await this.fillSearchCustomerForm(customerId);
    await this.submitSearchCustomerForm();
  }

  /**
   * Check if searched customer section is visible
   */
  async isSearchedCustomerVisible(): Promise<boolean> {
    return await this.searchedCustomerSection.isVisible();
  }

  /**
   * Get searched customer details
   */
  async getSearchedCustomerDetails(): Promise<{ name: string; email: string } | null> {
    if (!(await this.isSearchedCustomerVisible())) {
      return null;
    }

    const nameElement = this.searchedCustomerSection.locator('strong', { hasText: 'Name:' }).locator('..');
    const emailElement = this.searchedCustomerSection.locator('strong', { hasText: 'Email:' }).locator('..');

    const name = await nameElement.textContent();
    const email = await emailElement.textContent();

    return {
      name: name?.replace('Name:', '').trim() || '',
      email: email?.replace('Email:', '').trim() || ''
    };
  }

  /**
   * Refresh customers list
   */
  async refreshCustomers() {
    await this.refreshButton.click();
  }

  /**
   * Get number of customers in table
   */
  async getCustomersCount(): Promise<number> {
    return await this.customersTable.count();
  }

  /**
   * Check if customers table is empty
   */
  async isCustomersTableEmpty(): Promise<boolean> {
    const count = await this.getCustomersCount();
    return count === 0;
  }

  /**
   * Get form field value
   */
  async getFormFieldValue(fieldId: string): Promise<string> {
    return await this.page.locator(`#${fieldId}`).inputValue();
  }

  /**
   * Verify form field value
   */
  async verifyFormFieldValue(fieldId: string, expectedValue: string) {
    await expect(this.page.locator(`#${fieldId}`)).toHaveValue(expectedValue);
  }

  /**
   * Check if form field is visible
   */
  async isFormFieldVisible(fieldId: string): Promise<boolean> {
    return await this.page.locator(`#${fieldId}`).isVisible();
  }
} 