const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { redis } = require('@getplot/shared');
const config = require('../config');

// General API rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis.client,
    prefix: 'rl:api:',
  }),
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path.startsWith('/health');
  },
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis.client,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later',
    },
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration rate limiter
const registerLimiter = rateLimit({
  store: new RedisStore({
    client: redis.client,
    prefix: 'rl:register:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many registration attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  registerLimiter,
};

