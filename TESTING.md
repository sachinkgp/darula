# Testing Guide

## Overview

This project includes comprehensive test suites for all API endpoints with a beautiful web-based test runner UI.

## Test Structure

```
src/__tests__/
├── setup.js              # Test environment setup
├── helpers/
│   └── testHelpers.js    # Test utility functions
├── auth.test.js          # Authentication API tests
└── whiskey.test.js       # Whiskey API tests
```

## Running Tests

### Method 1: Web UI (Recommended)

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/test-runner.html
   ```

3. Use the UI to:
   - Select a specific test file or run all tests
   - View real-time test results
   - See detailed pass/fail statistics
   - Review error messages for failed tests

### Method 2: Command Line

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Cases

### Authentication Tests (`auth.test.js`)

#### Signup Tests
- ✅ Successful user signup with all fields
- ✅ Signup with minimal required fields (email, password)
- ❌ Signup with missing email
- ❌ Signup with missing password
- ❌ Signup with duplicate email

#### Login Tests
- ✅ Successful login with valid credentials
- ❌ Login with invalid email
- ❌ Login with invalid password
- ❌ Login with missing email
- ❌ Login with missing password

#### Profile Tests
- ✅ Get profile with valid JWT token
- ❌ Get profile without token
- ❌ Get profile with invalid token
- ❌ Get profile with malformed authorization header

### Whiskey API Tests (`whiskey.test.js`)

#### Category Tests
- ✅ Get all categories
- ✅ Get category by ID with brands
- ✅ Category structure validation
- ❌ Get non-existent category (404)
- ❌ Invalid category ID format

#### Brand Tests
- ✅ Get all brands
- ✅ Filter brands by category
- ✅ Get brand by ID with products
- ✅ Brand with populated category data
- ❌ Get non-existent brand (404)

#### Product Tests
- ✅ Get all products
- ✅ Filter products by category
- ✅ Filter products by brand
- ✅ Filter products by stock status
- ✅ Products with populated brand and category
- ✅ Product structure validation
- ✅ Get product by ID
- ❌ Get non-existent product (404)

#### Search Tests
- ✅ Search products by query
- ✅ Case-insensitive search
- ✅ Search in name and description
- ❌ Search without query parameter

## Test Data

Tests use isolated test data that is:
- Created before each test suite runs
- Cleaned up after tests complete
- Separate from production/development data

## Test Environment

Tests use separate environment variables:
- `NODE_ENV=test`
- Test database connections (configured via `.env`)
- Isolated test data

## Coverage

Run coverage report to see:
- Which lines of code are tested
- Which functions are covered
- Overall test coverage percentage

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Writing New Tests

### Example Test Structure

```javascript
describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe('GET /api/v1/endpoint', () => {
    test('should return success response', async () => {
      const response = await request(app)
        .get('/api/v1/endpoint')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
```

### Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data after tests
3. **Descriptive Names**: Use clear test descriptions
4. **Assertions**: Test both success and failure cases
5. **Edge Cases**: Test boundary conditions and error cases

## Troubleshooting

### Tests Failing

1. **Database Connection**: Ensure databases are running
   ```bash
   docker-compose up -d
   ```

2. **Environment Variables**: Check `.env` file is configured

3. **Test Data**: Run seed script if needed
   ```bash
   npm run seed
   ```

### UI Not Loading

1. Check server is running on correct port
2. Verify static file serving is enabled
3. Check browser console for errors

### Test Timeout

If tests timeout, increase timeout in `jest.config.js`:
```javascript
testTimeout: 20000 // 20 seconds
```

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test
```

