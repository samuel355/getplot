# Development Guide

## Getting Started

### Prerequisites

Ensure you have the following installed:

```bash
# Node.js 20+ (LTS)
node --version  # Should be v20.x.x or higher

# npm 10+
npm --version

# Docker
docker --version
docker-compose --version

# Git
git --version
```

### Initial Setup

```bash
# 1. Navigate to API directory
cd API

# 2. Install dependencies for all services
npm install

# 3. Copy environment variables
cp env.example .env

# 4. Edit .env with your credentials
# Update database, redis, email, SMS credentials

# 5. Start infrastructure
docker-compose up -d postgres redis rabbitmq

# 6. Run database migrations
npm run migrate

# 7. Seed database (optional)
npm run seed:dev

# 8. Start all services in dev mode
npm run dev
```

### Individual Service Development

```bash
# Start specific service
cd services/auth-service
npm install
npm run dev

# Service will run on its designated port
# Auth: 3001, Properties: 3002, etc.
```

## Project Structure (Detailed)

### Service Structure Template

Each microservice follows this structure:

```
services/[service-name]/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # DB configuration
│   │   ├── redis.js         # Redis configuration
│   │   └── index.js         # Main config
│   │
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.js
│   │   └── index.js
│   │
│   ├── models/              # Database models
│   │   ├── user.model.js
│   │   └── index.js
│   │
│   ├── routes/              # Route definitions
│   │   ├── auth.routes.js
│   │   └── index.js
│   │
│   ├── services/            # Business logic
│   │   ├── auth.service.js
│   │   └── index.js
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── index.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── logger.js
│   │   ├── jwt.js
│   │   └── index.js
│   │
│   ├── validators/          # Input validation schemas
│   │   ├── auth.validator.js
│   │   └── index.js
│   │
│   ├── constants/           # Constants
│   │   └── index.js
│   │
│   ├── types/               # TypeScript/JSDoc types
│   │   └── index.js
│   │
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
│
├── tests/                   # Service tests
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── .env.example             # Environment template
├── .eslintrc.js            # ESLint config
├── .prettierrc             # Prettier config
├── Dockerfile              # Docker configuration
├── jest.config.js          # Jest configuration
├── package.json            # Dependencies
└── README.md               # Service documentation
```

## Coding Standards

### JavaScript/Node.js Style Guide

```javascript
// 1. Use const/let, never var
const API_VERSION = 'v1';
let counter = 0;

// 2. Descriptive variable names
// Bad
const d = new Date();
// Good
const createdAt = new Date();

// 3. Use async/await over callbacks
// Bad
db.query('SELECT *', (err, result) => {});
// Good
const result = await db.query('SELECT *');

// 4. Error handling
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error('Operation failed:', error);
  throw new AppError('Operation failed', 500);
}

// 5. Function naming
// Use verbs for functions
function getUser() {}
function createTransaction() {}
function validateInput() {}

// 6. Destructuring
// Use destructuring for cleaner code
const { firstName, lastName, email } = req.body;

// 7. Template literals
const message = `Welcome ${firstName} ${lastName}`;

// 8. Arrow functions for short functions
const double = (x) => x * 2;
const users = data.map(user => user.name);

// 9. Default parameters
function createUser(name, role = 'customer') {}

// 10. Object shorthand
const name = 'John';
const user = { name }; // Instead of { name: name }
```

### File Naming Conventions

- **Controllers**: `user.controller.js`
- **Services**: `auth.service.js`
- **Models**: `property.model.js`
- **Routes**: `transaction.routes.js`
- **Middleware**: `auth.middleware.js`
- **Validators**: `user.validator.js`
- **Tests**: `auth.test.js`, `auth.integration.test.js`

### Code Organization

```javascript
// Example: auth.controller.js
// 1. Imports at top
const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// 2. Controller class or exports
class AuthController {
  /**
   * Register new user
   * @route POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      // 3. Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      // 4. Extract data
      const { email, password, firstName, lastName } = req.body;

      // 5. Business logic (delegate to service)
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName
      });

      // 6. Send response
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful'
      });
    } catch (error) {
      // 7. Error handling
      next(error);
    }
  }
}

module.exports = new AuthController();
```

## Database Guidelines

### Migrations

```javascript
// migrations/001_create_users_table.js
exports.up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20);
    table.enum('role', ['customer', 'agent', 'admin', 'sysadmin'])
      .defaultTo('customer');
    table.boolean('email_verified').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('email');
    table.index('role');
    table.index('created_at');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('users');
};
```

### Query Best Practices

```javascript
// 1. Use parameterized queries (prevent SQL injection)
// Bad
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Good
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);

// 2. Select only needed columns
// Bad
SELECT * FROM properties
// Good
SELECT id, plot_no, status, price FROM properties

// 3. Use indexes
// Ensure commonly queried fields have indexes

// 4. Limit results
const properties = await db.query(
  'SELECT * FROM properties LIMIT $1 OFFSET $2',
  [limit, offset]
);

// 5. Use transactions for multiple operations
const trx = await db.transaction();
try {
  await trx('properties').update({ status: 'sold' }).where({ id });
  await trx('transactions').insert({ ... });
  await trx.commit();
} catch (error) {
  await trx.rollback();
  throw error;
}
```

## Testing Guidelines

### Unit Tests

```javascript
// tests/unit/auth.service.test.js
const authService = require('../../src/services/auth.service');
const bcrypt = require('bcrypt');

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPass123!';
      const hashed = await authService.hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      
      // Verify hash
      const isValid = await bcrypt.compare(password, hashed);
      expect(isValid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      const password = 'TestPass123!';
      const hashed = await authService.hashPassword(password);
      const isValid = await authService.validatePassword(password, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPass123!';
      const hashed = await authService.hashPassword(password);
      const isValid = await authService.validatePassword('WrongPass', hashed);
      
      expect(isValid).toBe(false);
    });
  });
});
```

### Integration Tests

```javascript
// tests/integration/auth.integration.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPass123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPass123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
```

### Test Coverage Requirements

- **Unit Tests**: > 80% coverage
- **Integration Tests**: > 70% coverage
- **Critical paths**: 100% coverage

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Git Workflow

### Branch Naming Convention

```
feature/AUTH-123-user-registration
bugfix/PROP-456-fix-price-calculation
hotfix/TXN-789-payment-verification
release/v1.2.0
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Code style (formatting)
refactor: Code refactoring
test:     Tests
chore:    Build/tooling

# Examples
feat(auth): add OAuth2 Google login
fix(transactions): correct deposit calculation
docs(api): update authentication endpoints
test(properties): add integration tests
```

### Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/AUTH-123-description
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat(auth): add feature"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/AUTH-123-description
   ```

4. **PR Checklist**
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Code follows style guide
   - [ ] No linting errors
   - [ ] All tests pass
   - [ ] Reviewed by peer

5. **Merge requirements**
   - At least 1 approval
   - All CI checks pass
   - No merge conflicts

## Environment Management

### Local Development
```bash
# .env for local development
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/getplot_dev
```

### Staging
```bash
# .env.staging
NODE_ENV=staging
DATABASE_URL=postgresql://staging-db:5432/getplot_staging
```

### Production
```bash
# .env.production (managed by deployment system)
NODE_ENV=production
DATABASE_URL=postgresql://prod-db:5432/getplot_prod
```

## Debugging

### Using VS Code Debugger

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Auth Service",
      "program": "${workspaceFolder}/services/auth-service/src/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### Logging Best Practices

```javascript
const logger = require('../utils/logger');

// Different log levels
logger.error('Critical error:', error);
logger.warn('Warning message');
logger.info('Informational message');
logger.debug('Debug details');

// Structured logging
logger.info('User registered', {
  userId: user.id,
  email: user.email,
  timestamp: new Date()
});
```

## Performance Optimization

### Caching Strategy

```javascript
const redis = require('../config/redis');

// Cache with TTL
async function getProperty(id) {
  const cacheKey = `property:${id}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from DB
  const property = await db.query('SELECT * FROM properties WHERE id = $1', [id]);
  
  // Store in cache (5 min TTL)
  await redis.setex(cacheKey, 300, JSON.stringify(property));
  
  return property;
}

// Invalidate cache
async function updateProperty(id, data) {
  await db.query('UPDATE properties SET ... WHERE id = $1', [id]);
  
  // Invalidate cache
  await redis.del(`property:${id}`);
}
```

### Database Query Optimization

```javascript
// Use connection pooling
const pool = new Pool({
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000
});

// Batch operations
const properties = await db.query(
  'SELECT * FROM properties WHERE id = ANY($1)',
  [propertyIds]
);

// Use indexes
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties(location);
```

## Security Best Practices

### Input Validation

```javascript
const { body, param, query } = require('express-validator');

// Validation middleware
exports.validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must be strong'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name required')
];
```

### Sanitization

```javascript
const sanitizeHtml = require('sanitize-html');

// Sanitize user input
const clean = sanitizeHtml(dirty, {
  allowedTags: [],
  allowedAttributes: {}
});
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

2. **Database connection issues**
   ```bash
   # Check PostgreSQL is running
   docker ps | grep postgres
   
   # Check connection
   psql -h localhost -U postgres -d getplot
   ```

3. **Redis connection issues**
   ```bash
   # Check Redis
   docker ps | grep redis
   redis-cli ping
   ```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-21

