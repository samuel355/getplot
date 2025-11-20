const Joi = require('joi');

/**
 * Common validation schemas
 */

const email = Joi.string().email().lowercase().trim().required();

const password = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.pattern.base':
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    'string.min': 'Password must be at least 8 characters long',
  });

const phone = Joi.string()
  .pattern(/^\+\d{10,15}$/)
  .required()
  .messages({
    'string.pattern.base': 'Phone must be in international format (e.g., +233241234567)',
  });

const uuid = Joi.string().uuid().required();

const name = Joi.string().trim().min(2).max(50).required();

const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
};

const role = Joi.string()
  .valid('default_member', 'agent', 'admin', 'system_admin', 'chief', 'chief_assistant')
  .required();

const status = Joi.string().valid('available', 'reserved', 'sold', 'hold').required();

/**
 * Validation schemas
 */

const schemas = {
  // User registration
  register: Joi.object({
    email,
    password,
    firstName: name,
    lastName: name,
    phone,
    country: Joi.string().trim().required(),
    residentialAddress: Joi.string().trim().optional(),
  }),

  // User login
  login: Joi.object({
    email,
    password: Joi.string().required(),
  }),

  // Social login
  socialLogin: Joi.object({
    provider: Joi.string().valid('google').required(),
    idToken: Joi.any().when('provider', {
      is: 'google',
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    accessToken: Joi.string().optional(),
  }),

  // Refresh token
  refresh: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  // Forgot password
  forgotPassword: Joi.object({
    email,
  }),

  // Reset password
  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: password,
  }),

  // Update profile
  updateProfile: Joi.object({
    firstName: name.optional(),
    lastName: name.optional(),
    phone: phone.optional(),
    residentialAddress: Joi.string().trim().optional(),
  }),

  // Property search
  propertySearch: Joi.object({
    location: Joi.string().valid('yabi', 'trabuom', 'dar_es_salaam', 'legon_hills', 'nthc', 'berekuso', 'saadi').optional(),
    status: Joi.string().valid('available', 'reserved', 'sold').optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    minSize: Joi.number().min(0).optional(),
    maxSize: Joi.number().min(0).optional(),
    sortBy: Joi.string().valid('plotNo', 'price', 'size', 'createdAt').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    ...pagination,
  }),

  // Create property
  createProperty: Joi.object({
    plotNo: Joi.string().required(),
    streetName: Joi.string().required(),
    location: Joi.string().valid('yabi', 'trabuom', 'dar_es_salaam', 'legon_hills', 'nthc', 'berekuso', 'saadi').required(),
    area: Joi.number().positive().required(),
    areaUnit: Joi.string().valid('acres', 'sqm', 'sqft').default('acres'),
    price: Joi.number().positive().required(),
    currency: Joi.string().valid('GHS', 'USD').default('GHS'),
    coordinates: Joi.object().required(),
  }),

  // Reserve plot
  reservePlot: Joi.object({
    propertyId: uuid,
    depositAmount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('bank_transfer', 'mobile_money', 'paystack').required(),
    customerDetails: Joi.object({
      firstName: name,
      lastName: name,
      email,
      phone,
      country: Joi.string().required(),
      residentialAddress: Joi.string().required(),
    }).required(),
  }),

  // Buy plot
  buyPlot: Joi.object({
    propertyId: uuid,
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('bank_transfer', 'mobile_money', 'paystack', 'stripe').required(),
    customerDetails: Joi.object({
      firstName: name,
      lastName: name,
      email,
      phone,
      country: Joi.string().required(),
      residentialAddress: Joi.string().required(),
    }).required(),
  }),

  // Send email
  sendEmail: Joi.object({
    to: email,
    template: Joi.string().required(),
    data: Joi.object().required(),
    attachments: Joi.array().items(Joi.object({
      filename: Joi.string().required(),
      content: Joi.string().required(),
    })).optional(),
  }),

  // Send SMS
  sendSMS: Joi.object({
    to: phone,
    message: Joi.string().max(160).required(),
  }),

  // UUID param
  uuidParam: Joi.object({
    id: uuid,
  }),
};

/**
 * Validate data against schema
 */
function validate(schema, data, options = {}) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    ...options,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    
    throw {
      name: 'ValidationError',
      message: 'Validation failed',
      errors,
    };
  }

  return value;
}

module.exports = {
  schemas,
  validate,
  // Export individual validators for reuse
  email,
  password,
  phone,
  uuid,
  name,
  role,
  status,
  pagination,
};

