# End-to-End Testing with Playwright

This directory contains end-to-end tests for the Flight Booking System using Playwright with Page Object Model (POM) pattern.

## Page Object Model Structure

The tests are organized using the Page Object Model pattern for better maintainability and reusability:

```
e2e/
├── pages/                    # Page Object classes
│   ├── base.page.ts         # Base page with common functionality
│   ├── home.page.ts         # Home page navigation
│   ├── flights.page.ts      # Flights page functionality
│   ├── customers.page.ts    # Customers page functionality
│   ├── bookings.page.ts     # Bookings page functionality
│   └── reports.page.ts      # Reports page functionality
├── tests/                   # Test specifications
│   ├── navigation.spec.ts   # Navigation tests
│   ├── simple-features.spec.ts # Basic feature tests
│   └── form-submission-mock.spec.ts # Form submission with API mocking
└── screenshots/             # Test screenshots
```

## Page Object Classes

### BasePage

- Common functionality for all pages
- Navigation, waiting, element interactions
- Screenshot capabilities

### HomePage

- Navigation between pages
- Verification of navigation elements
- Page title validation

### FlightsPage

- Flight search functionality
- Add flight form interactions
- Search filter management

### CustomersPage

- Customer management forms
- Search customer functionality
- Form validation and reset verification

### BookingsPage

- Booking creation workflow
- Date selection and validation
- Flight and customer selection

### ReportsPage

- Reports dashboard functionality
- Date range filtering
- Dashboard card verification

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test navigation.spec.ts
```

### Run Tests in Headed Mode

```bash
npx playwright test --headed
```

### Run Tests on Specific Browser

```bash
npx playwright test --project=chromium
```

## Test Categories

### 1. Navigation Tests (`navigation.spec.ts`)

- Home page loading
- Navigation link verification
- Page navigation functionality

### 2. Simple Feature Tests (`simple-features.spec.ts`)

- Page title verification
- Form field visibility
- Basic form interactions
- Date and input validation

### 3. Form Submission Tests (`form-submission-mock.spec.ts`)

- API mocking for form submissions
- Success and error scenarios
- Form reset verification

## Page Object Model Benefits

### 1. Maintainability

- When UI changes, update only the page object
- Tests remain unchanged even if selectors change

### 2. Reusability

- Page objects can be reused across multiple tests
- Common actions are defined once

### 3. Readability

- Tests are more readable and self-documenting
- Clear separation of concerns

### 4. Encapsulation

- Each page has its own class with specific functionality
- All page-specific elements and actions are contained

## Example Usage

```typescript
// Before POM - scattered selectors
test("add customer", async ({ page }) => {
  await page.goto("/customers");
  await page.fill("#name", "John Doe");
  await page.fill("#email", "john@example.com");
  await page.click("text=Add Customer");
});

// After POM - clean and reusable
test("add customer", async ({ page }) => {
  const customersPage = new CustomersPage(page);
  await customersPage.navigateToCustomers();
  await customersPage.addCustomer("John Doe", "john@example.com");
});
```

## Configuration

Tests are configured in `playwright.config.ts` with:

- Multiple browser support (Chrome, Firefox, Safari)
- Mobile device testing
- Screenshot and video capture
- Parallel execution
- Retry logic for flaky tests

## Best Practices

1. **Use Page Objects**: Always use page objects instead of direct selectors
2. **Meaningful Names**: Use descriptive method and property names
3. **Single Responsibility**: Each page object handles one page
4. **Error Handling**: Include proper error handling in page objects
5. **Documentation**: Comment complex interactions
6. **Consistency**: Follow naming conventions across all page objects
