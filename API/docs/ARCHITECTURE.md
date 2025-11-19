# Architecture Documentation

## System Architecture Overview

### Microservices Design Pattern

The Get Plot API follows a **microservices architecture** with the following design principles:

1. **Service Independence**: Each service can be developed, deployed, and scaled independently
2. **Single Responsibility**: Each service handles one business domain
3. **API Gateway Pattern**: Single entry point for all client requests
4. **Database Per Service**: Each service has its own database schema/tables
5. **Event-Driven Communication**: Services communicate via message queues for async operations
6. **Containerization**: All services are containerized for consistent deployment

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Applications                      │
│        (Web App - Next.js | Mobile App - React Native)          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Load Balancer (Nginx)                       │
│                         SSL Termination                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway (Express)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Rate Limiting (Redis)        • Request Validation      │  │
│  │ • Authentication Middleware    • Response Transformation │  │
│  │ • Request Logging             • Error Handling          │  │
│  │ • Service Discovery           • Circuit Breaker         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
┏━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━┓
┃    Auth      ┃  ┃ Properties   ┃  ┃Transactions  ┃
┃   Service    ┃  ┃   Service    ┃  ┃   Service    ┃
┃   (3001)     ┃  ┃   (3002)     ┃  ┃   (3003)     ┃
┗━━━━━━┯━━━━━━━┛  ┗━━━━━━┯━━━━━━━┛  ┗━━━━━━┯━━━━━━━┛
       │                 │                  │
       ▼                 ▼                  ▼
┏━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━┓
┃    Users     ┃  ┃Notifications ┃  ┃  Analytics   ┃
┃   Service    ┃  ┃   Service    ┃  ┃   Service    ┃
┃   (3004)     ┃  ┃   (3005)     ┃  ┃   (3006)     ┃
┗━━━━━━┯━━━━━━━┛  ┗━━━━━━┯━━━━━━━┛  ┗━━━━━━┯━━━━━━━┛
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────────┐
        │        Shared Infrastructure         │
        ├─────────────────────────────────────┤
        │  PostgreSQL    │  Redis   │ RabbitMQ│
        │  (Database)    │  (Cache) │ (Queue) │
        └─────────────────────────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────────┐
        │      Monitoring & Observability      │
        ├─────────────────────────────────────┤
        │ Prometheus │ Grafana │ ELK Stack    │
        └─────────────────────────────────────┘
```

## Service Breakdown

### 1. Auth Service (Port 3001)

**Responsibility**: Handle all authentication and authorization

**Key Features**:
- User registration and login
- JWT token generation and validation
- Password reset and email verification
- OAuth2 integration (Google, Facebook)
- Session management
- Role-based access control (RBAC)

**Database Tables**:
- `app_auth.users`
- `app_auth.sessions`
- `app_auth.refresh_tokens`
- `app_auth.password_resets`
- `app_auth.oauth_providers`

**Dependencies**:
- PostgreSQL
- Redis (token blacklist, session storage)
- Email service

### 2. Properties Service (Port 3002)

**Responsibility**: Manage land plots and property listings

**Key Features**:
- CRUD operations for plots
- Search and filtering (location, price, size, status)
- Plot availability management
- Geospatial queries
- Property analytics
- Bulk import/export

**Database Tables**:
- `properties.yabi`
- `properties.trabuom`
- `properties.dar_es_salaam`
- `properties.legon_hills`
- `properties.nthc`
- `properties.berekuso`
- `properties.saadi`

**Dependencies**:
- PostgreSQL with PostGIS
- Redis (caching)
- S3/Cloudinary (images)

### 3. Transactions Service (Port 3003)

**Responsibility**: Handle plot transactions (buy, reserve, payments)

**Key Features**:
- Reserve plot with deposit
- Buy plot (full payment)
- Payment processing integration
- Transaction history
- Invoice generation
- Payment verification
- Refund processing

**Database Tables**:
- `transactions.transactions`
- `transactions.payments`
- `transactions.invoices`
- `transactions.refunds`

**Dependencies**:
- PostgreSQL
- Payment gateways (Paystack, Stripe)
- Notifications service
- Properties service

### 4. Users Service (Port 3004)

**Responsibility**: User profile and account management

**Key Features**:
- User profile CRUD
- User preferences
- Activity history
- Saved properties/favorites
- User documents
- Admin user management

**Database Tables**:
- `users.profiles`
- `users.preferences`
- `users.saved_properties`
- `users.documents`
- `users.activity_logs`

**Dependencies**:
- PostgreSQL
- S3 (document storage)
- Auth service

### 5. Notifications Service (Port 3005)

**Responsibility**: Send emails, SMS, and push notifications

**Key Features**:
- Email notifications (transactional, marketing)
- SMS notifications
- Push notifications
- Email templates
- Notification preferences
- Delivery tracking
- Bulk sending with queues

**Database Tables**:
- `notifications.email_logs`
- `notifications.sms_logs`
- `notifications.templates`
- `notifications.preferences`

**Dependencies**:
- SMTP/SendGrid
- SMS provider (Africa's Talking, Arkesel, etc.)
- RabbitMQ (message queue)
- Redis (rate limiting)

### 6. Analytics Service (Port 3006)

**Responsibility**: Business intelligence and reporting

**Key Features**:
- Dashboard statistics
- Sales analytics
- User behavior tracking
- Property trends
- Revenue reports
- Custom report generation
- Data export

**Database Tables**:
- `analytics.events`
- `analytics.aggregates`
- `analytics.reports`

**Dependencies**:
- PostgreSQL
- Redis (caching)
- All other services (data aggregation)

## Data Flow Examples

### Example 1: User Registration

```
1. Client → API Gateway → Auth Service
2. Auth Service validates input
3. Auth Service hashes password (bcrypt)
4. Auth Service creates user in database
5. Auth Service generates JWT tokens
6. Auth Service → Notifications Service (welcome email)
7. Auth Service → Users Service (create profile)
8. Return tokens to client
```

### Example 2: Reserve Plot

```
1. Client → API Gateway → Transactions Service
2. Transactions Service validates request
3. Transactions Service → Properties Service (check availability)
4. Transactions Service → Payment Gateway (process deposit)
5. Payment confirmed → Update plot status
6. Transactions Service → Notifications Service (confirmation email + SMS)
7. Transactions Service → Analytics Service (track event)
8. Return transaction details to client
```

### Example 3: Search Properties

```
1. Client → API Gateway → Properties Service
2. Properties Service checks Redis cache
3. If cache miss → Query PostgreSQL with filters
4. Apply geospatial filters if needed
5. Transform and paginate results
6. Store results in Redis cache
7. Return to client
```

## Communication Patterns

### Synchronous Communication (REST)
- Used for request-response operations
- HTTP/HTTPS protocol
- JSON payload
- Timeouts: 30 seconds

### Asynchronous Communication (Message Queue)
- Used for non-blocking operations
- RabbitMQ/BullMQ
- Event-driven
- Examples:
  - Send email after transaction
  - Update analytics after user action
  - Process bulk operations

## Scalability Strategy

### Horizontal Scaling
- Each service can scale independently
- Use container orchestration (Kubernetes)
- Auto-scaling based on CPU/Memory metrics

### Database Scaling
- Read replicas for read-heavy operations
- Connection pooling
- Query optimization
- Indexing strategy

### Caching Strategy
- Redis for frequently accessed data
- Cache aside pattern
- TTL-based invalidation
- Event-driven cache invalidation

### Load Balancing
- Nginx/Kong as API Gateway
- Round-robin distribution
- Health checks
- Session affinity if needed

## Security Architecture

### Defense in Depth

```
Layer 1: Network Security
  - HTTPS/TLS 1.3
  - DDoS protection
  - IP whitelisting (admin endpoints)

Layer 2: API Gateway
  - Rate limiting
  - Request validation
  - API key authentication
  - CORS configuration

Layer 3: Service Level
  - JWT validation
  - Role-based access control
  - Input sanitization
  - SQL injection prevention

Layer 4: Data Level
  - Encryption at rest
  - Password hashing
  - PII data protection
  - Audit logging
```

## Disaster Recovery

### Backup Strategy
- Database: Daily full backup + hourly incremental
- Retention: 30 days
- Cross-region backup storage
- Regular restore testing

### High Availability
- Multi-AZ deployment
- Database replication
- Redis clustering
- Message queue clustering

### Monitoring & Alerts
- Uptime monitoring
- Error rate alerts
- Performance degradation alerts
- Security incident alerts

## Technology Choices - Rationale

| Component | Technology | Why? |
|-----------|-----------|------|
| Runtime | Node.js 20+ | Performance, async I/O, large ecosystem |
| Framework | Express.js | Lightweight, flexible, battle-tested |
| Database | PostgreSQL | ACID compliance, PostGIS support, reliability |
| Cache | Redis | High performance, pub/sub, session storage |
| Message Queue | RabbitMQ/BullMQ | Reliable, scalable, good Node.js support |
| Container | Docker | Consistent environments, portability |
| Orchestration | Kubernetes | Industry standard, auto-scaling, resilience |
| API Docs | OpenAPI 3.0 | Standard, tooling support, auto-generation |
| Testing | Jest | Fast, built-in mocking, snapshot testing |
| Monitoring | Prometheus + Grafana | Metrics collection, visualization, alerting |
| Logging | Winston + ELK | Structured logging, searchable, analysis |

## Development Workflow

### Local Development
```bash
# Start infrastructure
docker-compose up -d postgres redis

# Start specific service
cd services/auth-service
npm run dev

# Or start all services
npm run dev:all
```

### Testing Workflow
```bash
# Run tests before commit
npm run test
npm run lint

# Pre-commit hooks validate
git commit -m "feat: add feature"
```

### Deployment Workflow
```
1. Feature branch → develop (PR + review)
2. Automated tests run
3. Security scans
4. Merge to develop → Deploy to staging
5. QA testing
6. develop → main (PR + approval)
7. Deploy to production (manual trigger)
8. Smoke tests
9. Monitor metrics
```

## Performance Benchmarks

### Target Metrics
- API Response Time (p95): < 200ms
- API Response Time (p99): < 500ms
- Database Query Time: < 100ms
- Cache Hit Rate: > 80%
- Uptime: 99.9% (8.76 hours downtime/year)
- Concurrent Users: 10,000+
- Requests per Second: 1,000+

### Load Testing Strategy
- Use k6 for load testing
- Test scenarios:
  - Baseline load
  - Stress testing
  - Spike testing
  - Soak testing (24h)

## Future Enhancements

### Phase 2 (3-6 months)
- Real-time updates (WebSockets)
- Mobile app push notifications
- Advanced analytics with ML
- Multi-language support
- Payment plans/installments

### Phase 3 (6-12 months)
- GraphQL API support
- Blockchain for land ownership
- AI chatbot support
- Virtual property tours
- Mobile payment integration (M-Pesa)

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-21  
**Owner**: Engineering Team

