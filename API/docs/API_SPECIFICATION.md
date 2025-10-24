# API Specification v1.0

## Base URLs

- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://staging-api.getplot.com/api/v1`
- **Production**: `https://api.getplot.com/api/v1`

## Authentication

All protected endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Lifecycle
- **Access Token**: 30 minutes
- **Refresh Token**: 7 days

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2025-10-21T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": []
  },
  "timestamp": "2025-10-21T10:30:00Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  },
  "timestamp": "2025-10-21T10:30:00Z"
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

# Auth Service API

## POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+233241234567",
  "country": "Ghana"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 1800
    }
  },
  "message": "Registration successful. Please verify your email."
}
```

**Validation Rules:**
- Email: valid email format, unique
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Phone: valid phone format
- First/Last name: 2-50 characters

---

## POST /auth/login

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 1800
    }
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `403`: Account not verified or suspended

---

## POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 1800
  }
}
```

---

## POST /auth/logout

Invalidate current session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## POST /auth/forgot-password

Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

## POST /auth/reset-password

Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

# Properties Service API

## GET /properties

Get paginated list of properties.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `location` (string): Filter by location (yabi, trabuom, dar_es_salaam, etc.)
- `status` (string): available | reserved | sold
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `minSize` (number): Minimum size in acres
- `maxSize` (number): Maximum size in acres
- `sortBy` (string): plotNo | price | size | createdAt
- `order` (string): asc | desc

**Example Request:**
```
GET /properties?location=yabi&status=available&page=1&limit=20&sortBy=price&order=asc
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plotNo": "26A",
      "streetName": "Republic Street",
      "location": "yabi",
      "status": "available",
      "area": 0.5,
      "areaUnit": "acres",
      "price": 50000,
      "currency": "GHS",
      "coordinates": {
        "type": "Polygon",
        "coordinates": [[...]]
      },
      "createdAt": "2025-10-21T10:30:00Z",
      "updatedAt": "2025-10-21T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

## GET /properties/:id

Get single property details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plotNo": "26A",
    "streetName": "Republic Street",
    "location": "yabi",
    "locationDetails": {
      "name": "Yabi-Kumasi",
      "region": "Ashanti",
      "city": "Kumasi"
    },
    "status": "available",
    "area": 0.5,
    "areaUnit": "acres",
    "price": 50000,
    "currency": "GHS",
    "minimumDeposit": 15000,
    "coordinates": {
      "type": "Polygon",
      "coordinates": [[...]]
    },
    "metadata": {
      "cadastral": "",
      "ownerInfo": "",
      "remarks": ""
    },
    "images": [],
    "createdAt": "2025-10-21T10:30:00Z",
    "updatedAt": "2025-10-21T10:30:00Z"
  }
}
```

---

## POST /properties/search

Advanced property search.

**Request Body:**
```json
{
  "filters": {
    "locations": ["yabi", "trabuom"],
    "status": ["available"],
    "priceRange": { "min": 30000, "max": 100000 },
    "areaRange": { "min": 0.3, "max": 1.0 },
    "bounds": {
      "north": 6.7,
      "south": 6.6,
      "east": -1.6,
      "west": -1.7
    }
  },
  "page": 1,
  "limit": 20
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {...},
  "facets": {
    "locationCounts": {
      "yabi": 50,
      "trabuom": 30
    },
    "statusCounts": {
      "available": 80
    },
    "priceRanges": {
      "0-50000": 20,
      "50000-100000": 40
    }
  }
}
```

---

## POST /properties [ADMIN]

Create new property.

**Authorization:** Admin or SysAdmin

**Request Body:**
```json
{
  "plotNo": "26A",
  "streetName": "Republic Street",
  "location": "yabi",
  "area": 0.5,
  "areaUnit": "acres",
  "price": 50000,
  "currency": "GHS",
  "coordinates": {
    "type": "Polygon",
    "coordinates": [[...]]
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Property created successfully"
}
```

---

# Transactions Service API

## POST /transactions/reserve

Reserve a plot with deposit.

**Authorization:** Required

**Request Body:**
```json
{
  "propertyId": "uuid",
  "depositAmount": 15000,
  "paymentMethod": "bank_transfer",
  "customerDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+233241234567",
    "country": "Ghana",
    "residentialAddress": "123 Main St, Accra"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "propertyId": "uuid",
    "type": "reservation",
    "status": "pending",
    "totalAmount": 50000,
    "depositAmount": 15000,
    "remainingAmount": 35000,
    "holdExpiresAt": "2025-10-22T10:30:00Z",
    "paymentInstructions": {
      "cedisAccount": { ... },
      "dollarAccount": { ... }
    },
    "invoiceUrl": "https://..."
  },
  "message": "Reservation successful. Payment instructions sent to email."
}
```

---

## POST /transactions/buy

Purchase a plot (full payment).

**Authorization:** Required

**Request Body:**
```json
{
  "propertyId": "uuid",
  "amount": 50000,
  "paymentMethod": "paystack",
  "customerDetails": { ... }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "type": "purchase",
    "status": "pending",
    "amount": 50000,
    "paymentUrl": "https://paystack.com/pay/...",
    "reference": "TXN-123456"
  }
}
```

---

## POST /transactions/payment/verify

Verify payment status.

**Request Body:**
```json
{
  "reference": "TXN-123456",
  "provider": "paystack"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "status": "completed",
    "paidAmount": 50000,
    "paymentDate": "2025-10-21T10:30:00Z",
    "receiptUrl": "https://..."
  }
}
```

---

## GET /transactions/user/:userId

Get user's transaction history.

**Authorization:** Required (Own transactions or Admin)

**Query Parameters:**
- `page`, `limit`, `status`, `type`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "reservation",
      "status": "completed",
      "property": {
        "plotNo": "26A",
        "location": "yabi"
      },
      "amount": 50000,
      "paidAmount": 15000,
      "remainingAmount": 35000,
      "createdAt": "2025-10-21T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

## GET /transactions/invoice/:transactionId

Download invoice PDF.

**Authorization:** Required

**Response (200):**
- Content-Type: application/pdf
- PDF file download

---

# Users Service API

## GET /users/profile

Get current user's profile.

**Authorization:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+233241234567",
    "country": "Ghana",
    "role": "customer",
    "emailVerified": true,
    "preferences": {
      "notifications": {
        "email": true,
        "sms": true
      },
      "language": "en"
    },
    "createdAt": "2025-10-21T10:30:00Z"
  }
}
```

---

## PUT /users/profile

Update user profile.

**Authorization:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+233241234567",
  "residentialAddress": "123 Main St"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Profile updated successfully"
}
```

---

## GET /users [ADMIN]

List all users (admin only).

**Authorization:** Admin or SysAdmin

**Query Parameters:**
- `page`, `limit`, `role`, `status`, `search`

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": { ... }
}
```

---

## PUT /users/:id/role [ADMIN]

Update user role.

**Authorization:** SysAdmin

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User role updated successfully"
}
```

---

# Notifications Service API

## POST /notifications/email

Send email notification.

**Authorization:** Service-to-service (API Key)

**Request Body:**
```json
{
  "to": "user@example.com",
  "template": "plot_reservation",
  "data": {
    "firstName": "John",
    "plotNo": "26A",
    "amount": "50,000"
  },
  "attachments": [
    {
      "filename": "invoice.pdf",
      "content": "base64_content"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messageId": "uuid",
    "status": "sent"
  }
}
```

---

## POST /notifications/sms

Send SMS notification.

**Request Body:**
```json
{
  "to": "+233241234567",
  "message": "Your plot reservation for 26A has been confirmed."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messageId": "uuid",
    "status": "sent"
  }
}
```

---

# Analytics Service API

## GET /analytics/dashboard

Get dashboard statistics.

**Authorization:** Admin or SysAdmin

**Query Parameters:**
- `startDate`, `endDate`, `location`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPlots": 500,
      "availablePlots": 300,
      "reservedPlots": 150,
      "soldPlots": 50,
      "totalRevenue": 5000000,
      "totalUsers": 1000
    },
    "trends": {
      "salesByMonth": [...],
      "userGrowth": [...]
    },
    "topLocations": [
      { "location": "yabi", "count": 100 }
    ]
  }
}
```

---

## Rate Limiting

All endpoints are rate-limited:

- **Public endpoints**: 100 requests/15min per IP
- **Authenticated endpoints**: 1000 requests/15min per user
- **Admin endpoints**: 2000 requests/15min per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634825400
```

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 300
  }
}
```

---

## Webhooks

Webhooks are sent for important events:

### Events
- `transaction.completed`
- `transaction.failed`
- `property.status_changed`
- `user.registered`

### Webhook Payload
```json
{
  "id": "webhook_uuid",
  "event": "transaction.completed",
  "data": { ... },
  "timestamp": "2025-10-21T10:30:00Z",
  "signature": "hmac_sha256_signature"
}
```

### Webhook Security
Verify webhook signature using HMAC SHA256:
```javascript
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-21

