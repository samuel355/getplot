# Getting Started with Get Plot API

This guide will help you set up the Get Plot API on your local machine for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **npm** >= 10.0.0 (comes with Node.js)
- **Docker** >= 24.x ([Download](https://www.docker.com/get-started))
- **Docker Compose** >= 2.x (comes with Docker Desktop)
- **Git** ([Download](https://git-scm.com/))

Verify installations:
```bash
node --version   # Should be v20.x.x or higher
npm --version    # Should be 10.x.x or higher
docker --version # Should be 24.x.x or higher
git --version
```

## Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
# Navigate to the API directory
cd /Users/knight/Apps/get-plot/API
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
# For local development, the default values should work
```

### 4. Start Infrastructure with Docker

```bash
# Start PostgreSQL, Redis, and RabbitMQ
docker-compose up -d postgres redis rabbitmq

# Wait for services to be healthy (about 30 seconds)
docker-compose ps
```

### 5. Initialize Database

```bash
# Run database migrations
npm run migrate

# Seed database with sample data (optional)
npm run seed:dev
```

### 6. Start All Services

```bash
# Start all microservices
npm run dev
```

This will start:
- API Gateway on port 3000
- Auth Service on port 3001
- Properties Service on port 3002
- Transactions Service on port 3003
- Users Service on port 3004
- Notifications Service on port 3005
- Analytics Service on port 3006

### 7. Verify Installation

```bash
# Check API Gateway health
curl http://localhost:3000/health

# You should see a response like:
# {"status":"healthy","version":"1.0.0",...}
```

## Alternative: Start Individual Services

If you prefer to start services individually:

```bash
# Terminal 1: Start Auth Service
cd services/auth-service
npm install
npm run dev

# Terminal 2: Start Properties Service
cd services/properties-service
npm install
npm run dev

# ... and so on for other services
```

## Access Points

Once all services are running:

- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Auth Service**: http://localhost:3001
- **Properties Service**: http://localhost:3002
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **PostgreSQL**: localhost:5432 (postgres/postgres)
- **Redis**: localhost:6379

## Testing the API

### Register a User

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

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Save the `accessToken` from the response.

### Get Properties

```bash
curl http://localhost:3000/api/v1/properties \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Development Workflow

### Run Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

### Lint Code

```bash
# Check for linting errors
npm run lint:check

# Fix linting errors automatically
npm run lint
```

### Format Code

```bash
# Check code formatting
npm run format:check

# Format code automatically
npm run format
```

## Docker Commands

### Start all services (including microservices)

```bash
docker-compose up --build
```

### Stop all services

```bash
docker-compose down
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f auth-service
```

### Reset database

```bash
# Stop containers and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d postgres redis rabbitmq
npm run migrate
```

## Common Issues & Solutions

### Port Already in Use

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
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

### Permission Denied (Docker on Linux)

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Logout and login again
```

## Project Structure

```
API/
├── gateway/                # API Gateway
├── services/              # Microservices
│   ├── auth-service/
│   ├── properties-service/
│   ├── transactions-service/
│   ├── users-service/
│   ├── notifications-service/
│   └── analytics-service/
├── shared/                # Shared utilities
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── tests/                 # E2E tests
├── package.json
├── docker-compose.yml
└── README.md
```

## Next Steps

1. **Read the Documentation**
   - [Architecture Documentation](./docs/ARCHITECTURE.md)
   - [API Specification](./docs/API_SPECIFICATION.md)
   - [Development Guide](./docs/DEVELOPMENT_GUIDE.md)
   - [Security Documentation](./docs/SECURITY.md)

2. **Explore the Code**
   - Start with the Auth Service
   - Look at shared utilities
   - Check out the API Gateway configuration

3. **Make Your First Contribution**
   - Pick an issue from GitHub
   - Create a feature branch
   - Make changes and test
   - Submit a pull request

4. **Join the Community**
   - Slack: [workspace link]
   - Email: engineering@getplot.com

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/getplot

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_key_minimum_32_characters
```

### Optional Variables

```bash
# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# SMS (for notifications)
AFRICASTALKING_API_KEY=your_api_key
AFRICASTALKING_USERNAME=your_username

# Payment (for transactions)
PAYSTACK_SECRET_KEY=sk_test_your_key
```

See `env.example` for complete list.

## Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Docker
- GitLens
- Thunder Client (API testing)

### Database Tools

- DBeaver (GUI for PostgreSQL)
- TablePlus (GUI for PostgreSQL & Redis)
- pgAdmin (PostgreSQL admin)

### API Testing

- Postman
- Insomnia
- Thunder Client (VS Code extension)
- curl (command line)

## Getting Help

- **Documentation**: Check the `/docs` folder
- **Issues**: GitHub Issues
- **Questions**: engineering@getplot.com
- **Slack**: [workspace link]

## License

Copyright © 2025 Get Plot. All rights reserved.

---

**Happy Coding! 🚀**

If you encounter any issues, please check the [Troubleshooting Guide](./docs/DEVELOPMENT_GUIDE.md#troubleshooting) or reach out to the team.

