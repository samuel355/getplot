# Security Documentation

## Security Overview

This document outlines the security measures, best practices, and guidelines for the Get Plot API.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Data Protection](#data-protection)
3. [API Security](#api-security)
4. [Infrastructure Security](#infrastructure-security)
5. [Security Checklist](#security-checklist)
6. [Incident Response](#incident-response)

---

## Authentication & Authorization

### JWT Token Security

#### Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "customer",
    "iat": 1634825400,
    "exp": 1634827200,
    "iss": "getplot-api",
    "aud": "getplot-client"
  }
}
```

#### Token Best Practices

1. **Access Token Lifespan**: 30 minutes
2. **Refresh Token Lifespan**: 7 days
3. **Algorithm**: RS256 (asymmetric)
4. **Storage**: 
   - Access token: Memory (never localStorage)
   - Refresh token: HttpOnly cookie or secure storage

#### Token Validation

```javascript
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verify = promisify(jwt.verify);

async function validateToken(token) {
  try {
    // 1. Verify signature
    const decoded = await verify(token, PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: 'getplot-api',
      audience: 'getplot-client'
    });
    
    // 2. Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new Error('Token has been revoked');
    }
    
    // 3. Verify user still exists and is active
    const user = await db.findUserById(decoded.sub);
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### Role-Based Access Control (RBAC)

#### Roles Hierarchy

```
sysadmin (full access)
    ↓
admin (manage users, properties, transactions)
    ↓
agent (manage assigned properties)
    ↓
customer (view and transact)
```

#### Permission Matrix

| Resource | Customer | Agent | Admin | SysAdmin |
|----------|----------|-------|-------|----------|
| View properties | ✓ | ✓ | ✓ | ✓ |
| Reserve plot | ✓ | ✓ | ✓ | ✓ |
| Buy plot | ✓ | ✓ | ✓ | ✓ |
| Create property | ✗ | ✗ | ✓ | ✓ |
| Update property | ✗ | Assigned | ✓ | ✓ |
| Delete property | ✗ | ✗ | ✗ | ✓ |
| Manage users | ✗ | ✗ | ✓ | ✓ |
| Change roles | ✗ | ✗ | ✗ | ✓ |

#### Authorization Middleware

```javascript
function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      // Token already validated by auth middleware
      const { role } = req.user;
      
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to access this resource'
          }
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Usage
router.post('/properties', 
  authenticate,
  authorize('admin', 'sysadmin'),
  createProperty
);
```

### Multi-Factor Authentication (MFA)

#### TOTP Implementation

```javascript
const speakeasy = require('speakeasy');

// Generate secret
function generateMFASecret(userId) {
  const secret = speakeasy.generateSecret({
    name: `Get Plot (${userId})`,
    issuer: 'Get Plot'
  });
  
  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url
  };
}

// Verify TOTP token
function verifyMFAToken(secret, token) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 steps before/after
  });
}
```

---

## Data Protection

### Password Security

#### Password Hashing

```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  // Validate password strength first
  if (!isStrongPassword(password)) {
    throw new Error('Password does not meet requirements');
  }
  
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function isStrongPassword(password) {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}
```

#### Password Policy

- Minimum length: 8 characters
- Must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- Cannot contain:
  - Common passwords (use password blacklist)
  - User's name or email
  - Sequential characters (123, abc)
- Password history: Cannot reuse last 5 passwords
- Expiration: 90 days (optional for high-security)

### Data Encryption

#### Encryption at Rest

```javascript
const crypto = require('crypto');
const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(encrypted, iv, authTag) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage: Encrypt sensitive data before storing
async function storeDocument(userId, document) {
  const { encrypted, iv, authTag } = encrypt(document);
  
  await db.query(
    'INSERT INTO documents (user_id, content, iv, auth_tag) VALUES ($1, $2, $3, $4)',
    [userId, encrypted, iv, authTag]
  );
}
```

#### Encryption in Transit

- TLS 1.3 for all external communication
- Internal service communication over encrypted network
- Certificate pinning for mobile apps

### PII Data Handling

#### Data Classification

| Level | Examples | Protection |
|-------|----------|------------|
| Critical | Passwords, payment info | Encrypted, hashed |
| Sensitive | Email, phone, address | Encrypted |
| Personal | Name, preferences | Access controlled |
| Public | Property listings | Publicly accessible |

#### Data Masking

```javascript
function maskEmail(email) {
  const [name, domain] = email.split('@');
  const masked = name.charAt(0) + '***' + name.charAt(name.length - 1);
  return `${masked}@${domain}`;
}

function maskPhone(phone) {
  // +233241234567 → +233*****4567
  return phone.replace(/(\d{3})\d{5}(\d{4})/, '$1*****$2');
}

// Usage in logs
logger.info('User login', {
  userId: user.id,
  email: maskEmail(user.email),
  phone: maskPhone(user.phone)
});
```

---

## API Security

### Input Validation

#### Request Validation

```javascript
const { body, param, query, validationResult } = require('express-validator');

// Validation rules
const registerValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must meet requirements'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Invalid first name'),
  
  body('phone')
    .trim()
    .matches(/^\+\d{10,15}$/)
    .withMessage('Invalid phone number')
];

// Validation middleware
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
}

// Usage
router.post('/register', registerValidation, validate, register);
```

#### SQL Injection Prevention

```javascript
// ALWAYS use parameterized queries
// ❌ NEVER DO THIS
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ DO THIS
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);

// ✅ OR use ORM
const user = await User.findOne({ where: { email } });
```

#### XSS Prevention

```javascript
const xss = require('xss');
const sanitizeHtml = require('sanitize-html');

function sanitizeInput(input) {
  // Remove all HTML tags
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
}

// Apply to all user inputs
function sanitizeMiddleware(req, res, next) {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
}
```

### Rate Limiting

#### Configuration

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// General API rate limit
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true
});

// Apply limiters
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth/login', authLimiter);
```

### CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      'https://www.getplot.com',
      'https://app.getplot.com',
      'http://localhost:3000'
    ];
    
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

### Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

---

## Infrastructure Security

### Network Security

- VPC isolation
- Private subnets for databases
- Security groups (firewall rules)
- No direct database access from internet
- VPN for admin access

### Secret Management

```javascript
// Use AWS Secrets Manager or HashiCorp Vault

const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({
    SecretId: secretName
  }).promise();
  
  return JSON.parse(data.SecretString);
}

// Usage
const dbCredentials = await getSecret('prod/database/credentials');
```

### Container Security

- Use official base images
- Scan images for vulnerabilities (Snyk, Trivy)
- Run as non-root user
- Minimal image size
- Regular updates

```dockerfile
FROM node:20-alpine AS base

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

EXPOSE 3000

CMD ["node", "src/server.js"]
```

---

## Security Checklist

### Development

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection
- [ ] CSRF protection for state-changing operations
- [ ] Proper error handling (no sensitive data in errors)
- [ ] Secure password hashing (bcrypt, rounds >= 12)
- [ ] JWT with short expiration
- [ ] Secrets in environment variables (never in code)
- [ ] Dependencies up to date
- [ ] Security linting (ESLint security plugins)

### Deployment

- [ ] HTTPS/TLS 1.3 enabled
- [ ] Security headers configured (Helmet.js)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] API key authentication for service-to-service
- [ ] Database credentials rotated
- [ ] Secrets stored securely (AWS Secrets Manager)
- [ ] Container scanning enabled
- [ ] Logging enabled (no sensitive data logged)
- [ ] Monitoring and alerting configured

### Operations

- [ ] Regular security audits
- [ ] Dependency scanning (npm audit, Snyk)
- [ ] Penetration testing
- [ ] Incident response plan
- [ ] Backup and disaster recovery
- [ ] Access control review
- [ ] Security training for team

---

## Incident Response

### Security Incident Procedure

1. **Detection**: Monitor logs, alerts
2. **Assessment**: Determine severity and scope
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threat
5. **Recovery**: Restore systems
6. **Post-incident**: Review and improve

### Common Incidents

#### Suspected Token Compromise

```javascript
// Revoke all user tokens
async function revokeAllUserTokens(userId) {
  // Add all active tokens to blacklist
  const tokens = await db.getUserActiveSessions(userId);
  
  for (const token of tokens) {
    await redis.setex(
      `blacklist:${token}`,
      3600, // 1 hour
      'compromised'
    );
  }
  
  // Force password reset
  await db.updateUser(userId, {
    requires_password_reset: true
  });
  
  // Notify user
  await sendEmail(userId, 'security_alert');
}
```

#### Data Breach Response

1. Identify scope of breach
2. Notify affected users (GDPR compliance)
3. Revoke compromised credentials
4. Review and patch vulnerability
5. Document incident
6. Report to authorities if required

---

## Compliance

### GDPR Compliance

- Data minimization
- Right to access
- Right to erasure
- Data portability
- Consent management
- Data protection by design

### PCI DSS (if handling card data)

- Never store full PAN
- Use PCI-compliant payment processor
- Tokenization for card storage
- Regular security assessments

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-21
**Security Contact**: security@getplot.com

