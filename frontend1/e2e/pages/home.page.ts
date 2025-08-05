import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  // Locators
  private navbar = this.page.locator('nav.navbar');
  private navbarBrand = this.page.locator('.navbar-brand');
  private navLinks = this.page.locator('nav.navbar a.nav-link');

  /**
   * Navigate to home page
   */
  async navigateToHome() {
    await this.navigateTo('/');
  }



  /**
   * Check if navbar is visible
   */
  async isNavbarVisible(): Promise<boolean> {
    return await this.navbar.isVisible();
  }

  /**
   * Check if navbar brand is visible
   */
  async isNavbarBrandVisible(): Promise<boolean> {
    return await this.navbarBrand.isVisible();
  }

  /**
   * Get all navigation links
   */
  async getNavigationLinks(): Promise<string[]> {
    return await this.navLinks.allTextContents();
  }

  /**
   * Check if specific navigation link exists
   */
  async hasNavigationLink(linkText: string): Promise<boolean> {
    const link = this.page.locator(`nav.navbar a.nav-link[routerLink="/${linkText.toLowerCase()}"]`);
    return await link.isVisible();
  }

  /**
   * Click on navigation link
   */
  async clickNavigationLink(linkText: string) {
    // Use a more specific selector that works on mobile
    await this.page.click(`nav.navbar a.nav-link[routerLink="/${linkText.toLowerCase()}"]`);
  }

  /**
   * Navigate to flights page
   */
  async navigateToFlights() {
    await this.clickNavigationLink('Flights');
    await this.page.waitForURL('**/flights');
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to customers page
   */
  async navigateToCustomers() {
    await this.clickNavigationLink('Customers');
    await this.page.waitForURL('**/customers');
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to bookings page
   */
  async navigateToBookings() {
    await this.clickNavigationLink('Bookings');
    await this.page.waitForURL('**/bookings');
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to reports page
   */
  async navigateToReports() {
    await this.clickNavigationLink('Reports');
    await this.page.waitForURL('**/reports');
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(expectedTitle: string) {
    await expect(this.page).toHaveTitle(expectedTitle, { timeout: 15000 });
  }

  /**
   * Verify all navigation links are present
   */
  async verifyAllNavigationLinks() {
    const expectedLinks = ['Flights', 'Customers', 'Bookings', 'Reports'];
    for (const link of expectedLinks) {
      await expect(this.page.locator(`nav.navbar a.nav-link[routerLink="/${link.toLowerCase()}"]`)).toBeVisible();
    }
  }
} 