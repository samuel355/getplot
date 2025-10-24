# 🚀 Quick Start Guide - Get Plot API

Get the API running in **5 minutes**!

## Prerequisites

- Docker & Docker Compose installed
- Node.js 20+ (for local development)
- Git

## Option 1: Docker (Recommended)

### 1. Navigate to API Directory

```bash
cd /Users/knight/Apps/get-plot/API
```

### 2. Copy Environment Variables

```bash
cp env.example .env
```

**Minimum required variables** (already in .env example):
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/getplot
REDIS_HOST=redis
JWT_SECRET=dev_jwt_secret_key_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_key_change_in_production
```

### 3. Start All Services

```bash
# Start infrastructure + all services
docker-compose up --build
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- RabbitMQ (port 5672, Management: 15672)
- API Gateway (port 3000)
- Auth Service (port 3001)
- Properties Service (port 3002)

### 4. Initialize Database

Open a new terminal:

```bash
# Wait for postgres to be ready (about 30 seconds)
docker-compose ps

# Run migrations
docker exec -i getplot-postgres psql -U postgres -d getplot < scripts/init-db.sql
docker exec -i getplot-postgres psql -U postgres -d getplot < scripts/init-properties-schema.sql
```

### 5. Verify Installation

```bash
# Check API Gateway
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","service":"api-gateway","version":"1.0.0",...}
```

## Option 2: Local Development (No Docker for Services)

### 1. Start Infrastructure Only

```bash
docker-compose up -d postgres redis rabbitmq
```

### 2. Install Dependencies

```bash
# Root
npm install

# Gateway
cd gateway && npm install && cd ..

# Auth Service
cd services/auth-service && npm install && cd ../..

# Properties Service
cd services/properties-service && npm install && cd ../..

# Shared
cd shared && npm install && cd ..
```

### 3. Set Environment Variables

```bash
cp env.example .env
```

Edit `.env` for local services:
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/getplot
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev_jwt_secret_key_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_key_change_in_production
```

### 4. Run Migrations

```bash
# Connect to postgres
psql -h localhost -U postgres -d getplot

# Run SQL files
\i scripts/init-db.sql
\i scripts/init-properties-schema.sql
\q
```

### 5. Start Services

Open 3 terminals:

**Terminal 1 - API Gateway:**
```bash
cd gateway
npm run dev
# Running on port 3000
```

**Terminal 2 - Auth Service:**
```bash
cd services/auth-service
npm run dev
# Running on port 3001
```

**Terminal 3 - Properties Service:**
```bash
cd services/properties-service
npm run dev
# Running on port 3002
```

## 🧪 Test the API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+233241234567",
    "country": "Ghana"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 1800
    }
  },
  "message": "Registration successful..."
}
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Save the `accessToken` from the response!**

### 4. Get Properties

```bash
# Get all available properties in Yabi
curl "http://localhost:3000/api/v1/properties?location=yabi&status=available"

# Get properties with pagination
curl "http://localhost:3000/api/v1/properties?page=1&limit=20"

# Get specific location (for map)
curl "http://localhost:3000/api/v1/properties/location/yabi"
```

### 5. Get Protected Resource

```bash
# Replace YOUR_TOKEN with the accessToken from login
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Available Endpoints

### Authentication
```
POST   /api/v1/auth/register          # Register user
POST   /api/v1/auth/login             # Login
POST   /api/v1/auth/refresh           # Refresh token
POST   /api/v1/auth/logout            # Logout (requires auth)
POST   /api/v1/auth/forgot-password   # Request password reset
POST   /api/v1/auth/reset-password    # Reset password
GET    /api/v1/auth/verify-email      # Verify email
GET    /api/v1/auth/me                # Get current user (requires auth)
```

### Properties
```
GET    /api/v1/properties                    # List all properties
GET    /api/v1/properties/:id                # Get property by ID
GET    /api/v1/properties/location/:location # Get by location (for maps)
POST   /api/v1/properties/search             # Advanced search
GET    /api/v1/properties/stats              # Statistics
```

**Available Locations:**
- `yabi`
- `trabuom`
- `dar-es-salaam` (or `dar_es_salaam`)
- `legon-hills` (or `legon_hills`)
- `nthc`
- `berekuso`
- `saadi` (royal-court-estate)

## 🔍 Query Parameters (Properties)

```bash
# Filter by location
?location=yabi

# Filter by status
?status=available  # available | reserved | sold

# Filter by price
?minPrice=30000&maxPrice=100000

# Filter by size
?minSize=0.3&maxSize=1.0

# Sorting
?sortBy=price&order=asc  # sortBy: plotNo | price | size | createdAt

# Pagination
?page=1&limit=20
```

## 🛑 Stop Services

### Docker:
```bash
docker-compose down
```

### Local:
Press `Ctrl+C` in each terminal

## 🔄 Reset Database

```bash
# Stop containers
docker-compose down -v

# Start fresh
docker-compose up -d postgres redis rabbitmq

# Wait 30 seconds, then run migrations again
docker exec -i getplot-postgres psql -U postgres -d getplot < scripts/init-db.sql
docker exec -i getplot-postgres psql -U postgres -d getplot < scripts/init-properties-schema.sql
```

## 📝 View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f properties-service
docker-compose logs -f postgres
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
GATEWAY_PORT=3001
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Redis Connection Error
```bash
# Check if Redis is running
docker-compose ps redis

# Test connection
redis-cli ping
# Should return: PONG
```

### Services Not Starting
```bash
# Rebuild containers
docker-compose down
docker-compose up --build

# Check for errors
docker-compose logs
```

## 🎉 Success!

You should now have:
- ✅ API Gateway running on port 3000
- ✅ Auth Service running on port 3001
- ✅ Properties Service running on port 3002
- ✅ PostgreSQL with data on port 5432
- ✅ Redis on port 6379

## 📚 Next Steps

1. **Read the API Documentation**: `/docs/API_SPECIFICATION.md`
2. **Explore Architecture**: `/docs/ARCHITECTURE.md`
3. **Check Deployment Guide**: `/docs/DEPLOYMENT_GUIDE.md`
4. **Review Security**: `/docs/SECURITY.md`

## 🆘 Need Help?

- **Documentation**: Check `/docs` folder
- **Issues**: See `DEPLOYMENT_READY.md` for known issues
- **Status**: Check `IMPLEMENTATION_STATUS.md` for what's implemented

---

**Happy Coding! 🚀**

