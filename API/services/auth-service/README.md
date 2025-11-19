# Auth Service

Authentication and Authorization microservice for Get Plot API.

## Features

✅ User registration with email verification  
✅ Login/logout with JWT tokens  
✅ Access token (30min) + Refresh token (7 days)  
✅ Password reset flow  
✅ Email verification  
✅ Activity logging  
✅ Bcrypt password hashing (12 rounds)  
✅ Role-based access control (RBAC)  

## API Endpoints

### Public
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/verify-email` - Verify email

### Protected
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

## Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Run tests
npm test
```

## Environment Variables

See root `.env.example` for all required variables.

## Database Schema

Uses tables from `auth` and `users` schemas:
- `app_auth.users` - User credentials
- `app_auth.refresh_tokens` - Refresh token storage
- `users.profiles` - User profile information
- `users.activity_logs` - User activity tracking

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with RS256 algorithm
- Refresh tokens stored in database
- Email verification required
- Password reset with time-limited tokens
- Activity logging for audit trail

