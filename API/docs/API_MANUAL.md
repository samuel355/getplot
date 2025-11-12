# Get Plot API - Complete System Manual

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [Configuration](#configuration)
6. [Services Documentation](#services-documentation)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Authentication & Authorization](#authentication--authorization)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Monitoring & Logging](#monitoring--logging)
13. [Troubleshooting](#troubleshooting)
14. [Best Practices](#best-practices)

---

## Introduction

### What is Get Plot API?

Get Plot API is a production-ready, scalable microservices-based REST API for managing real estate properties, transactions, users, and notifications. It's built with Node.js, Express.js, PostgreSQL, and Redis.

### Key Features

- ✅ **Microservices Architecture** - 6 independent services
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Rate Limiting** - Redis-backed request throttling
- ✅ **Database Schema Support** - Multi-schema PostgreSQL
- ✅ **Comprehensive Testing** - Unit, Integration, E2E tests
- ✅ **Docker Ready** - Containerized deployment
- ✅ **Monitoring** - Health checks and metrics
- ✅ **Production Ready** - Security, logging, error handling

### Technology Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose
- **Package Manager**: Yarn (recommended) or npm

---

## System Overview

### Service Architecture

```
┌─────────────────────────────────────────┐
│         API Gateway (Port 3000)          │
│  - Rate Limiting                         │
│  - Request Routing                       │
│  - Security Headers                      │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│  Auth  │ │Properties│ │ Users  │
│ (3001) │ │  (3002) │ │ (3004) │
└────────┘ └────────┘ └────────┘
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Transactions│Notifications│Analytics│
│  (3003) │ │  (3005) │ │ (3006) │
└────────┘ └────────┘ └────────┘
    │          │          │
    └──────────┼──────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────┐      ┌──────────┐
│PostgreSQL│      │  Redis   │
│(Supabase)│      │ (Upstash)│
└──────────┘      └──────────┘
```

### Service Responsibilities

| Service | Port | Responsibility |
|---------|------|----------------|
| **Gateway** | 3000 | Request routing, rate limiting, security |
| **Auth** | 3001 | User authentication, JWT tokens, password management |
| **Properties** | 3002 | Property/plot CRUD, search, filtering |
| **Transactions** | 3003 | Purchase, reservation, payment processing |
| **Users** | 3004 | User profiles, preferences, activity |
| **Notifications** | 3005 | Email, SMS notifications |
| **Analytics** | 3006 | Analytics, reporting, dashboards |

---

## Architecture

### Microservices Pattern

Each service is:
- **Independent** - Can be deployed separately
- **Stateless** - No shared state between instances
- **Database-per-service** - Each service has its own schema/tables
- **API Gateway** - Single entry point for all requests

### Request Flow

```
Client Request
    ↓
API Gateway (Port 3000)
    ├─ Rate Limiting Check
    ├─ Authentication (if required)
    └─ Route to Service
        ↓
Target Microservice
    ├─ Business Logic
    ├─ Database Query
    ├─ Cache Check/Update
    └─ Response
        ↓
API Gateway
    └─ Response to Client
```

### Data Flow

```
Service → Shared Database Module → PostgreSQL (Supabase)
Service → Shared Redis Module → Redis (Upstash)
Service → Shared Logger → Winston → Log Files
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.x
- Yarn >= 1.22.x (or npm >= 10.x)
- PostgreSQL 15+ (or Supabase account)
- Redis 7+ (or Upstash account)
- Docker & Docker Compose (optional, for containerized deployment)

### Installation

```bash
# 1. Navigate to API directory
cd API

# 2. Install dependencies (using yarn recommended)
yarn install

# 3. Copy environment file
cp env.local .env  # or create from env.example

# 4. Configure environment variables (see Configuration section)

# 5. Install service dependencies
yarn install  # This runs postinstall script
```

### Running Services

#### Development Mode (All Services)

```bash
# Start all services concurrently
yarn dev

# Or start individually:
yarn dev:gateway      # Port 3000
yarn dev:auth         # Port 3001
yarn dev:properties   # Port 3002
yarn dev:transactions # Port 3003
yarn dev:users        # Port 3004
yarn dev:notifications # Port 3005
```

#### Production Mode

```bash
# Start all services
yarn start

# Or use Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Verifying Installation

```bash
# Check gateway health
curl http://localhost:3000/health

# Check API documentation
curl http://localhost:3000/api-docs

# Check readiness (includes Redis check)
curl http://localhost:3000/health/ready
```

---

## Configuration

### Environment Variables

All configuration is in `env.local` (or `.env`). Key variables:

#### Database Configuration

```bash
# Supabase PostgreSQL Connection
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_SSL=true
DATABASE_SCHEMA=landandhomes_c_db  # Your schema name
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

#### Redis Configuration

```bash
# Upstash Redis Connection
REDIS_URL=rediss://default:password@host:port
REDIS_HOST=localhost  # Fallback
REDIS_PORT=6379       # Fallback
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

#### Service Ports

```bash
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
PROPERTIES_SERVICE_PORT=3002
TRANSACTIONS_SERVICE_PORT=3003
USERS_SERVICE_PORT=3004
NOTIFICATIONS_SERVICE_PORT=3005
ANALYTICS_SERVICE_PORT=3006
```

#### JWT Configuration

```bash
JWT_SECRET=your_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=1hr
```

#### Rate Limiting

```bash
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
```

### Database Schema Configuration

The system uses a custom schema (`landandhomes_c_db` by default). To set up:

1. **Create Schema in Supabase**:
   ```sql
   CREATE SCHEMA IF NOT EXISTS landandhomes_c_db;
   ```

2. **Run Schema SQL**:
   ```bash
   # Execute the SQL file in Supabase SQL Editor
   # File: database/landandhomes_c_db.sql
   ```

3. **Set Schema in Environment**:
   ```bash
   DATABASE_SCHEMA=landandhomes_c_db
   ```

### Service URLs

Services communicate via HTTP. Configure in `env.local`:

```bash
AUTH_SERVICE_URL=http://localhost:3001
PROPERTIES_SERVICE_URL=http://localhost:3002
TRANSACTIONS_SERVICE_URL=http://localhost:3003
USERS_SERVICE_URL=http://localhost:3004
NOTIFICATIONS_SERVICE_URL=http://localhost:3005
ANALYTICS_SERVICE_URL=http://localhost:3006
```

---

## Services Documentation

### 1. API Gateway

**Location**: `gateway/`  
**Port**: 3000  
**Purpose**: Entry point, routing, rate limiting

#### Features

- Request routing to microservices
- Rate limiting (Redis-backed)
- Security headers (Helmet)
- CORS configuration
- Health check endpoints
- Request logging

#### Key Files

- `gateway/src/app.js` - Express app configuration
- `gateway/src/server.js` - Server startup
- `gateway/src/routes/index.js` - Route definitions
- `gateway/src/middleware/rateLimiter.js` - Rate limiting
- `gateway/src/config/index.js` - Configuration

#### Health Endpoints

```bash
GET /health          # Basic health check
GET /health/live     # Liveness probe
GET /health/ready    # Readiness probe (checks Redis)
GET /api-docs        # API documentation
```

### 2. Auth Service

**Location**: `services/auth-service/`  
**Port**: 3001  
**Purpose**: Authentication and authorization

#### Features

- User registration
- Login/logout
- JWT token generation
- Password reset
- Email verification
- Refresh tokens

#### Endpoints

See [API Endpoints](#api-endpoints) section.

#### Key Files

- `services/auth-service/src/services/auth.service.js` - Business logic
- `services/auth-service/src/controllers/auth.controller.js` - Request handlers
- `services/auth-service/src/middleware/auth.middleware.js` - Auth middleware

### 3. Properties Service

**Location**: `services/properties-service/`  
**Port**: 3002  
**Purpose**: Property/plot management

#### Features

- Property CRUD operations
- Search and filtering
- Location-based queries
- Status management (available, reserved, sold)

#### Key Files

- `services/properties-service/src/services/properties.service.js` - Business logic
- `services/properties-service/src/controllers/properties.controller.js` - Request handlers

### 4. Transactions Service

**Location**: `services/transactions-service/`  
**Port**: 3003  
**Purpose**: Transaction processing

#### Features

- Plot reservation
- Purchase processing
- Payment verification
- Invoice generation
- Transaction history

#### Key Files

- `services/transactions-service/src/services/transactions.service.js` - Business logic
- `services/transactions-service/src/services/pdf.service.js` - PDF generation

### 5. Users Service

**Location**: `services/users-service/`  
**Port**: 3004  
**Purpose**: User management

#### Features

- Profile management
- User preferences
- Saved properties
- Activity tracking

### 6. Notifications Service

**Location**: `services/notifications-service/`  
**Port**: 3005  
**Purpose**: Notifications

#### Features

- Email sending
- SMS sending
- Bulk notifications
- Template management

### 7. Analytics Service

**Location**: `services/analytics-service/`  
**Port**: 3006  
**Purpose**: Analytics and reporting

#### Features

- Dashboard statistics
- Sales analytics
- User analytics
- Revenue reports

---

## API Endpoints

### Authentication Endpoints

**Base URL**: `http://localhost:3000/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| POST | `/refresh` | Refresh access token | No (refresh token) |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password | No (token) |
| GET | `/verify-email` | Verify email address | No (token) |
| POST | `/resend-verification` | Resend verification email | Yes |

#### Example: Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+233241234567",
    "country": "Ghana"
  }'
```

#### Example: Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci...",
      "expiresIn": "15m"
    }
  }
}
```

### Properties Endpoints

**Base URL**: `http://localhost:3000/api/v1/properties`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List properties (paginated) | No |
| GET | `/:id` | Get property details | No |
| GET | `/location/:location` | Get by location | No |
| POST | `/search` | Advanced search | No |
| GET | `/available` | Available properties | No |
| POST | `/` | Create property | Yes (Admin) |
| PUT | `/:id` | Update property | Yes (Admin) |
| DELETE | `/:id` | Delete property | Yes (Admin) |

#### Example: List Properties

```bash
curl http://localhost:3000/api/v1/properties?page=1&limit=20
```

#### Example: Search Properties

```bash
curl -X POST http://localhost:3000/api/v1/properties/search \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Accra",
    "minPrice": 10000,
    "maxPrice": 100000,
    "status": "available"
  }'
```

### Transactions Endpoints

**Base URL**: `http://localhost:3000/api/v1/transactions`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reserve` | Reserve a plot | Yes |
| POST | `/buy` | Purchase a plot | Yes |
| GET | `/user/:userId` | User transactions | Yes |
| GET | `/:id` | Transaction details | Yes |
| POST | `/payment/verify` | Verify payment | Yes |

### Users Endpoints

**Base URL**: `http://localhost:3000/api/v1/users`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| GET | `/preferences` | Get preferences | Yes |
| PUT | `/preferences` | Update preferences | Yes |
| GET | `/saved-properties` | Get saved properties | Yes |
| POST | `/saved-properties/:propertyId` | Save property | Yes |
| DELETE | `/saved-properties/:propertyId` | Unsave property | Yes |

### Notifications Endpoints

**Base URL**: `http://localhost:3000/api/v1/notifications`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/email` | Send email | Yes (Service) |
| POST | `/sms` | Send SMS | Yes (Service) |
| POST | `/bulk-email` | Bulk email | Yes (Service) |

---

## Database Schema

### Schema: `landandhomes_c_db`

The system uses a custom PostgreSQL schema. Key tables:

#### Core Tables

- `properties` - Property/plot information
- `users` - User accounts (if separate from auth)
- `transactions` - Purchase/reservation records
- `notifications` - Notification records
- `activity_logs` - System activity tracking

#### Property Tables

- `asokore_mampong` - Asokore Mampong plots
- `berekuso` - Berekuso plots
- `dar_es_salaam` - Dar es Salaam plots
- `legon_hills` - Legon Hills plots
- `nthc` - Nthc plots
- `saadi` - Saadi plots
- `trabuom` - Trabuom plots
- `yabi` - Yabi plots

#### Interest Tables

Each property table has a corresponding `_interests` table:
- `asokore_mampong_interests`
- `berekuso_interests`
- etc.

### Database Connection

The shared database module (`shared/database/index.js`) handles:

- Connection pooling
- SSL configuration for Supabase
- Query execution
- Transactions
- Health checks

### Using the Database

```javascript
const { database } = require('@getplot/shared');

// Connect
await database.connect();

// Query
const result = await database.query(
  'SELECT * FROM landandhomes_c_db.properties WHERE status = $1',
  ['available']
);

// Transaction
await database.transaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
});
```

---

## Authentication & Authorization

### JWT Tokens

The system uses JWT (JSON Web Tokens) for authentication:

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (1 hour), used to get new access tokens

### Token Structure

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Using Tokens

```bash
# Include in Authorization header
curl http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Roles

- `user` - Regular user
- `admin` - Administrator
- `agent` - Property agent
- `moderator` - Content moderator

### Protected Routes

Routes requiring authentication check for:
1. Valid JWT token in `Authorization` header
2. Token not expired
3. User exists and is active
4. Role permissions (if required)

---

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing documentation.

### Quick Test Commands

```bash
# Run all tests
yarn test

# Unit tests only
yarn test:unit

# Integration tests only
yarn test:integration

# E2E tests only
yarn test:e2e

# With coverage
yarn test:coverage

# Watch mode
yarn test:watch
```

### Test Structure

```
tests/
├── setup.js                    # Global test setup
├── unit/                       # Unit tests
├── integration/                # Integration tests
└── e2e/                        # End-to-end tests

services/
└── [service-name]/
    └── tests/
        ├── unit/               # Service unit tests
        └── integration/        # Service integration tests
```

---

## Deployment

### Docker Deployment

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Environment-Specific Configuration

- **Development**: `env.local`
- **Staging**: `.env.staging`
- **Production**: `.env.production` (never commit!)

### Health Checks

All services expose health endpoints:
- `/health` - Basic health
- `/health/live` - Liveness probe
- `/health/ready` - Readiness probe

---

## Monitoring & Logging

### Logging

Logs are written to:
- `gateway/logs/combined.log` - All logs
- `gateway/logs/error.log` - Errors only

Log levels: `error`, `warn`, `info`, `debug`

### Metrics

Services expose Prometheus metrics at `/metrics` endpoint.

### Health Monitoring

```bash
# Check gateway health
curl http://localhost:3000/health

# Check readiness (includes dependencies)
curl http://localhost:3000/health/ready
```

---

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

**Problem**: Service fails to start

**Solutions**:
- Check if port is already in use: `lsof -ti:3000`
- Verify environment variables are set
- Check database connection
- Review logs: `tail -f gateway/logs/error.log`

#### 2. Database Connection Failed

**Problem**: Cannot connect to PostgreSQL

**Solutions**:
- Verify `DATABASE_URL` is correct
- Check SSL settings (`DATABASE_SSL=true` for Supabase)
- Ensure schema exists: `CREATE SCHEMA landandhomes_c_db;`
- Test connection: `psql $DATABASE_URL`

#### 3. Redis Connection Failed

**Problem**: Redis connection errors

**Solutions**:
- Verify `REDIS_URL` is correct
- Check Upstash dashboard
- Test connection: `redis-cli -u $REDIS_URL ping`

#### 4. Rate Limiting Too Strict

**Problem**: Getting 429 (Too Many Requests)

**Solutions**:
- Adjust `RATE_LIMIT_MAX_REQUESTS` in `env.local`
- Increase `RATE_LIMIT_WINDOW_MS`
- Check Redis connection

#### 5. JWT Token Invalid

**Problem**: Authentication fails

**Solutions**:
- Verify `JWT_SECRET` matches across services
- Check token expiration
- Ensure token is in `Authorization: Bearer <token>` format

---

## Best Practices

### Development

1. **Always use environment variables** - Never hardcode secrets
2. **Follow code style** - Use ESLint and Prettier
3. **Write tests** - Maintain >80% coverage
4. **Use transactions** - For multi-step database operations
5. **Handle errors** - Always catch and log errors
6. **Validate input** - Validate all user input
7. **Use connection pooling** - Don't create new connections per request

### Security

1. **Never commit secrets** - Use `.env` files (in `.gitignore`)
2. **Use HTTPS** - In production
3. **Validate JWT tokens** - On every protected route
4. **Sanitize input** - Prevent SQL injection, XSS
5. **Rate limit** - Protect against abuse
6. **Log security events** - Track suspicious activity

### Performance

1. **Use Redis caching** - Cache frequently accessed data
2. **Optimize queries** - Use indexes, avoid N+1 queries
3. **Connection pooling** - Reuse database connections
4. **Async operations** - Don't block the event loop
5. **Monitor metrics** - Track response times, error rates

### Deployment

1. **Use Docker** - For consistent environments
2. **Health checks** - Implement liveness and readiness probes
3. **Graceful shutdown** - Handle SIGTERM properly
4. **Logging** - Centralized logging in production
5. **Monitoring** - Set up alerts for critical metrics

---

## Additional Resources

- [API Specification](./API_SPECIFICATION.md) - Detailed endpoint documentation
- [Architecture Guide](./ARCHITECTURE.md) - System design details
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Coding standards
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment
- [Security Guide](./SECURITY.md) - Security best practices
- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing documentation

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-12  
**Maintained by**: Get Plot Engineering Team

