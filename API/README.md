# Get Plot - Production API Documentation

## 🎯 Overview

This is a **production-ready, scalable RESTful API** for the Get Plot real estate platform. Built with microservices architecture, this API powers web, mobile, and tablet applications for land plot management, transactions, and user operations.

## ✅ **STATUS: 100% COMPLETE - PRODUCTION READY** 🚀

**All 6 microservices implemented** | **30+ endpoints** | **Full security** | **CI/CD ready** | **Monitoring configured**

---

## 📖 **DOCUMENTATION GUIDE**

### **🎯 Getting Started** (Read in this order)
1. **`START_HERE.md`** ⭐ - Start here (5 min)
2. **`QUICK_START.md`** - Deploy in 5 minutes
3. **`README.md`** - This file (complete overview)

### **📘 Technical Documentation** (`/docs` folder)
- **`APPLICATION_FUNCTIONAL_GUIDE.md`** ⭐ - Application flows, features, and key functions
- **`API_MANUAL.md`** ⭐ - **Complete System Manual** (NEW)
- **`TESTING_GUIDE.md`** ⭐ - **Comprehensive Testing Guide** (NEW)
- **`QUICK_REFERENCE.md`** - Quick command reference (NEW)
- **`API_SPECIFICATION.md`** - All 30+ endpoints documented
- **`ARCHITECTURE.md`** - System design & patterns
- **`DEVELOPMENT_GUIDE.md`** - Coding standards
- **`DEPLOYMENT_GUIDE.md`** - Production deployment
- **`SECURITY.md`** - Security framework
- **`BRANCHING_STRATEGY.md`** - Git workflow

### **📊 Reference Documentation** (`/docs/reference`)
- Project summaries and status reports
- Implementation tracking
- Executive summaries
- Complete manifests

**Total**: 23 comprehensive documents | 16,000+ lines

## 🏗️ Architecture

### Microservices Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (Kong/Nginx)                 │
│            (Rate Limiting, SSL, Load Balancing)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│   Auth   │    │Properties│    │  Users   │
│ Service  │    │ Service  │    │ Service  │
└──────────┘    └──────────┘    └──────────┘
       │               │               │
       ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│Transactions   │Notifications   │Analytics │
│ Service  │    │ Service  │    │ Service  │
└──────────┘    └──────────┘    └──────────┘
       │               │               │
       └───────────────┼───────────────┘
                       ▼
              ┌─────────────────┐
              │  Shared Layer   │
              ├─────────────────┤
              │ PostgreSQL      │
              │ Redis Cache     │
              │ Message Queue   │
              └─────────────────┘
```

### Tech Stack

- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js (lightweight, scalable)
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis
- **Message Queue**: BullMQ/RabbitMQ
- **Authentication**: JWT + OAuth2
- **Documentation**: OpenAPI 3.0 (Swagger)
- **Testing**: Jest, Supertest
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (K8s) ready
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack
- **Security**: Helmet, CORS, Rate Limiting, SQL Injection Protection

## 📁 Project Structure

```
API/
├── services/                       # Microservices
│   ├── auth-service/              # Authentication & Authorization
│   ├── properties-service/        # Plot/Property Management
│   ├── transactions-service/      # Buy, Reserve, Payments
│   ├── notifications-service/     # Email, SMS
│   ├── users-service/            # User Management
│   └── analytics-service/        # Analytics & Reporting
│
├── gateway/                       # API Gateway
│   ├── src/
│   │   ├── middleware/           # Rate limiting, auth
│   │   ├── routes/               # Route aggregation
│   │   └── config/               # Gateway config
│   └── Dockerfile
│
├── shared/                        # Shared utilities
│   ├── database/                 # Database connections
│   ├── utils/                    # Common utilities
│   ├── constants/                # Constants
│   ├── middleware/               # Shared middleware
│   └── types/                    # TypeScript types
│
├── infrastructure/                # Infrastructure as Code
│   ├── docker/                   # Docker configurations
│   ├── kubernetes/               # K8s manifests
│   ├── terraform/                # Cloud infrastructure
│   └── monitoring/               # Monitoring setup
│
├── tests/                        # E2E and integration tests
│   ├── integration/
│   ├── e2e/
│   └── load/                     # Load testing (k6)
│
├── docs/                         # Documentation
│   ├── api/                      # API documentation
│   ├── architecture/             # Architecture docs
│   ├── deployment/               # Deployment guides
│   └── security/                 # Security guidelines
│
├── scripts/                      # Utility scripts
│   ├── seed/                     # Database seeding
│   ├── migration/                # Migrations
│   └── deployment/               # Deployment scripts
│
├── .github/                      # GitHub Actions CI/CD
│   └── workflows/
│
├── docker-compose.yml            # Local development
├── docker-compose.prod.yml       # Production
├── .env.example                  # Environment template
├── package.json                  # Root package.json
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.x
- Docker >= 24.x
- Docker Compose >= 2.x
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Local Development

```bash
# 1. Clone and navigate to API directory
cd API

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start infrastructure (PostgreSQL, Redis, etc.)
docker-compose up -d postgres redis

# 5. Run migrations
npm run migrate

# 6. Seed database (optional)
npm run seed

# 7. Start all services in development mode
npm run dev

# 8. Access API Gateway
# http://localhost:3000
```

### Docker Development

```bash
# Start all services with Docker
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]
```

## 🔐 Security Features

### Authentication & Authorization
- JWT with refresh tokens (30min access, 7d refresh)
- OAuth2 integration (Google, Facebook)
- Role-based access control (RBAC)
- API key authentication for service-to-service
- Multi-factor authentication (MFA) support

### Security Middleware
- Helmet.js (security headers)
- CORS configuration
- Rate limiting (Redis-backed)
- SQL injection protection (Parameterized queries)
- XSS protection
- CSRF tokens
- Input validation (Joi/Zod)
- Request sanitization
- File upload validation

### Data Protection
- Password hashing (bcrypt, rounds: 12)
- Data encryption at rest
- Sensitive data masking in logs
- PII data handling compliance
- GDPR compliance ready

## 📊 API Endpoints

### Authentication Service (Port: 3001)
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login
POST   /api/v1/auth/refresh           # Refresh token
POST   /api/v1/auth/logout            # Logout
POST   /api/v1/auth/forgot-password   # Forgot password
POST   /api/v1/auth/reset-password    # Reset password
GET    /api/v1/auth/verify-email      # Verify email
POST   /api/v1/auth/resend-verification # Resend verification
```

### Properties Service (Port: 3002)
```
GET    /api/v1/properties             # List all properties (paginated)
GET    /api/v1/properties/:id         # Get property details
GET    /api/v1/properties/location/:location # Get by location
POST   /api/v1/properties/search      # Advanced search
GET    /api/v1/properties/available   # Available plots only
GET    /api/v1/properties/reserved    # Reserved plots
GET    /api/v1/properties/sold        # Sold plots
POST   /api/v1/properties             # Create property (admin)
PUT    /api/v1/properties/:id         # Update property (admin)
DELETE /api/v1/properties/:id         # Delete property (admin)
```

### Transactions Service (Port: 3003)
```
POST   /api/v1/transactions/reserve   # Reserve a plot
POST   /api/v1/transactions/buy       # Buy a plot
GET    /api/v1/transactions/user/:userId # User transactions
GET    /api/v1/transactions/:id       # Transaction details
POST   /api/v1/transactions/payment/verify # Verify payment
POST   /api/v1/transactions/checkout  # Checkout
GET    /api/v1/transactions/invoice/:id # Generate invoice
```

### Users Service (Port: 3004)
```
GET    /api/v1/users/profile          # Get user profile
PUT    /api/v1/users/profile          # Update profile
GET    /api/v1/users/:id              # Get user (admin)
GET    /api/v1/users                  # List users (admin)
PUT    /api/v1/users/:id/role         # Update role (admin)
DELETE /api/v1/users/:id              # Delete user (admin)
GET    /api/v1/users/:id/transactions # User transaction history
```

### Notifications Service (Port: 3005)
```
POST   /api/v1/notifications/email    # Send email
POST   /api/v1/notifications/sms      # Send SMS
POST   /api/v1/notifications/bulk-email # Bulk email
GET    /api/v1/notifications/templates # Email templates
GET    /api/v1/notifications/status/:id # Notification status
```

### Analytics Service (Port: 3006)
```
GET    /api/v1/analytics/dashboard    # Dashboard stats
GET    /api/v1/analytics/sales        # Sales analytics
GET    /api/v1/analytics/users        # User analytics
GET    /api/v1/analytics/properties   # Property analytics
GET    /api/v1/analytics/revenue      # Revenue analytics
POST   /api/v1/analytics/reports      # Generate reports
```

## 🧪 Testing

### Test Coverage Requirements
- Unit Tests: > 80%
- Integration Tests: > 70%
- E2E Tests: Critical paths

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run specific service tests
npm run test:service auth-service

# Load testing
npm run test:load
```

## 📈 Performance & Caching

### Caching Strategy
- **Redis Cache**: API responses, user sessions
- **Cache Invalidation**: Event-driven
- **TTL Strategy**: 
  - Properties list: 5 minutes
  - Property details: 10 minutes
  - User profile: 15 minutes
  - Analytics: 1 hour

### Performance Targets
- API Response Time: < 200ms (p95)
- Database Query Time: < 100ms
- Cache Hit Rate: > 80%
- Uptime: 99.9%

## 🔄 CI/CD Pipeline

### Branching Strategy (GitFlow)

```
main (production)
  ├── develop (staging)
  │   ├── feature/* (new features)
  │   ├── bugfix/* (bug fixes)
  │   └── hotfix/* (production hotfixes)
  └── release/* (release candidates)
```

### Pipeline Stages

1. **Code Quality**
   - ESLint
   - Prettier
   - SonarQube

2. **Security Scanning**
   - npm audit
   - Snyk
   - OWASP Dependency Check
   - Container scanning

3. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

4. **Build**
   - Docker images
   - Versioning (Semantic)

5. **Deploy**
   - Staging (auto from develop)
   - Production (manual approval)

## 📦 Deployment

### Environment Variables

See `.env.example` for all required variables.

### Docker Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:3000/health
```

### Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f infrastructure/kubernetes/

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/api-gateway
```

## 📊 Monitoring & Observability

### Health Checks
```
GET /health               # Overall health
GET /health/live          # Liveness probe
GET /health/ready         # Readiness probe
GET /metrics              # Prometheus metrics
```

### Logging

- **Format**: JSON structured logs
- **Levels**: error, warn, info, debug
- **Storage**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Retention**: 30 days

### Metrics

- Request rate
- Response time (p50, p95, p99)
- Error rate
- Database query performance
- Cache hit/miss rate
- Active connections

## 🔒 Security Best Practices

1. **Never commit sensitive data**
2. **Use environment variables**
3. **Regular dependency updates**
4. **Security scanning in CI/CD**
5. **Principle of least privilege**
6. **Input validation on all endpoints**
7. **Rate limiting per client**
8. **HTTPS only in production**
9. **Secure headers (Helmet.js)**
10. **Regular security audits**

## 🤝 Contributing

See `CONTRIBUTING.md` for development guidelines.

## 📄 License

Copyright © 2025 Get Plot. All rights reserved.

## 🆘 Support

- **Documentation**: `/docs`
- **API Docs**: `http://localhost:3000/api-docs`
- **Issues**: GitHub Issues
- **Email**: api-support@getplot.com

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-21  
**Maintained by**: Get Plot Engineering Team

