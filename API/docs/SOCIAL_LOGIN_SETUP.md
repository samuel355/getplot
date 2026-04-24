# Social Login Setup Guide

## Overview

The Get Plot API supports social authentication through **Google**, **Facebook**, and **GitHub**. Users can register and login using their existing social media accounts, providing a seamless authentication experience.

## Supported Providers

- ✅ **Google OAuth 2.0**
- ✅ **Facebook Login**
- ✅ **GitHub OAuth**

## Architecture

```
Frontend (Client)
    ↓
[User clicks "Login with Google/Facebook/GitHub"]
    ↓
Social Provider (OAuth 2.0 Flow)
    ↓
[Frontend gets Access Token / ID Token]
    ↓
POST /api/v1/auth/social/login
    ↓
Get Plot API (Auth Service)
    ↓
Verify token with provider
    ↓
Create or update user in database
    ↓
Return JWT tokens + User info
```

---

## 1. Google OAuth Setup

### Step 1.1: Create Google OAuth Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: **Get Plot**
3. Enable **Google+ API**
4. Create OAuth 2.0 credentials:
   - Click **Create Credentials** → **OAuth Client ID**
   - Choose **Web application**
   - Add Authorized redirect URIs:
     - `http://localhost:3000`
     - `http://localhost:3000/auth/callback`
     - `https://your-production-domain.com`

### Step 1.2: Get Your Credentials

From the OAuth credentials page:
- **Client ID**: `xxx.apps.googleusercontent.com`
- **Client Secret**: `xxx`

### Step 1.3: Configure Environment Variables

```bash
# In .env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

### Step 1.4: Frontend Implementation (React Example)

```bash
npm install @react-oauth/google
```

```jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/social/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          idToken: credentialResponse.credential,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Save tokens
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log('Login Failed')}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
```

---

## 2. Facebook OAuth Setup

### Step 2.1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** as app type
4. Fill in app details:
   - **App Name**: Get Plot
   - **App Contact Email**: your-email@getplot.com
   - **App Purpose**: Select appropriate category

### Step 2.2: Setup Facebook Login

1. In your app, go to **Products** → **Add Product**
2. Search for **Facebook Login** and add it
3. Go to **Settings** → **Basic**:
   - Copy **App ID** and **App Secret**

4. Go to **Facebook Login** → **Settings**:
   - Add **Valid OAuth Redirect URIs**:
     - `http://localhost:3000`
     - `http://localhost:3000/auth/callback`
     - `https://your-production-domain.com`

### Step 2.3: Configure Environment Variables

```bash
# In .env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/v1/auth/facebook/callback
```

### Step 2.4: Frontend Implementation (React Example)

```bash
npm install facebook-login react-facebook-login
```

```jsx
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

export default function LoginPage() {
  const handleFacebookSuccess = async (response) => {
    try {
      const apiResponse = await fetch('http://localhost:3001/api/v1/auth/social/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'facebook',
          accessToken: response.accessToken,
        }),
      });

      const data = await apiResponse.json();
      
      if (apiResponse.ok) {
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Facebook login failed:', error);
    }
  };

  return (
    <FacebookLogin
      appId={process.env.REACT_APP_FACEBOOK_APP_ID}
      autoLoad={false}
      fields="name,email,picture"
      callback={handleFacebookSuccess}
      render={(renderProps) => (
        <button
          onClick={renderProps.onClick}
          className="btn btn-facebook"
        >
          Login with Facebook
        </button>
      )}
    />
  );
}
```

---

## 3. GitHub OAuth Setup

### Step 3.1: Register GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the form:
   - **Application name**: Get Plot
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/v1/auth/github/callback`

### Step 3.2: Get Your Credentials

After creating the app:
- **Client ID**: From the app page
- **Client Secret**: Generate a new client secret

### Step 3.3: Configure Environment Variables

```bash
# In .env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback
```

### Step 3.4: Frontend Implementation (React Example)

```jsx
import React from 'react';

export default function LoginPage() {
  const handleGitHubLogin = async () => {
    // Step 1: Get authorization code from GitHub
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'user:email';
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  };

  // This should be in a callback page component
  const handleGitHubCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) return;

    try {
      // Exchange code for access token (usually done on backend)
      const tokenResponse = await fetch('/api/auth/github/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const { accessToken } = await tokenResponse.json();

      // Send to Get Plot API
      const response = await fetch('http://localhost:3001/api/v1/auth/social/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'github',
          accessToken: accessToken,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('GitHub login failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleGitHubLogin} className="btn btn-github">
        Login with GitHub
      </button>
    </div>
  );
}
```

---

## 4. API Endpoints

### POST /api/v1/auth/social/login

**Description**: Authenticate user with social provider

**Request**:
```json
{
  "provider": "google",
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "accessToken": "optional-access-token"
}
```

**Providers and Required Fields**:
- `google`: Requires `idToken` (from Google Sign-In)
- `facebook`: Requires `accessToken`
- `github`: Requires `accessToken`

**Response (Success)**:
```json
{
  "success": true,
  "message": "Social login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "emailVerified": true,
      "firstName": "John",
      "lastName": "Doe",
      "role": "default_member"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 1800
    },
    "providerProfile": {
      "provider": "google",
      "providerUserId": "1234567890",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://..."
    }
  }
}
```

**Response (Error)**:
```json
{
  "success": false,
  "message": "Failed to verify Google token",
  "error": "AuthenticationError"
}
```

---

## 5. Testing Social Login

### Using cURL

**Google**:
```bash
curl -X POST http://localhost:3001/api/v1/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "idToken": "YOUR_GOOGLE_ID_TOKEN"
  }'
```

**Facebook**:
```bash
curl -X POST http://localhost:3001/api/v1/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "facebook",
    "accessToken": "YOUR_FACEBOOK_ACCESS_TOKEN"
  }'
```

**GitHub**:
```bash
curl -X POST http://localhost:3001/api/v1/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "github",
    "accessToken": "YOUR_GITHUB_ACCESS_TOKEN"
  }'
```

### Using Postman

1. Create a new POST request to `http://localhost:3001/api/v1/auth/social/login`
2. Set header: `Content-Type: application/json`
3. Use the request body from above
4. Send the request

---

## 6. How It Works

### User Flow

1. **User clicks "Login with [Provider]"**
   - Redirected to provider's login page

2. **User authenticates with provider**
   - Provider returns access token / ID token

3. **Frontend sends token to Get Plot API**
   - `POST /api/v1/auth/social/login`
   - Body: `{ provider, idToken/accessToken }`

4. **API verifies token**
   - Calls provider's API to verify token
   - Extracts user info (email, name, avatar)

5. **Check if user exists**
   - **New user**: Create account automatically
   - **Existing user**: Update profile if needed

6. **Generate JWT tokens**
   - Create access token (30 minutes)
   - Create refresh token (7 days)

7. **Return tokens to frontend**
   - Frontend stores tokens in localStorage
   - Frontend uses tokens for authenticated requests

---

## 7. Database Schema

### oauth_providers table

```sql
CREATE TABLE app_auth.oauth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_provider_user_id ON app_auth.oauth_providers(user_id);
CREATE INDEX idx_oauth_provider_type ON app_auth.oauth_providers(provider);
```

---

## 8. Security Considerations

### ✅ Best Practices

1. **Always verify tokens on backend**
   - Never trust tokens from frontend alone
   - Always call provider API to verify

2. **Use HTTPS in production**
   - Tokens must be transmitted securely

3. **Store tokens securely**
   - Access tokens: Use secure HTTP-only cookies
   - Refresh tokens: Use secure storage

4. **Validate redirect URIs**
   - Only whitelist trusted domains
   - Prevent authorization code injection

5. **Rate limit auth endpoints**
   - Prevent brute force attacks
   - Already implemented in Get Plot API

6. **Log authentication events**
   - Track login attempts
   - Monitor for suspicious activity

### ⚠️ Security Headers

The API automatically sends:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

## 9. Troubleshooting

### Google Login Issues

**Problem**: "Google token audience mismatch"
- **Solution**: Verify `GOOGLE_CLIENT_ID` matches your OAuth app settings

**Problem**: "Google profile does not include an email address"
- **Solution**: Ensure user's Google account has a verified email

### Facebook Login Issues

**Problem**: "Failed to verify Facebook token"
- **Solution**: Verify `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` are correct

**Problem**: "Facebook profile does not include an email"
- **Solution**: Ensure user has shared email in Facebook permissions

### GitHub Login Issues

**Problem**: "Failed to verify GitHub token"
- **Solution**: Verify `GITHUB_CLIENT_ID` is correct

**Problem**: "GitHub profile does not include an email"
- **Solution**: 
  - User must have public email set in GitHub settings, OR
  - Request `user:email` scope (already done)

---

## 10. Production Deployment

### Environment Variables

Update these in your production environment:

```bash
# Production URLs
GOOGLE_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback
FACEBOOK_CALLBACK_URL=https://your-domain.com/api/v1/auth/facebook/callback
GITHUB_CALLBACK_URL=https://your-domain.com/api/v1/auth/github/callback

# From OAuth providers (production apps)
GOOGLE_CLIENT_ID=prod-google-client-id
GOOGLE_CLIENT_SECRET=prod-google-secret
FACEBOOK_APP_ID=prod-facebook-app-id
FACEBOOK_APP_SECRET=prod-facebook-secret
GITHUB_CLIENT_ID=prod-github-client-id
GITHUB_CLIENT_SECRET=prod-github-secret

# Enable HTTPS
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
```

### Update OAuth App Settings

1. **Google**: Add production domain to authorized URIs
2. **Facebook**: Set app to production mode
3. **GitHub**: Update redirect URIs to production domain

---

## 11. Frontend Integration Checklist

- [ ] Install OAuth library for each provider
- [ ] Configure client IDs in frontend .env
- [ ] Implement login buttons
- [ ] Handle OAuth callbacks
- [ ] Store tokens securely
- [ ] Redirect on success
- [ ] Handle errors gracefully
- [ ] Test in development
- [ ] Test in production

---

## 12. API Integration Checklist

- [ ] Verify all required environment variables are set
- [ ] Test each provider independently
- [ ] Verify user creation flow
- [ ] Verify existing user login flow
- [ ] Test token generation
- [ ] Test token refresh
- [ ] Monitor logs for errors
- [ ] Test in production

---

## 13. Resources

### Documentation
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps)

### Libraries
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- [react-facebook-login](https://www.npmjs.com/package/react-facebook-login)
- [axios](https://www.npmjs.com/package/axios)

### Get Plot API Docs
- [API Manual](./API_MANUAL.md)
- [Authentication Guide](./SECURITY.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)

---

## 14. Support

For issues with:
- **Social login setup**: Check Step 1-3 above
- **API integration**: Check the endpoint documentation
- **Frontend implementation**: Refer to the React examples
- **General questions**: See [API_MANUAL.md](./API_MANUAL.md)

---

**Last Updated**: 2025-04-23
**Version**: 1.0.0
**Maintained by**: Get Plot Engineering Team
