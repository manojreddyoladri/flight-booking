import { test, expect } from '@playwright/test';
import { ReportsPage } from '../pages/reports.page';

test.describe('Regression: Reports', () => {
  test('should load the reports dashboard', async ({ page }) => {
    const reportsPage = new ReportsPage(page);
    await reportsPage.navigateToReports();
    await reportsPage.verifyPageTitle();
    await reportsPage.verifyDashboardCards();
  });

  test('should apply filters and verify results', async ({ page }) => {
    const reportsPage = new ReportsPage(page);
    await reportsPage.navigateToReports();
    // Use current year as filter
    const { startDate, endDate } = reportsPage.getCurrentYearDateRange();
    await reportsPage.setDateRangeFilters(startDate, endDate);
    await reportsPage.verifyDateRangeFilters(startDate, endDate);
    // Select the first available airline if any
    const airlineOptions = await page.locator('#airline option').allTextContents();
    if (airlineOptions.length > 1) { // skip the default empty option
      await reportsPage.selectAirline(airlineOptions[1]);
      const selected = await reportsPage.getSelectedAirline();
      expect(selected).toBe(airlineOptions[1]);
    }
    await reportsPage.verifyDashboardCards();
    // Optionally, check that at least one card contains 'Total Bookings' or similar
    const cardTitles = await reportsPage.getDashboardCardTitles();
    expect(cardTitles.some(title => /total/i.test(title))).toBeTruthy();
  });
}); 