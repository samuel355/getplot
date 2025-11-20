const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Enhanced proxy with timeout configuration
const createProxy = (target, options = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: 'debug',
    timeout: 30000, // 30 second timeout
    proxyTimeout: 30000, // 30 second proxy timeout
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
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying: ${req.method} ${req.originalUrl} -> ${target}${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Proxy response: ${proxyRes.statusCode} from ${target}`);
    }
  });
};



// ============================================
// AUTH SERVICE ROUTES
// ============================================
router.use('/auth/login', authLimiter);
router.use('/auth/register', registerLimiter);
router.use('/auth', createProxy(config.services.auth, {
  pathRewrite: {
    '^/api/v1': '/api/v1',
  },
}));

// ============================================
// PROPERTIES SERVICE ROUTES
// ============================================
router.use('/properties', createProxy(config.services.properties, {
  pathRewrite: {
    '^/api/v1': '/api/v1',
  },
}));

// ============================================
// PLOTS SERVICE ROUTES
// ============================================
router.use('/plots', createProxy(config.services.plots, {
  pathRewrite: {
    '^/api/v1': '/api/v1',
  },
}));

// ============================================
// TRANSACTIONS SERVICE ROUTES
// ============================================
router.use('/transactions', authenticate, createProxy(config.services.transactions, {
  pathRewrite: {
    '^/api/v1': '/api/v1',
  },
}));

// ============================================
// USERS SERVICE ROUTES
// ============================================
router.use('/users', authenticate, createProxy(config.services.users, {
  pathRewrite: {
    '^/api/v1': '/api/v1',
  },
}));

// ============================================
// NOTIFICATIONS SERVICE ROUTES
// ============================================
router.use('/notifications', createProxy(config.services.notifications, {
  pathRewrite: {
    '^/api/v1': '/api/v1',
  },
}));

// ============================================
// ANALYTICS SERVICE ROUTES
// ============================================
router.use('/analytics', authenticate, authorize('admin', 'system_admin'), createProxy(config.services.analytics, {
  pathRewrite: {
    '^/api/v1': '/api/v1',
  },
}));

module.exports = router;