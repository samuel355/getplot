const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Proxy options with error handling
const createProxy = (target, options = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ...options,
    onError: (err, req, res) => {
      console.error(`Proxy error for ${target}:`, err.message);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Service temporarily unavailable',
        },
      });
    },
  });
};

// ============================================
// AUTH SERVICE ROUTES
// ============================================
router.use('/auth/login', authLimiter);
router.use('/auth/register', registerLimiter);
router.use('/auth', createProxy(config.services.auth, {
  pathRewrite: {
    '^/api/v1/auth': '/api/v1/auth',
  },
}));

// ============================================
// PROPERTIES SERVICE ROUTES
// ============================================
router.use('/properties', createProxy(config.services.properties, {
  pathRewrite: {
    '^/api/v1/properties': '/api/v1/properties',
  },
}));

// ============================================
// TRANSACTIONS SERVICE ROUTES
// ============================================
// All transaction routes require authentication
router.use('/transactions', authenticate);
router.use('/transactions', createProxy(config.services.transactions, {
  pathRewrite: {
    '^/api/v1/transactions': '/api/v1/transactions',
  },
}));

// ============================================
// USERS SERVICE ROUTES
// ============================================
// All user routes require authentication
router.use('/users', authenticate);
router.use('/users', createProxy(config.services.users, {
  pathRewrite: {
    '^/api/v1/users': '/api/v1/users',
  },
}));

// ============================================
// NOTIFICATIONS SERVICE ROUTES
// ============================================
// Service-to-service only (can add API key check)
router.use('/notifications', createProxy(config.services.notifications, {
  pathRewrite: {
    '^/api/v1/notifications': '/api/v1/notifications',
  },
}));

// ============================================
// ANALYTICS SERVICE ROUTES
// ============================================
// Admin only
router.use('/analytics', authenticate, authorize('admin', 'sysadmin'));
router.use('/analytics', createProxy(config.services.analytics, {
  pathRewrite: {
    '^/api/v1/analytics': '/api/v1/analytics',
  },
}));

module.exports = router;

