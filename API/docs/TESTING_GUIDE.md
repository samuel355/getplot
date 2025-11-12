# Get Plot API - Testing Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Types](#test-types)
3. [Test Structure](#test-structure)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Test Examples](#test-examples)
7. [Test Coverage](#test-coverage)
8. [CI/CD Integration](#cicd-integration)
9. [Best Practices](#best-practices)

---

## Overview

The Get Plot API uses **Jest** as the testing framework with **Supertest** for HTTP endpoint testing. The test suite includes:

- ✅ **Unit Tests** - Test individual functions/modules
- ✅ **Integration Tests** - Test service interactions
- ✅ **E2E Tests** - Test complete user flows
- ✅ **Automation Tests** - Automated API testing

### Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: > 70% coverage
- **E2E Tests**: All critical user paths

---

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions, classes, or modules in isolation.

**Location**: `services/[service]/tests/unit/`

**Characteristics**:
- Fast execution
- No external dependencies (mocked)
- Test business logic
- Test edge cases

**Example**:
```javascript
// services/auth-service/tests/unit/auth.service.test.js
describe('AuthService', () => {
  it('should hash password correctly', async () => {
    const hashed = await BcryptHelper.hash('password123');
    expect(hashed).toBeDefined();
  });
});
```

### 2. Integration Tests

**Purpose**: Test how different parts of the system work together.

**Location**: `services/[service]/tests/integration/`

**Characteristics**:
- Test API endpoints
- Use real database (test database)
- Test service-to-service communication
- Slower than unit tests

**Example**:
```javascript
// services/auth-service/tests/integration/auth.integration.test.js
describe('POST /api/v1/auth/register', () => {
  it('should register new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'Pass123!' });
    
    expect(response.status).toBe(201);
  });
});
```

### 3. E2E Tests

**Purpose**: Test complete user workflows from start to finish.

**Location**: `tests/e2e/`

**Characteristics**:
- Test full user journeys
- Use all services
- Test real scenarios
- Slowest tests

**Example**:
```javascript
// tests/e2e/complete-flow.test.js
describe('Complete User Flow', () => {
  it('should complete property purchase flow', async () => {
    // 1. Register user
    // 2. Login
    // 3. Browse properties
    // 4. Reserve property
    // 5. Complete purchase
  });
});
```

### 4. Automation Tests

**Purpose**: Automated API testing scripts for CI/CD.

**Location**: `scripts/test-api.sh`

**Characteristics**:
- Can run in CI/CD pipelines
- Test all endpoints
- Generate reports
- Non-blocking

---

## Test Structure

### Directory Structure

```
API/
├── tests/                          # Global tests
│   ├── setup.js                   # Test configuration
│   ├── unit/                      # Global unit tests
│   ├── integration/               # Global integration tests
│   └── e2e/                       # E2E tests
│       └── complete-flow.test.js
│
├── services/
│   ├── auth-service/
│   │   └── tests/
│   │       ├── unit/
│   │       │   └── auth.service.test.js
│   │       └── integration/
│   │           └── auth.integration.test.js
│   │
│   ├── properties-service/
│   │   └── tests/
│   │       ├── unit/
│   │       │   └── properties.service.test.js
│   │       └── integration/
│   │           └── properties.integration.test.js
│   │
│   └── [other-services]/
│       └── tests/
│           ├── unit/
│           └── integration/
│
└── jest.config.js                 # Jest configuration
```

### Test File Naming

- Unit tests: `*.test.js` or `*.spec.js`
- Integration tests: `*.integration.test.js`
- E2E tests: `*.e2e.test.js`

---

## Running Tests

### All Tests

```bash
# Run all tests
yarn test

# Or with npm
npm test
```

### By Type

```bash
# Unit tests only
yarn test:unit

# Integration tests only
yarn test:integration

# E2E tests only
yarn test:e2e
```

### By Service

```bash
# Test specific service
cd services/auth-service
yarn test

# Or from root
yarn test -- services/auth-service
```

### With Coverage

```bash
# Generate coverage report
yarn test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Watch Mode

```bash
# Watch for changes and re-run tests
yarn test:watch

# Watch specific file
yarn test:watch -- auth.service.test.js
```

### Verbose Output

```bash
# Show detailed test output
yarn test --verbose

# Show only failed tests
yarn test --silent
```

### Specific Test File

```bash
# Run specific test file
yarn test auth.service.test.js

# Run tests matching pattern
yarn test --testNamePattern="should register"
```

---

## Writing Tests

### Test Setup

All tests use the global setup in `tests/setup.js`:

```javascript
// tests/setup.js
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://.../test_db';
process.env.JWT_SECRET = 'test_secret';
```

### Unit Test Template

```javascript
const { SomeHelper } = require('@getplot/shared');

describe('ServiceName - Unit Tests', () => {
  describe('MethodName', () => {
    beforeEach(() => {
      // Setup before each test
    });

    afterEach(() => {
      // Cleanup after each test
    });

    it('should do something correctly', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = SomeHelper.method(input);
      
      // Assert
      expect(result).toBeDefined();
      expect(result).toBe('expected');
    });

    it('should handle errors', () => {
      expect(() => {
        SomeHelper.method(null);
      }).toThrow();
    });
  });
});
```

### Integration Test Template

```javascript
const request = require('supertest');
const app = require('../../src/app');
const { database } = require('@getplot/shared');

describe('ServiceName - Integration Tests', () => {
  beforeAll(async () => {
    await database.connect();
    // Setup test data
  });

  afterAll(async () => {
    // Cleanup test data
    await database.disconnect();
  });

  describe('POST /api/v1/endpoint', () => {
    it('should handle request correctly', async () => {
      const response = await request(app)
        .post('/api/v1/endpoint')
        .send({ data: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
```

### E2E Test Template

```javascript
const request = require('supertest');
const gateway = require('../../gateway/src/app');

describe('E2E: Complete User Flow', () => {
  let accessToken;
  let userId;

  it('should complete full user journey', async () => {
    // Step 1: Register
    const registerRes = await request(gateway)
      .post('/api/v1/auth/register')
      .send({ email: 'e2e@test.com', password: 'Pass123!' });
    
    accessToken = registerRes.body.data.tokens.accessToken;
    userId = registerRes.body.data.user.id;

    // Step 2: Get properties
    const propertiesRes = await request(gateway)
      .get('/api/v1/properties')
      .set('Authorization', `Bearer ${accessToken}`);

    // Step 3: Reserve property
    // ... continue flow
  });
});
```

---

## Test Examples

### Example 1: Unit Test - Password Hashing

```javascript
// services/auth-service/tests/unit/auth.service.test.js
const { BcryptHelper } = require('@getplot/shared');

describe('BcryptHelper', () => {
  describe('hash', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPass123!';
      const hashed = await BcryptHelper.hash(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50);
    });

    it('should create different hashes for same password', async () => {
      const password = 'TestPass123!';
      const hash1 = await BcryptHelper.hash(password);
      const hash2 = await BcryptHelper.hash(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should validate correct password', async () => {
      const password = 'TestPass123!';
      const hashed = await BcryptHelper.hash(password);
      const isValid = await BcryptHelper.compare(password, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPass123!';
      const hashed = await BcryptHelper.hash(password);
      const isValid = await BcryptHelper.compare('WrongPass', hashed);
      
      expect(isValid).toBe(false);
    });
  });
});
```

### Example 2: Integration Test - Auth Endpoint

```javascript
// services/auth-service/tests/integration/auth.integration.test.js
const request = require('supertest');
const app = require('../../src/app');
const { database } = require('@getplot/shared');

describe('Auth API - Integration Tests', () => {
  let testUser;

  beforeAll(async () => {
    await database.connect();
    // Clean test data
    await database.query("DELETE FROM users WHERE email LIKE '%test@example.com%'");
  });

  afterAll(async () => {
    if (testUser) {
      await database.query('DELETE FROM users WHERE id = $1', [testUser.id]);
    }
    await database.disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'integration.test@example.com',
          password: 'TestPass123!',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      
      testUser = response.body.data.user;
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'integration.test@example.com',
          password: 'TestPass123!',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'integration.test@example.com',
          password: 'TestPass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'integration.test@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
    });
  });
});
```

### Example 3: E2E Test - Complete Flow

```javascript
// tests/e2e/complete-flow.test.js
const request = require('supertest');
const gateway = require('../../gateway/src/app');
const { database } = require('@getplot/shared');

describe('E2E: Complete Property Purchase Flow', () => {
  let accessToken;
  let userId;
  let propertyId;

  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    // Cleanup
    if (userId) {
      await database.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await database.disconnect();
  });

  it('should complete full property purchase journey', async () => {
    // Step 1: Register user
    const registerRes = await request(gateway)
      .post('/api/v1/auth/register')
      .send({
        email: `e2e-${Date.now()}@test.com`,
        password: 'TestPass123!',
        firstName: 'E2E',
        lastName: 'Test',
      })
      .expect(201);

    accessToken = registerRes.body.data.tokens.accessToken;
    userId = registerRes.body.data.user.id;

    // Step 2: Browse properties
    const propertiesRes = await request(gateway)
      .get('/api/v1/properties?limit=1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(propertiesRes.body.data.properties).toBeDefined();
    propertyId = propertiesRes.body.data.properties[0]?.id;

    if (propertyId) {
      // Step 3: Reserve property
      const reserveRes = await request(gateway)
        .post('/api/v1/transactions/reserve')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ propertyId })
        .expect(201);

      expect(reserveRes.body.data.transaction).toBeDefined();
    }
  });
});
```

---

## Test Coverage

### Coverage Requirements

- **Statements**: > 80%
- **Branches**: > 70%
- **Functions**: > 70%
- **Lines**: > 80%

### Generating Coverage Report

```bash
# Generate coverage
yarn test:coverage

# View HTML report
open coverage/lcov-report/index.html

# View in terminal
yarn test:coverage --coverageReporters=text
```

### Coverage Configuration

In `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 80,
    statements: 80,
  },
},
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: yarn install
      
      - name: Run unit tests
        run: yarn test:unit
      
      - name: Run integration tests
        run: yarn test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          REDIS_URL: ${{ secrets.TEST_REDIS_URL }}
      
      - name: Generate coverage
        run: yarn test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Best Practices

### 1. Test Organization

- ✅ Group related tests with `describe` blocks
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ One assertion per test (when possible)

### 2. Test Data

- ✅ Use test-specific data (e.g., `test@example.com`)
- ✅ Clean up test data after tests
- ✅ Use factories for complex test data
- ✅ Isolate test data (use transactions)

### 3. Mocking

- ✅ Mock external services (email, SMS)
- ✅ Mock database for unit tests
- ✅ Use real database for integration tests
- ✅ Don't mock what you're testing

### 4. Test Speed

- ✅ Keep unit tests fast (< 100ms each)
- ✅ Use `beforeAll` for expensive setup
- ✅ Clean up in `afterAll`
- ✅ Run tests in parallel when possible

### 5. Error Testing

- ✅ Test error cases
- ✅ Test edge cases
- ✅ Test validation failures
- ✅ Test authentication failures

### 6. Maintainability

- ✅ Keep tests simple and readable
- ✅ Avoid test interdependencies
- ✅ Use helper functions for common setup
- ✅ Document complex test scenarios

---

## Common Test Patterns

### Testing Protected Routes

```javascript
it('should require authentication', async () => {
  const response = await request(app)
    .get('/api/v1/users/profile')
    .expect(401);
});

it('should return profile with valid token', async () => {
  const token = await getTestToken();
  const response = await request(app)
    .get('/api/v1/users/profile')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
});
```

### Testing Database Operations

```javascript
it('should create record in database', async () => {
  const result = await database.query(
    'INSERT INTO table (column) VALUES ($1) RETURNING *',
    ['value']
  );
  
  expect(result.rows[0].column).toBe('value');
  
  // Cleanup
  await database.query('DELETE FROM table WHERE id = $1', [result.rows[0].id]);
});
```

### Testing Error Handling

```javascript
it('should handle database errors', async () => {
  // Mock database to throw error
  jest.spyOn(database, 'query').mockRejectedValue(new Error('DB Error'));
  
  const response = await request(app)
    .post('/api/v1/endpoint')
    .send({ data: 'test' });
  
  expect(response.status).toBe(500);
});
```

---

## Troubleshooting Tests

### Common Issues

1. **Tests timeout**
   - Increase timeout: `jest.setTimeout(30000)`
   - Check database connection
   - Check for hanging promises

2. **Database connection errors**
   - Verify test database exists
   - Check `DATABASE_URL` in test setup
   - Ensure database is accessible

3. **Tests interfere with each other**
   - Use `beforeEach`/`afterEach` for cleanup
   - Use transactions for isolation
   - Use unique test data

4. **Mock not working**
   - Check mock is set before import
   - Use `jest.resetModules()` if needed
   - Verify mock path is correct

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-12  
**Maintained by**: Get Plot Engineering Team

