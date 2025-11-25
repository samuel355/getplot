const rateLimit = require('express-rate-limit');
const RedisStore = require('./redisStore');
const { redis } = require('@getplot/shared');
const config = require('../config');

// Create store instances that will access the client lazily
const createStore = (prefix, windowMs) => {
  return new RedisStore({
    getClient: () => redis.client, // Lazy access to client
    prefix,
    windowMs,
  });
};

// General API rate limiter
const apiLimiter = rateLimit({
  store: createStore('rl:api:', config.rateLimit.windowMs),
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
  store: createStore('rl:auth:', 15 * 60 * 1000),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // 8 attempts
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later',
    },
  },
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration rate limiter
const registerLimiter = rateLimit({
  store: createStore('rl:register:', 60 * 60 * 1000),
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

