// Jest global setup
const { database, redis } = require('@getplot/shared');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/getplot_test';
process.env.REDIS_HOST = process.env.TEST_REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.TEST_REDIS_PORT || '6379';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_testing_only';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global teardown
afterAll(async () => {
  if (database.pool) {
    await database.disconnect();
  }
  if (redis.client) {
    await redis.disconnect();
  }
});

