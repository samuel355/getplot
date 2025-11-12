// Shared utilities index
module.exports = {
  // Database
  database: require('./database'),
  redis: require('./database/redis'),

  // Utils
  logger: require('./utils/logger'),
  errors: require('./utils/errors'),
  ResponseHandler: require('./utils/response'),
  JWTHelper: require('./utils/jwt'),
  get BcryptHelper() {
    return require('./utils/bcrypt');
  },
  validators: require('./utils/validators'),

  // Middleware
  ...require('./middleware/errorHandler'),
};

