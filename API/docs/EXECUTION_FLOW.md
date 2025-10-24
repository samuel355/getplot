# 🔄 API Execution Flow - Entry Points

**Understanding how the API starts and processes requests**

---

## 🎯 THE ENTRY POINT (Like React's index.js)

### **For Each Microservice**

```
Entry Point Flow:
server.js → app.js → routes → controllers → services → database
   ↓          ↓         ↓          ↓            ↓          ↓
 START    EXPRESS   ROUTING   HANDLERS    LOGIC      DATA
```

---

## 📍 **DETAILED EXECUTION FLOW**

### **1. SERVER.JS** (Entry Point - Like index.js in React)

**Location**: `services/[service-name]/src/server.js`

```javascript
// This is where EVERYTHING starts
const app = require('./app');              // Import Express app
const config = require('./config');        // Load configuration
const { database, redis, logger } = require('@getplot/shared');

async function startServer() {
  // 1. Connect to database
  await database.connect();
  
  // 2. Connect to Redis
  await redis.connect();
  
  // 3. Start HTTP server
  const server = app.listen(config.port, () => {
    logger.info(`Service running on port ${config.port}`);
  });
  
  // 4. Handle graceful shutdown
  process.on('SIGTERM', async () => {
    await database.disconnect();
    await redis.disconnect();
    process.exit(0);
  });
}

startServer(); // ← EXECUTION STARTS HERE
```

**What it does**:
- ✅ Loads configuration
- ✅ Connects to database
- ✅ Connects to Redis
- ✅ Starts the HTTP server
- ✅ Sets up graceful shutdown

---

### **2. APP.JS** (Like App.js in React)

**Location**: `services/[service-name]/src/app.js`

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes/[service].routes');

const app = express();

// 1. Security middleware
app.use(helmet());           // Security headers
app.use(cors());             // CORS

// 2. Body parsing
app.use(express.json());     // Parse JSON bodies

// 3. Logging
app.use(morgan('dev'));      // Request logging

// 4. Health checks
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// 5. API routes (THE MAIN ROUTES)
app.use('/api/v1/[resource]', routes);

// 6. Error handling
app.use(errorHandler);       // Global error handler

module.exports = app;
```

**What it does**:
- ✅ Creates Express app
- ✅ Adds middleware (security, CORS, parsing)
- ✅ Defines health check endpoints
- ✅ Mounts API routes
- ✅ Adds error handling

---

### **3. ROUTES** (Like Route definitions in React Router)

**Location**: `services/[service-name]/src/routes/[service].routes.js`

```javascript
const express = require('express');
const controller = require('../controllers/[service].controller');

const router = express.Router();

// Define all endpoints
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/profile', authenticate, controller.getProfile);

module.exports = router;
```

**What it does**:
- ✅ Defines URL paths
- ✅ Maps URLs to controllers
- ✅ Adds middleware (auth, validation)

---

### **4. CONTROLLERS** (Like React Components - Handle Requests)

**Location**: `services/[service-name]/src/controllers/[service].controller.js`

```javascript
const service = require('../services/[service].service');

class Controller {
  register = async (req, res) => {
    // 1. Get data from request
    const data = req.body;
    
    // 2. Call service (business logic)
    const result = await service.register(data);
    
    // 3. Send response
    return res.status(201).json({
      success: true,
      data: result
    });
  };
}

module.exports = new Controller();
```

**What it does**:
- ✅ Receives HTTP requests
- ✅ Validates input
- ✅ Calls service layer
- ✅ Sends HTTP responses

---

### **5. SERVICES** (Business Logic - Like React Hooks/Context)

**Location**: `services/[service-name]/src/services/[service].service.js`

```javascript
const { database, redis } = require('@getplot/shared');

class Service {
  async register(userData) {
    // 1. Check if user exists
    const existing = await database.query(
      'SELECT * FROM users WHERE email = $1',
      [userData.email]
    );
    
    // 2. Hash password
    const hash = await bcrypt.hash(userData.password);
    
    // 3. Create user in database
    const result = await database.query(
      'INSERT INTO users (...) VALUES (...)',
      [...]
    );
    
    // 4. Cache user data
    await redis.set(`user:${result.id}`, JSON.stringify(result));
    
    return result;
  }
}

module.exports = new Service();
```

**What it does**:
- ✅ Contains business logic
- ✅ Interacts with database
- ✅ Manages caching
- ✅ Handles complex operations

---

### **6. DATABASE/REDIS** (Data Layer - Like API calls in React)

**Location**: `shared/database/index.js` and `shared/database/redis.js`

```javascript
// PostgreSQL queries
await database.query('SELECT * FROM users WHERE id = $1', [userId]);

// Redis caching
await redis.get('user:123');
await redis.set('user:123', data, 300); // 5 min TTL
```

---

## 🔄 **COMPLETE REQUEST FLOW**

### **Example: User Registration**

```
1. CLIENT SENDS REQUEST
   POST http://localhost:3000/api/v1/auth/register
   Body: { email, password, firstName, lastName }
   
   ↓

2. API GATEWAY (gateway/src/server.js)
   - Receives request on port 3000
   - Applies rate limiting (5 req/15min for registration)
   - Proxies to Auth Service
   
   ↓

3. AUTH SERVICE - SERVER.JS (Entry Point)
   services/auth-service/src/server.js
   - HTTP server receives request on port 3001
   
   ↓

4. AUTH SERVICE - APP.JS (Express App)
   services/auth-service/src/app.js
   - Security middleware (Helmet, CORS)
   - Body parser (JSON)
   - Request logging
   
   ↓

5. ROUTES (URL Mapping)
   services/auth-service/src/routes/auth.routes.js
   - POST /register → authController.register
   
   ↓

6. CONTROLLER (Request Handler)
   services/auth-service/src/controllers/auth.controller.js
   - Validates input (Joi schema)
   - Calls authService.register()
   
   ↓

7. SERVICE (Business Logic)
   services/auth-service/src/services/auth.service.js
   - Checks if email exists (database query)
   - Hashes password (bcrypt, 12 rounds)
   - Creates user in database (transaction)
   - Creates user profile
   - Generates JWT tokens
   - Logs activity
   
   ↓

8. DATABASE (Data Layer)
   shared/database/index.js
   - Executes SQL: INSERT INTO auth.users (...)
   - Executes SQL: INSERT INTO users.profiles (...)
   - Returns created user
   
   ↓

9. RESPONSE BACK TO CLIENT
   - Service formats response
   - Controller sends HTTP 201 Created
   - Gateway proxies response back
   - Client receives:
     {
       "success": true,
       "data": {
         "user": { ... },
         "tokens": { "accessToken": "...", "refreshToken": "..." }
       }
     }
```

---

## 🎯 **EXAMPLE: GET PROPERTIES**

```
1. CLIENT REQUEST
   GET http://localhost:3000/api/v1/properties?location=yabi&status=available
   
   ↓

2. API GATEWAY
   - Receives on port 3000
   - Applies rate limiting (100 req/15min)
   - Proxies to Properties Service
   
   ↓

3. PROPERTIES SERVICE - SERVER.JS
   services/properties-service/src/server.js (port 3002)
   
   ↓

4. PROPERTIES SERVICE - APP.JS
   - Middleware processing
   
   ↓

5. ROUTES
   services/properties-service/src/routes/properties.routes.js
   - GET / → propertiesController.getProperties
   
   ↓

6. CONTROLLER
   services/properties-service/src/controllers/properties.controller.js
   - Extracts query params (location, status, page, limit)
   - Calls propertiesService.getProperties()
   
   ↓

7. SERVICE
   services/properties-service/src/services/properties.service.js
   
   7a. CHECK CACHE
       - Looks in Redis: 'properties:yabi:available'
       - If found → return cached data (FAST!)
   
   7b. IF NOT IN CACHE
       - Queries database:
         SELECT * FROM properties.yabi 
         WHERE status = 'available'
         ORDER BY created_at DESC
         LIMIT 20 OFFSET 0
       - Formats results
       - Stores in Redis (5 min TTL)
       - Returns data
   
   ↓

8. DATABASE/REDIS
   - PostgreSQL returns plot data with GeoJSON coordinates
   - Redis caches for next request
   
   ↓

9. RESPONSE
   {
     "success": true,
     "data": [
       {
         "id": "uuid",
         "plotNo": "26A",
         "location": "yabi",
         "status": "available",
         "coordinates": { "type": "Polygon", ... }
       }
     ],
     "pagination": { "page": 1, "total": 150, ... }
   }
```

---

## 🔍 **FILE EXECUTION ORDER (Startup)**

### **When you run `docker-compose up`**

```
1. Docker Compose reads docker-compose.yml
2. Starts infrastructure:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - RabbitMQ (port 5672)

3. Waits for health checks to pass

4. Starts services in parallel:
   
   API Gateway (Port 3000):
   gateway/src/server.js
     └→ gateway/src/app.js
         └→ gateway/src/routes/index.js
   
   Auth Service (Port 3001):
   services/auth-service/src/server.js
     └→ services/auth-service/src/app.js
         └→ services/auth-service/src/routes/auth.routes.js
             └→ controllers → services → database
   
   Properties Service (Port 3002):
   services/properties-service/src/server.js
     └→ services/properties-service/src/app.js
         └→ services/properties-service/src/routes/properties.routes.js
             └→ controllers → services → database/redis
   
   [And so on for other services...]

5. Each service:
   - Connects to database
   - Connects to Redis
   - Starts listening on its port
   - Reports "Service running on port XXXX"

6. API Gateway ready to receive requests
```

---

## 🎯 **SIMPLIFIED VISUAL FLOW**

```
┌─────────────────────────────────────────────────────┐
│  CLIENT (Web/Mobile App)                            │
│  Makes request: POST /api/v1/auth/register          │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  API GATEWAY (Port 3000)                            │
│  gateway/src/server.js (entry point)                │
│    ↓                                                 │
│  gateway/src/app.js (Express app)                   │
│    ↓                                                 │
│  gateway/src/routes/index.js (routing)              │
│    - Applies rate limiting                          │
│    - Proxies to Auth Service                        │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  AUTH SERVICE (Port 3001)                           │
│  services/auth-service/src/server.js ← ENTRY POINT  │
│    ↓                                                 │
│  services/auth-service/src/app.js                   │
│    - Security middleware                            │
│    - Body parsing                                   │
│    ↓                                                 │
│  src/routes/auth.routes.js                          │
│    - POST /register → controller.register           │
│    ↓                                                 │
│  src/controllers/auth.controller.js                 │
│    - Validates input                                │
│    - Calls service                                  │
│    ↓                                                 │
│  src/services/auth.service.js                       │
│    - Business logic                                 │
│    - Hash password                                  │
│    - Create user                                    │
│    - Generate tokens                                │
│    ↓                                                 │
│  shared/database/index.js                           │
│    - Execute SQL                                    │
│    - Return results                                 │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  RESPONSE BACK TO CLIENT                            │
│  { success: true, data: { user, tokens } }          │
└─────────────────────────────────────────────────────┘
```

---

## 📝 **SPECIFIC ENTRY POINTS**

### **API Gateway** (Main Entry)

```
gateway/src/server.js        ← MAIN ENTRY POINT FOR ALL REQUESTS
  ↓
gateway/src/app.js           ← Express app configuration
  ↓
gateway/src/routes/index.js  ← Routes to all services
```

**Start command**: 
```bash
cd gateway
npm run dev
# Starts: node src/server.js
```

---

### **Auth Service**

```
services/auth-service/src/server.js     ← ENTRY POINT
  ↓
services/auth-service/src/app.js        ← Express app
  ↓
services/auth-service/src/routes/auth.routes.js  ← Route definitions
  ↓
services/auth-service/src/controllers/auth.controller.js  ← Request handlers
  ↓
services/auth-service/src/services/auth.service.js  ← Business logic
  ↓
shared/database/index.js                ← Database operations
```

**Start command**:
```bash
cd services/auth-service
npm run dev
# Starts: nodemon src/server.js
```

---

### **Properties Service**

```
services/properties-service/src/server.js  ← ENTRY POINT
  ↓
services/properties-service/src/app.js
  ↓
services/properties-service/src/routes/properties.routes.js
  ↓
services/properties-service/src/controllers/properties.controller.js
  ↓
services/properties-service/src/services/properties.service.js
  ↓
shared/database/index.js + shared/database/redis.js
```

**Start command**:
```bash
cd services/properties-service
npm run dev
# Starts: nodemon src/server.js
```

---

## 🔄 **COMPARISON WITH REACT**

### **React App**
```
index.js                 ← Entry point
  ↓
App.js                   ← Main app component
  ↓
Router                   ← Route definitions
  ↓
Pages/Components         ← UI components
  ↓
Hooks/Context           ← State management
  ↓
API calls               ← Data fetching
```

### **Our API (Each Service)**
```
server.js                ← Entry point (like index.js)
  ↓
app.js                   ← Express app (like App.js)
  ↓
routes/                  ← Route definitions (like Router)
  ↓
controllers/             ← Request handlers (like Components)
  ↓
services/                ← Business logic (like Hooks)
  ↓
database/                ← Data layer (like API calls)
```

**It's the same concept!** Just server-side instead of client-side.

---

## 🚀 **HOW TO START THE APPLICATION**

### **Option 1: Docker (Start Everything)**

```bash
cd /Users/knight/Apps/get-plot/API

# This starts ALL services
docker-compose up --build

# What happens:
# 1. Reads docker-compose.yml
# 2. Builds Docker images for each service
# 3. Starts PostgreSQL, Redis, RabbitMQ
# 4. Starts all 6 microservices + gateway
# 5. Each service runs its server.js entry point
```

**Entry points executed**:
- `gateway/src/server.js`
- `services/auth-service/src/server.js`
- `services/properties-service/src/server.js`
- `services/transactions-service/src/server.js`
- `services/users-service/src/server.js`
- `services/notifications-service/src/server.js`

---

### **Option 2: Local Development (Start Individually)**

**Terminal 1 - API Gateway** (Main entry point for clients)
```bash
cd /Users/knight/Apps/get-plot/API/gateway
npm run dev
# Executes: nodemon src/server.js
# Listening on: http://localhost:3000
```

**Terminal 2 - Auth Service**
```bash
cd /Users/knight/Apps/get-plot/API/services/auth-service
npm run dev
# Executes: nodemon src/server.js
# Listening on: http://localhost:3001
```

**Terminal 3 - Properties Service**
```bash
cd /Users/knight/Apps/get-plot/API/services/properties-service
npm run dev
# Executes: nodemon src/server.js
# Listening on: http://localhost:3002
```

---

### **Option 3: Use npm script (Start All)**

```bash
cd /Users/knight/Apps/get-plot/API
npm run dev

# This runs concurrently:
# - npm run dev:gateway
# - npm run dev:auth
# - npm run dev:properties
# - npm run dev:transactions
# - npm run dev:users
# - npm run dev:notifications

# All server.js files start simultaneously
```

---

## 🎯 **THE MAIN ENTRY POINT (What to run)**

### **For Development**:
```bash
cd /Users/knight/Apps/get-plot/API

# Start infrastructure
docker-compose up -d postgres redis rabbitmq

# Start all services
npm run dev
```

**Main entry point**: `gateway/src/server.js` on port 3000  
**All requests go through**: API Gateway first, then routed to services

---

### **For Production (Docker)**:
```bash
docker-compose up --build
```

**Entry point**: Docker Compose starts all `server.js` files automatically

---

## 📍 **KEY FILES (Entry Points)**

### **1. Main Entry Point for Clients**
```
gateway/src/server.js           ← ALL CLIENT REQUESTS START HERE
```

### **2. Entry Point for Each Service**
```
services/auth-service/src/server.js           ← Auth requests
services/properties-service/src/server.js     ← Property requests
services/transactions-service/src/server.js   ← Transaction requests
services/users-service/src/server.js          ← User requests
services/notifications-service/src/server.js  ← Notification requests
```

### **3. Entry Point for Docker**
```
docker-compose.yml             ← Docker starts all services
```

### **4. Entry Point for CI/CD**
```
.github/workflows/ci-cd.yml    ← Automated deployment
```

---

## 🧪 **TESTING THE ENTRY POINT**

```bash
# Start the API
docker-compose up -d

# Test the main entry point (API Gateway)
curl http://localhost:3000/health

# Should return:
# {
#   "status": "healthy",
#   "service": "api-gateway",
#   "version": "1.0.0"
# }

# This confirms:
# ✅ gateway/src/server.js is running
# ✅ API Gateway is accepting requests
# ✅ Port 3000 is accessible
```

---

## 🎯 **SUMMARY**

### **In React:**
```
npm start → index.js → App.js → Router → Components
```

### **In This API:**
```
docker-compose up → server.js → app.js → routes → controllers → services → database
```

### **Main Entry Points:**

1. **For Clients**: `gateway/src/server.js` (Port 3000) ← **START HERE**
2. **For Each Service**: `services/[name]/src/server.js`
3. **For Docker**: `docker-compose.yml`
4. **For Development**: `npm run dev` (starts all server.js files)

---

**The application starts at**: **`gateway/src/server.js`** or **`docker-compose up`**

**Everything flows through**: Gateway → Service → Database → Response

**Just like React**: server.js is your index.js, app.js is your App.js! 🎯

