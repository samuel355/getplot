# Social Login API Examples

## Table of Contents
1. [Google Login](#google-login)
2. [Facebook Login](#facebook-login)
3. [GitHub Login](#github-login)
4. [Token Refresh](#token-refresh)
5. [Logout](#logout)
6. [Error Handling](#error-handling)

---

## Google Login

### Request (cURL)
```bash
curl -X POST http://localhost:3001/api/v1/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2YmI0YjM3ZTgyNDYxMWI0ZWJkNzc1YzIwMmQwY2RhNGQ0ZjcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDc2OTE1MDM1MDAwNzYxNTA3MzEiLCJlbWFpbCI6InVzZXJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ4NWlkSUx6eWRUdFMyMEQ3d2JaQndBIiwibmFtZSI6IkpvaG4gRG9lIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hLS9waG90byIsImdpdmVuX25hbWUiOiJKb2huIiwiZmFtaWx5X25hbWUiOiJEb2UiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTcxMzg5MDAwMCwiZXhwIjoxNzEzODkzNjAwfQ.signature"
  }'
```

### Request (JavaScript/Fetch)
```javascript
const handleGoogleLogin = async (googleResponse) => {
  try {
    const response = await fetch('http://localhost:3001/api/v1/auth/social/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        idToken: googleResponse.credential, // From Google Sign-In
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Login successful:', data.data);
      // Store tokens and user data
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    } else {
      console.error('Login failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Social login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@gmail.com",
      "emailVerified": true,
      "firstName": "John",
      "lastName": "Doe",
      "role": "default_member"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZ21haWwuY29tIiwicm9sZSI6ImRlZmF1bHRfbWVtYmVyIiwiaWF0IjoxNzEzODkwMDAwLCJleHAiOjE3MTM4OTE4MDB9.signature",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MTM4OTAwMDAsImV4cCI6MTcxNDQ5NDgwMH0.signature",
      "expiresIn": 1800
    },
    "providerProfile": {
      "provider": "google",
      "providerUserId": "107691503500007615073",
      "email": "user@gmail.com",
      "emailVerified": true,
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://lh3.googleusercontent.com/a-/photo"
    }
  }
}
```

### Error Response (401)
```json
{
  "success": false,
  "message": "Failed to verify Google token",
  "error": "AuthenticationError",
  "statusCode": 401
}
```

---

## Facebook Login

### Request (cURL)
```bash
curl -X POST http://localhost:3001/api/v1/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "facebook",
    "accessToken": "EAABsbCS1iHgBAO2O6tZCR6tULvwZA3lxQmZCLqpqEJJZC3seCfF7bVHaJZCWXqLqEo2PfZBJYrr3tJeGnhZBNwZCR1Rn5"
  }'
```

### Request (JavaScript/Fetch)
```javascript
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

const handleFacebookLogin = async (response) => {
  if (!response.accessToken) {
    console.error('Facebook login failed');
    return;
  }

  try {
    const apiResponse = await fetch('http://localhost:3001/api/v1/auth/social/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'facebook',
        accessToken: response.accessToken,
      }),
    });

    const data = await apiResponse.json();
    
    if (apiResponse.ok) {
      console.log('Login successful:', data.data);
      // Store tokens and redirect
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

export default function FacebookLoginButton() {
  return (
    <FacebookLogin
      appId={process.env.REACT_APP_FACEBOOK_APP_ID}
      autoLoad={false}
      fields="name,email,picture"
      callback={handleFacebookLogin}
      render={(renderProps) => (
        <button onClick={renderProps.onClick} className="btn btn-facebook">
          Login with Facebook
        </button>
      )}
    />
  );
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Social login successful",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440111",
      "email": "user@facebook.com",
      "emailVerified": true,
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "default_member"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAxMTEiLCJlbWFpbCI6InVzZXJAZmFjZWJvb2suY29tIiwicm9sZSI6ImRlZmF1bHRfbWVtYmVyIiwiaWF0IjoxNzEzODkwMDAwLCJleHAiOjE3MTM4OTE4MDB9.signature",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAxMTEiLCJpYXQiOjE3MTM4OTAwMDAsImV4cCI6MTcxNDQ5NDgwMH0.signature",
      "expiresIn": 1800
    },
    "providerProfile": {
      "provider": "facebook",
      "providerUserId": "123456789",
      "email": "user@facebook.com",
      "emailVerified": true,
      "firstName": "Jane",
      "lastName": "Smith",
      "avatar": "https://platform-lookaside.fbsbx.com/platform/profilepic"
    }
  }
}
```

### Error Response - Missing Email (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "ValidationError",
  "statusCode": 400,
  "details": {
    "errors": [
      {
        "field": "accessToken",
        "message": "\"accessToken\" is required"
      }
    ]
  }
}
```

---

## GitHub Login

### Request (cURL)
```bash
curl -X POST http://localhost:3001/api/v1/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "github",
    "accessToken": "ghp_16C7e42F292c6912E7710c838347Ae178B4a"
  }'
```

### Request (JavaScript/Fetch) - Full OAuth Flow
```javascript
const handleGitHubLogin = async () => {
  // Step 1: Redirect user to GitHub authorization page
  const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/github/callback`;
  const scope = 'user:email';
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  window.location.href = authUrl;
};

// Step 2: Handle callback (in a separate component or page)
const handleGitHubCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  if (!code) {
    console.error('No authorization code received');
    return;
  }

  try {
    // Step 2a: Exchange code for access token (backend endpoint)
    const tokenResponse = await fetch('/api/auth/github/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    });

    const { accessToken } = await tokenResponse.json();

    // Step 2b: Send access token to Get Plot API
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
      console.log('GitHub login successful:', data.data);
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      window.location.href = '/dashboard';
    } else {
      console.error('Login failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Social login successful",
  "data": {
    "user": {
      "id": "770e8400-e29b-41d4-a716-446655440222",
      "email": "john.dev@github.com",
      "emailVerified": true,
      "firstName": "John",
      "lastName": "Developer",
      "role": "default_member"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NzBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDIyMjIiLCJlbWFpbCI6ImpvaG4uZGV2QGdpdGh1Yi5jb20iLCJyb2xlIjoiZGVmYXVsdF9tZW1iZXIiLCJpYXQiOjE3MTM4OTAwMDAsImV4cCI6MTcxMzg5MTgwMH0.signature",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NzBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDIyMjIiLCJpYXQiOjE3MTM4OTAwMDAsImV4cCI6MTcxNDQ5NDgwMH0.signature",
      "expiresIn": 1800
    },
    "providerProfile": {
      "provider": "github",
      "providerUserId": "12345678",
      "email": "john.dev@github.com",
      "emailVerified": true,
      "firstName": "John",
      "lastName": "Developer",
      "avatar": "https://avatars.githubusercontent.com/u/12345678"
    }
  }
}
```

### Error Response - Invalid Token (401)
```json
{
  "success": false,
  "message": "Failed to verify GitHub token",
  "error": "AuthenticationError",
  "statusCode": 401
}
```

---

## Token Refresh

### Request (cURL)
```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MTM4OTAwMDAsImV4cCI6MTcxNDQ5NDgwMH0.signature"
  }'
```

### Request (JavaScript/Fetch)
```javascript
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.error('No refresh token found');
    return null;
  }

  try {
    const response = await fetch('http://localhost:3001/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Update stored token
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data.accessToken;
    } else {
      console.error('Token refresh failed:', data.message);
      // Redirect to login
      window.location.href = '/login';
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZ21haWwuY29tIiwicm9sZSI6ImRlZmF1bHRfbWVtYmVyIiwiaWF0IjoxNzEzODkwMzAwLCJleHAiOjE3MTM4OTIxMDB9.signature",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MTM4OTAzMDAsImV4cCI6MTcxNDQ5NTEwMH0.signature",
    "expiresIn": 1800
  }
}
```

---

## Logout

### Request (cURL)
```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZ21haWwuY29tIiwicm9sZSI6ImRlZmF1bHRfbWVtYmVyIiwiaWF0IjoxNzEzODkwMDAwLCJleHAiOjE3MTM4OTE4MDB9.signature" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MTM4OTAwMDAsImV4cCI6MTcxNDQ5NDgwMH0.signature"
  }'
```

### Request (JavaScript/Fetch)
```javascript
const handleLogout = async () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  try {
    const response = await fetch('http://localhost:3001/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/login';
    } else {
      console.error('Logout failed');
    }
  } catch (error) {
    console.error('Error logging out:', error);
    // Force logout even if API call fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

## Error Handling

### Validation Error - Invalid Provider (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "ValidationError",
  "statusCode": 400,
  "details": {
    "errors": [
      {
        "field": "provider",
        "message": "\"provider\" must be one of [google, facebook, github]"
      }
    ]
  }
}
```

### Authentication Error - Email Not Found (401)
```json
{
  "success": false,
  "message": "Social provider did not return an email address",
  "error": "AuthenticationError",
  "statusCode": 401
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "InternalServerError",
  "statusCode": 500
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "error": "TooManyRequestsError",
  "statusCode": 429,
  "retryAfter": 60
}
```

---

## Complete Integration Example

### React Component with All Providers
```javascript
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const SocialLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginWithSocialProvider = async (provider, token, tokenType = 'idToken') => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        provider,
        [tokenType]: token,
      };

      const response = await fetch('http://localhost:3001/api/v1/auth/social/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    await loginWithSocialProvider('google', credentialResponse.credential, 'idToken');
  };

  const handleFacebookSuccess = async (response) => {
    await loginWithSocialProvider('facebook', response.accessToken, 'accessToken');
  };

  const handleGitHubLogin = () => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    window.location.href = authUrl;
  };

  return (
    <div className="login-container">
      <h1>Login to Get Plot</h1>
      
      {error && <div className="error-message">{error}</div>}

      <div className="social-login-buttons">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed')}
          disabled={loading}
        />

        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="btn btn-github"
        >
          {loading ? 'Loading...' : 'Login with GitHub'}
        </button>
      </div>
    </div>
  );
};

export default SocialLoginPage;
```

---

## Testing with Postman

1. **Create a new request**
   - Method: POST
   - URL: `http://localhost:3001/api/v1/auth/social/login`

2. **Set Headers**
   ```
   Content-Type: application/json
   ```

3. **Set Body** (select "raw" JSON)
   ```json
   {
     "provider": "google",
     "idToken": "your-id-token-here"
   }
   ```

4. **Click Send**

5. **Check Response**
   - Status code should be 200
   - Response body should contain user and tokens

---

## Best Practices

1. **Always store tokens securely**
   - Use secure HTTP-only cookies when possible
   - Avoid storing in plain localStorage for sensitive apps

2. **Handle token expiration**
   - Implement automatic token refresh
   - Redirect to login when refresh fails

3. **Validate on backend**
   - Always verify tokens on the server
   - Never trust tokens from frontend alone

4. **Handle errors gracefully**
   - Show user-friendly error messages
   - Log errors for debugging

5. **Test all providers**
   - Test each provider independently
   - Test error scenarios

---

**Last Updated**: 2025-04-23
**Version**: 1.0.0