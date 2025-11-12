# Get Plot API - Quick Reference Guide

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Start all services
yarn dev

# Run tests
yarn test
```

## 📍 Service Ports

| Service | Port | Health Check |
|---------|------|--------------|
| Gateway | 3000 | http://localhost:3000/health |
| Auth | 3001 | http://localhost:3001/health |
| Properties | 3002 | http://localhost:3002/health |
| Transactions | 3003 | http://localhost:3003/health |
| Users | 3004 | http://localhost:3004/health |
| Notifications | 3005 | http://localhost:3005/health |
| Analytics | 3006 | http://localhost:3006/health |

## 🔑 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db
DATABASE_SCHEMA=landandhomes_c_db
DATABASE_SSL=true

# Redis
REDIS_URL=rediss://default:pass@host:port

# JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# Ports
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
# ... etc
```

## 🧪 Test Commands

```bash
# All tests
yarn test

# By type
yarn test:unit
yarn test:integration
yarn test:e2e

# With coverage
yarn test:coverage

# Watch mode
yarn test:watch
```

## 📡 Common API Calls

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!","firstName":"John","lastName":"Doe"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!"}'
```

### Get Properties
```bash
curl http://localhost:3000/api/v1/properties?page=1&limit=20
```

### Get Profile (Auth Required)
```bash
curl http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🗂️ Project Structure

```
API/
├── gateway/              # API Gateway
├── services/             # Microservices
│   ├── auth-service/
│   ├── properties-service/
│   ├── transactions-service/
│   ├── users-service/
│   ├── notifications-service/
│   └── analytics-service/
├── shared/               # Shared utilities
├── tests/                # E2E tests
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## 📚 Documentation

- **[API Manual](./API_MANUAL.md)** - Complete system manual
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing documentation
- **[API Specification](./API_SPECIFICATION.md)** - Endpoint details
- **[Architecture](./ARCHITECTURE.md)** - System design

## 🐛 Troubleshooting

### Service won't start
```bash
# Check port availability
lsof -ti:3000

# Check logs
tail -f gateway/logs/error.log
```

### Database connection failed
```bash
# Test connection
psql $DATABASE_URL

# Check schema exists
psql $DATABASE_URL -c "\dn"
```

### Redis connection failed
```bash
# Test connection
redis-cli -u $REDIS_URL ping
```

## 📊 Health Checks

```bash
# Basic health
curl http://localhost:3000/health

# Readiness (includes dependencies)
curl http://localhost:3000/health/ready

# Liveness
curl http://localhost:3000/health/live
```

## 🔐 Authentication

```javascript
// Include token in requests
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

## 📝 Logs

```bash
# Gateway logs
tail -f gateway/logs/combined.log
tail -f gateway/logs/error.log

# Service logs
tail -f services/auth-service/logs/combined.log
```

## 🐳 Docker

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f gateway
```

## 📦 Useful Commands

```bash
# Install dependencies
yarn install

# Start development
yarn dev

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format
```

---

**Quick Links**: [Manual](./API_MANUAL.md) | [Testing](./TESTING_GUIDE.md) | [API Spec](./API_SPECIFICATION.md)

