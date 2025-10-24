# Deployment Guide

## Deployment Overview

This guide covers deploying the Get Plot API to various environments.

## Table of Contents

1. [Docker Deployment](#docker-deployment)
2. [Kubernetes Deployment](#kubernetes-deployment)
3. [AWS Deployment](#aws-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring Setup](#monitoring-setup)
6. [Rollback Procedures](#rollback-procedures)

---

## Docker Deployment

### Prerequisites

- Docker 24+
- Docker Compose 2+
- 4GB RAM minimum
- 20GB disk space

### Local Production-like Environment

```bash
# 1. Build all images
docker-compose -f docker-compose.prod.yml build

# 2. Start services
docker-compose -f docker-compose.prod.yml up -d

# 3. Check health
curl http://localhost:3000/health

# 4. View logs
docker-compose -f docker-compose.prod.yml logs -f

# 5. Stop services
docker-compose -f docker-compose.prod.yml down
```

### Individual Service Deployment

```bash
# Build specific service
docker build -t getplot/auth-service:latest ./services/auth-service

# Run service
docker run -d \
  --name auth-service \
  -p 3001:3001 \
  --env-file .env.production \
  getplot/auth-service:latest

# Check logs
docker logs -f auth-service
```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.28+)
- kubectl configured
- Helm 3+ (optional)

### Deploy to Kubernetes

```bash
# 1. Create namespace
kubectl create namespace getplot-api

# 2. Create secrets
kubectl create secret generic api-secrets \
  --from-env-file=.env.production \
  --namespace=getplot-api

# 3. Apply configurations
kubectl apply -f infrastructure/kubernetes/ --namespace=getplot-api

# 4. Check deployment
kubectl get pods --namespace=getplot-api
kubectl get services --namespace=getplot-api

# 5. Check logs
kubectl logs -f deployment/api-gateway --namespace=getplot-api
```

### Kubernetes Configuration Files

#### 1. ConfigMap (`configmap.yaml`)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: getplot-api
data:
  NODE_ENV: "production"
  API_VERSION: "v1"
  LOG_LEVEL: "info"
```

#### 2. Deployment - API Gateway (`gateway-deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: getplot-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: gateway
        image: getplot/api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: api-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 5
```

#### 3. Service - API Gateway (`gateway-service.yaml`)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: getplot-api
spec:
  type: LoadBalancer
  selector:
    app: api-gateway
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

#### 4. Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: getplot-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Update Deployment

```bash
# 1. Build new image with tag
docker build -t getplot/auth-service:v1.2.0 ./services/auth-service

# 2. Push to registry
docker push getplot/auth-service:v1.2.0

# 3. Update deployment
kubectl set image deployment/auth-service \
  auth-service=getplot/auth-service:v1.2.0 \
  --namespace=getplot-api

# 4. Check rollout status
kubectl rollout status deployment/auth-service --namespace=getplot-api
```

---

## AWS Deployment

### Architecture on AWS

```
Route 53 (DNS)
    ↓
CloudFront (CDN)
    ↓
Application Load Balancer
    ↓
ECS Fargate (Containers)
    ├── Auth Service
    ├── Properties Service
    ├── Transactions Service
    └── Other Services
    ↓
RDS PostgreSQL (Multi-AZ)
ElastiCache Redis (Cluster Mode)
```

### AWS ECS Deployment

#### Prerequisites

- AWS CLI configured
- ECR repository created
- ECS cluster created

#### Deployment Steps

```bash
# 1. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

# 2. Build and tag image
docker build -t getplot/auth-service:latest ./services/auth-service
docker tag getplot/auth-service:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/getplot/auth-service:latest

# 3. Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/getplot/auth-service:latest

# 4. Update ECS service
aws ecs update-service \
  --cluster getplot-api-cluster \
  --service auth-service \
  --force-new-deployment
```

#### ECS Task Definition

```json
{
  "family": "auth-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "auth-service",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/getplot/auth-service:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/auth-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Infrastructure as Code (Terraform)

```hcl
# infrastructure/terraform/main.tf

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "getplot-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = false
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "getplot-api-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS PostgreSQL
module "db" {
  source = "terraform-aws-modules/rds/aws"
  
  identifier = "getplot-db"
  
  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = "db.t3.medium"
  allocated_storage = 100
  
  db_name  = "getplot"
  username = "postgres"
  password = var.db_password
  
  multi_az               = true
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "getplot-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name = aws_elasticache_subnet_group.redis.name
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy API

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/getplot_test
          REDIS_HOST: localhost
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
  
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=high
      
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  
  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          # Build and push each service
          for service in auth-service properties-service transactions-service users-service notifications-service analytics-service; do
            docker build -t $ECR_REGISTRY/getplot/$service:$IMAGE_TAG ./services/$service
            docker push $ECR_REGISTRY/getplot/$service:$IMAGE_TAG
          done
  
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Deploy to staging
        run: |
          # Deploy to ECS staging
          aws ecs update-service --cluster getplot-staging --service auth-service --force-new-deployment
  
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Deploy to production
        run: |
          # Deploy to ECS production
          aws ecs update-service --cluster getplot-production --service auth-service --force-new-deployment
      
      - name: Run smoke tests
        run: |
          curl -f https://api.getplot.com/health || exit 1
```

---

## Monitoring Setup

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']
  
  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:3001']
  
  - job_name: 'properties-service'
    static_configs:
      - targets: ['properties-service:3002']
```

### Grafana Dashboards

Import pre-built dashboards:
- Node.js Application Metrics
- PostgreSQL Metrics
- Redis Metrics

### Alert Rules

```yaml
# alerts.yml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
```

---

## Rollback Procedures

### Kubernetes Rollback

```bash
# Check rollout history
kubectl rollout history deployment/auth-service --namespace=getplot-api

# Rollback to previous version
kubectl rollout undo deployment/auth-service --namespace=getplot-api

# Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=2 --namespace=getplot-api
```

### ECS Rollback

```bash
# List task definitions
aws ecs list-task-definitions --family-prefix auth-service

# Update service to previous task definition
aws ecs update-service \
  --cluster getplot-api-cluster \
  --service auth-service \
  --task-definition auth-service:5
```

### Database Rollback

```bash
# Rollback migration
npm run migrate:rollback

# Rollback to specific version
npm run migrate:rollback --to 001
```

---

## Health Checks

All services expose health check endpoints:

```bash
# Liveness - is the service running?
curl http://localhost:3000/health/live

# Readiness - can the service accept traffic?
curl http://localhost:3000/health/ready

# Detailed health status
curl http://localhost:3000/health
```

Response format:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "timestamp": "2025-10-21T10:30:00Z",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "messageQueue": "healthy"
  }
}
```

---

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d api.getplot.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.getplot.com;
    
    ssl_certificate /etc/letsencrypt/live/api.getplot.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.getplot.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://api-gateway:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-21

