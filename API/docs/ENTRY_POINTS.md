# 🎯 API Entry Points - Quick Reference

**Like React's index.js → App.js, but for microservices**

---

## 🚀 **MAIN ENTRY POINT**

### **For All Client Requests**

```
gateway/src/server.js   ← THE STARTING POINT (Port 3000)
```

**This is like `index.js` in a React app** - everything starts here!

---

## 📍 **INDIVIDUAL SERVICE ENTRY POINTS**

### **Auth Service** (Port 3001)
```
services/auth-service/src/server.js   ← Entry point
  ↓
  app.js → routes → controllers → services
```

### **Properties Service** (Port 3002)
```
services/properties-service/src/server.js   ← Entry point
  ↓
  app.js → routes → controllers → services
```

### **Transactions Service** (Port 3003)
```
services/transactions-service/src/server.js   ← Entry point
  ↓
  app.js → routes → controllers → services
```

### **Users Service** (Port 3004)
```
services/users-service/src/server.js   ← Entry point
  ↓
  app.js → routes → controllers → services
```

### **Notifications Service** (Port 3005)
```
services/notifications-service/src/server.js   ← Entry point
  ↓
  app.js → routes → controllers → services
```

---

## 🔄 **REQUEST FLOW (Simplified)**

```
1. Client → http://localhost:3000/api/v1/auth/register
              ↓
2. gateway/src/server.js (receives request)
              ↓
3. gateway/src/routes/index.js (routes to auth service)
              ↓
4. services/auth-service/src/server.js
              ↓
5. auth-service/src/routes/auth.routes.js
              ↓
6. auth-service/src/controllers/auth.controller.js
              ↓
7. auth-service/src/services/auth.service.js
              ↓
8. shared/database/index.js (SQL query)
              ↓
9. Response back to client
```

---

## 🎯 **HOW TO START (Entry Commands)**

### **Start Everything (Recommended)**
```bash
cd /Users/knight/Apps/get-plot/API
docker-compose up --build

# Entry point: docker-compose.yml
# Starts all server.js files automatically
```

### **Start Gateway Only**
```bash
cd gateway
npm run dev

# Entry point: gateway/src/server.js
# Port: 3000
```

### **Start Specific Service**
```bash
cd services/auth-service
npm run dev

# Entry point: services/auth-service/src/server.js
# Port: 3001
```

---

## 📋 **PACKAGE.JSON SCRIPTS (Entry Points)**

### **Root package.json**
```json
{
  "scripts": {
    "dev": "concurrently npm:dev:*",  ← Starts all services
    "dev:gateway": "cd gateway && npm run dev",
    "dev:auth": "cd services/auth-service && npm run dev",
    ...
  }
}
```

**Run**: `npm run dev` → Starts all server.js files

---

### **Service package.json**
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",    ← Entry point
    "start": "node src/server.js"      ← Production entry
  }
}
```

---

## 🎯 **SUMMARY**

| Entry Point | Purpose | Port |
|-------------|---------|------|
| **`gateway/src/server.js`** | Main entry for clients | 3000 |
| `services/auth-service/src/server.js` | Auth service | 3001 |
| `services/properties-service/src/server.js` | Properties | 3002 |
| `services/transactions-service/src/server.js` | Transactions | 3003 |
| `services/users-service/src/server.js` | Users | 3004 |
| `services/notifications-service/src/server.js` | Notifications | 3005 |

**Start command**: `docker-compose up` or `npm run dev`

**All requests go through**: Gateway (port 3000) first!

---

**See complete flow**: `docs/EXECUTION_FLOW.md`

