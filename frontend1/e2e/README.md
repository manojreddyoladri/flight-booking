# End-to-End (E2E) Testing with Playwright

This project uses Playwright for end-to-end testing of the Flight Booking System.

## Overview

E2E tests verify that the entire application works correctly from a user's perspective, testing real user interactions and workflows.

## Test Structure

### Test Files

- `navigation.spec.ts` - Basic navigation tests (legacy)
- `working-navigation.spec.ts` - Working navigation tests
- `simple-features.spec.ts` - **Main E2E test suite** - Core functionality tests for all features

### Test Categories

1. **Navigation Tests** - Verify routing and page navigation
2. **Flights Page Tests** - Test flight management functionality
3. **Customers Page Tests** - Test customer management functionality
4. **Bookings Page Tests** - Test booking management functionality
5. **Reports Page Tests** - Test reports and analytics functionality
6. **Cross-page Navigation** - Test navigation between all pages

## Running Tests

### Prerequisites

1. Install Playwright browsers:

   ```bash
   npx playwright install
   ```

2. Start the Angular development server:
   ```bash
   npm start
   ```

### Running All Tests

```bash
# Run all tests on all browsers
npx playwright test

# Run all tests on Chromium only (faster)
npx playwright test --project=chromium

# Run with browser visible
npx playwright test --headed

# Run specific test file
npx playwright test e2e/tests/simple-features.spec.ts
```

### Running Specific Test Categories

```bash
# Run only navigation tests
npx playwright test --grep "Navigation"

# Run only flights tests
npx playwright test --grep "Flights Page"

# Run only customers tests
npx playwright test --grep "Customers Page"
```

### Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Test Configuration

The tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:4200`
- **Test Directory**: `./e2e`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Reporters**: HTML report
- **Screenshots**: On failure
- **Videos**: On failure

## Test Best Practices

### What We Test

✅ **Page Loading** - Verify pages load with correct titles and content
✅ **Form Elements** - Check that form fields are visible and functional
✅ **User Input** - Test filling forms and clearing filters
✅ **Navigation** - Verify routing between pages works correctly
✅ **Cross-browser Compatibility** - Test on multiple browsers

### What We Avoid

❌ **Complex State Testing** - Avoid testing complex application state
❌ **API Mocking** - Tests run against real backend
❌ **Disabled Elements** - Don't test clicking disabled buttons
❌ **Strict Mode Violations** - Use specific selectors to avoid multiple matches

### Selector Strategy

- Use **ID selectors** when available (`#searchAirline`)
- Use **text selectors** for buttons (`text=Clear Filters`)
- Use **placeholder selectors** for inputs (`input[placeholder="Enter Customer ID"]`)
- Avoid generic selectors that match multiple elements

## Troubleshooting

### Common Issues

1. **Tests timeout waiting for elements**

   - Check if the Angular dev server is running
   - Verify the element selectors are correct
   - Add `await page.waitForLoadState('networkidle')` for page loads

2. **Strict mode violations**

   - Use more specific selectors
   - Avoid generic selectors like `text=Button` when multiple buttons exist

3. **Disabled buttons**

   - Don't test clicking disabled form submit buttons
   - Test form validation by checking if buttons are disabled

4. **Element not found**
   - Verify the element exists in the actual application
   - Check if the element is conditionally rendered

### Debug Mode

Run tests in debug mode to step through:

```bash
npx playwright test --debug
```

## CI/CD Integration

For continuous integration, the tests can be run in headless mode:

```bash
# CI command
npx playwright test --project=chromium --reporter=html
```

## Test Coverage

The current E2E test suite covers:

- ✅ **Navigation** - All main routes and page transitions
- ✅ **Flights** - Search, filters, form display
- ✅ **Customers** - Form display, input validation
- ✅ **Bookings** - Date selection, form display
- ✅ **Reports** - Filter display, dashboard elements
- ✅ **Cross-page** - Navigation between all features

## Future Enhancements

Potential areas for expansion:

1. **Form Submission Testing** - Test actual form submissions when backend is stable
2. **Data Validation** - Test with real data scenarios
3. **Error Handling** - Test error states and recovery
4. **Performance Testing** - Test page load times and responsiveness
5. **Accessibility Testing** - Test with screen readers and keyboard navigation

## Maintenance

- Update selectors when UI changes
- Add new tests for new features
- Remove tests for deprecated functionality
- Keep tests focused on user workflows, not implementation details
