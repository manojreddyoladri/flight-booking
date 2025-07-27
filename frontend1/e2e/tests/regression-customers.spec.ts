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

// Helper to delete a customer by ID using the backend endpoint
async function deleteCustomerById(requestContext: any, customerId: number) {
  await requestContext.delete(`http://localhost:8080/api/customers/${customerId}`);
}

test.describe('Regression: Customer Management', () => {
  test('should load customers page and display seeded customer', async ({ page }) => {
    const customersPage = new CustomersPage(page);
    await customersPage.navigateToCustomers();
    await customersPage.verifyPageTitle();
    await expect(page.locator('tr', { hasText: 'John Doe' })).toBeVisible();
  });

  test('should add a new customer and verify it appears in the table', async ({ page, request }) => {
    const customersPage = new CustomersPage(page);
    const data = getUniqueCustomerData();
    await customersPage.navigateToCustomers();
    await customersPage.addCustomer(data.name, data.email);
    // Find the row by unique name
    const matchingRow = page.locator('tbody tr', { hasText: data.name });
    await expect(matchingRow).toBeVisible();
    await expect(matchingRow.locator('td').nth(1)).toHaveText(data.name);
    await expect(matchingRow.locator('td').nth(2)).toHaveText(data.email);
    // Extract customer ID and clean up
    const customerId = await matchingRow.locator('td').first().textContent();
    if (customerId) {
      await deleteCustomerById(request, Number(customerId));
    }
  });

  test('should search for a customer by ID and verify details', async ({ page, request }) => {
    const customersPage = new CustomersPage(page);
    const data = getUniqueCustomerData();
    await customersPage.navigateToCustomers();
    await customersPage.addCustomer(data.name, data.email);
    // Find the row by unique name
    const matchingRow = page.locator('tbody tr', { hasText: data.name });
    await expect(matchingRow).toBeVisible();
    const customerId = await matchingRow.locator('td').first().textContent();
    // Search by ID
    await customersPage.searchCustomer(customerId || '');
    const searchedRow = page.locator('tbody tr', { hasText: data.name });
    await expect(searchedRow).toBeVisible();
    await expect(searchedRow.locator('td').nth(1)).toHaveText(data.name);
    await expect(searchedRow.locator('td').nth(2)).toHaveText(data.email);
    // Clean up
    if (customerId) {
      await deleteCustomerById(request, Number(customerId));
    }
  });
}); 