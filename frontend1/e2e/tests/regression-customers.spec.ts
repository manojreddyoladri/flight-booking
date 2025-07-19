import { test, expect, request } from '@playwright/test';
import { CustomersPage } from '../pages/customers.page';

// Helper to generate unique customer data
function getUniqueCustomerData() {
  const unique = Date.now();
  return {
    name: `Test Customer ${unique}`,
    email: `test${unique}@example.com`,
    phone: `555-000-${unique.toString().slice(-4)}`,
  };
}

// No backend delete endpoint, so we use unique data for each run

test.describe('Regression: Customer Management', () => {
  test('should load customers page and display seeded customer', async ({ page }) => {
    const customersPage = new CustomersPage(page);
    await customersPage.navigateToCustomers();
    await customersPage.verifyPageTitle();
    await expect(page.locator('tr', { hasText: 'John Doe' })).toBeVisible();
  });

  test('should add a new customer and verify it appears in the table', async ({ page }) => {
    const customersPage = new CustomersPage(page);
    const data = getUniqueCustomerData();
    await customersPage.navigateToCustomers();
    await customersPage.addCustomer(data.name, data.email);
    await customersPage.refreshCustomers();
    // Find the row with the highest ID (last row) and extract the ID
    const allRows = page.locator('tbody tr');
    const rowCount = await allRows.count();
    const lastRow = allRows.nth(rowCount - 1);
    const customerId = await lastRow.locator('td').first().textContent();
    // Assert the last row has the correct name/email
    await expect(lastRow.locator('td').nth(1)).toHaveText(data.name);
    await expect(lastRow.locator('td').nth(2)).toHaveText(data.email);
  });

  test('should search for a customer by ID and verify details', async ({ page }) => {
    const customersPage = new CustomersPage(page);
    const data = getUniqueCustomerData();
    await customersPage.navigateToCustomers();
    await customersPage.addCustomer(data.name, data.email);
    await customersPage.refreshCustomers();
    // Find the row with the highest ID (last row) and extract the ID
    const allRows = page.locator('tbody tr');
    const rowCount = await allRows.count();
    const lastRow = allRows.nth(rowCount - 1);
    const customerId = await lastRow.locator('td').first().textContent();
    // Search by ID
    await customersPage.searchCustomer(customerId as string);
    // Assert the searched row has the correct name/email using strict selector
    const searchedRow = page.locator(`tbody tr:has(td:first-child:text-is("${customerId}"))`);
    await expect(searchedRow).toBeVisible();
    await expect(searchedRow.locator('td').nth(1)).toHaveText(data.name);
    await expect(searchedRow.locator('td').nth(2)).toHaveText(data.email);
  });
}); 