# Get Plot API - Test Suite

## 📋 Test Structure

```
tests/
├── setup.js                    # Global test configuration
├── unit/                       # Global unit tests
├── integration/                # Global integration tests
│   └── gateway.test.js         # Gateway integration tests
└── e2e/                        # End-to-end tests
    ├── complete-flow.test.js    # Original E2E flow
    └── user-journey.test.js    # Complete user journey tests

services/
└── [service-name]/
    └── tests/
        ├── unit/               # Service unit tests
        │   └── [service].service.test.js
        └── integration/        # Service integration tests
            └── [service].integration.test.js
```

## ✅ Test Coverage

### Unit Tests

- ✅ **Auth Service** - `services/auth-service/tests/unit/auth.service.test.js`
  - Password hashing
  - Password validation
  - Password comparison
  - Random password generation

- ✅ **Properties Service** - `services/properties-service/tests/unit/properties.service.test.js`
  - Location validation
  - Property retrieval
  - Search functionality
  - Pagination

- ✅ **Transactions Service** - `services/transactions-service/tests/unit/transactions.service.test.js`
  - Reservation validation
  - Purchase validation
  - Transaction queries
  - Error handling

- ✅ **Users Service** - `services/users-service/tests/unit/users.service.test.js`
  - Profile management
  - Preferences
  - Saved properties
  - Cache handling

- ✅ **Notifications Service** - `services/notifications-service/tests/unit/notifications.service.test.js`
  - Email validation
  - SMS validation
  - Bulk operations

### Integration Tests

- ✅ **Auth Service** - `services/auth-service/tests/integration/auth.integration.test.js`
  - Registration endpoint
  - Login endpoint
  - Error handling

- ✅ **Properties Service** - `services/properties-service/tests/integration/properties.integration.test.js`
  - Property listing
  - Property details
  - Search endpoint
  - Location filtering

- ✅ **Transactions Service** - `services/transactions-service/tests/integration/transactions.integration.test.js`
  - Reservation endpoint
  - Transaction history
  - Authentication checks

- ✅ **Users Service** - `services/users-service/tests/integration/users.integration.test.js`
  - Profile endpoints
  - Preferences endpoints
  - Saved properties endpoints

- ✅ **Notifications Service** - `services/notifications-service/tests/integration/notifications.integration.test.js`
  - Email sending
  - SMS sending
  - Bulk operations

- ✅ **Gateway** - `tests/integration/gateway.test.js`
  - Health endpoints
  - Rate limiting
  - CORS headers
  - Security headers

### E2E Tests

- ✅ **Complete Flow** - `tests/e2e/complete-flow.test.js`
  - Original complete user flow

- ✅ **User Journey** - `tests/e2e/user-journey.test.js`
  - Registration → Login → Profile
  - Property browsing → Search → Details
  - Property management (save/unsave)
  - Profile management

## 🚀 Running Tests

### All Tests
```bash
yarn test
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
yarn test:coverage
```

### Watch Mode
```bash
yarn test:watch
```

## 📊 Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: > 70% coverage
- **E2E Tests**: All critical user paths

## 🧪 Test Configuration

### Jest Configuration
- **File**: `jest.config.js`
- **Test Environment**: Node.js
- **Timeout**: 10 seconds (configurable)
- **Coverage Threshold**: 80% statements, 70% branches

### Test Setup
- **File**: `tests/setup.js`
- Sets test environment variables
- Configures database connection
- Sets up Redis connection
- Global teardown

## 📝 Writing New Tests

### Unit Test Template
```javascript
describe('ServiceName - Unit Tests', () => {
  describe('MethodName', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = method(input);
      
      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

### Integration Test Template
```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('ServiceName - Integration Tests', () => {
  it('should handle endpoint', async () => {
    const response = await request(app)
      .get('/api/v1/endpoint')
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```

## 🔍 Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after tests
3. **Mocking**: Mock external services in unit tests
4. **Real DB**: Use real database for integration tests
5. **Descriptive Names**: Use clear, descriptive test names
6. **AAA Pattern**: Arrange, Act, Assert

## 📚 Documentation

- **[Testing Guide](../docs/TESTING_GUIDE.md)** - Comprehensive testing documentation
- **[API Manual](../docs/API_MANUAL.md)** - Complete system manual

---

**Last Updated**: 2025-11-12

