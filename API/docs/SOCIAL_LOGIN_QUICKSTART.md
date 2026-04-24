# Social Login Quick Start (5 Minutes)

## ⚡ TL;DR - 5 Minute Setup

### 1. Get Your Credentials

**Google** (2 min)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project → Enable Google+ API
3. Create OAuth Client ID (Web Application)
4. Copy: **Client ID** and **Client Secret**

**Facebook** (2 min)
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create New App
3. Add Facebook Login product
4. Copy: **App ID** and **App Secret**

**GitHub** (1 min)
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. New OAuth App
3. Copy: **Client ID** and **Client Secret**

### 2. Update .env File

```bash
# In /API/.env

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret

GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

### 3. Start API

```bash
cd API
yarn dev
```

Auth service will be running on `http://localhost:3001`

### 4. Test with cURL

```bash
# Google
curl -X POST http://localhost:3001/api/v1/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{"provider":"google","idToken":"YOUR_GOOGLE_TOKEN"}'

# Facebook
curl -X POST http://localhost:3001/api/v1/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{"provider":"facebook","accessToken":"YOUR_FACEBOOK_TOKEN"}'

# GitHub
curl -X POST http://localhost:3001/api/v1/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{"provider":"github","accessToken":"YOUR_GITHUB_TOKEN"}'
```

---

## 🎯 API Endpoint

**POST** `/api/v1/auth/social/login`

### Request
```json
{
  "provider": "google",
  "idToken": "jwt-token"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": 1800
    }
  }
}
```

---

## 🔌 Frontend Integration (React)

### Google
```bash
npm install @react-oauth/google
```

```javascript
import { GoogleLogin } from '@react-oauth/google';

const handleSuccess = async (credentialResponse) => {
  const res = await fetch('http://localhost:3001/api/v1/auth/social/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'google',
      idToken: credentialResponse.credential,
    }),
  });
  
  const data = await res.json();
  localStorage.setItem('accessToken', data.data.tokens.accessToken);
};

export default () => <GoogleLogin onSuccess={handleSuccess} />;
```

### Facebook
```bash
npm install react-facebook-login
```

```javascript
import FacebookLogin from 'react-facebook-login';

const handleSuccess = async (response) => {
  const res = await fetch('http://localhost:3001/api/v1/auth/social/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'facebook',
      accessToken: response.accessToken,
    }),
  });
  
  const data = await res.json();
  localStorage.setItem('accessToken', data.data.tokens.accessToken);
};

export default () => (
  <FacebookLogin
    appId={process.env.REACT_APP_FACEBOOK_APP_ID}
    callback={handleSuccess}
  />
);
```

### GitHub
```javascript
const handleGitHub = () => {
  const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
  window.location.href = 
    `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
};

// In callback page, exchange code for token and send to API
```

---

## ✅ Verify It Works

1. **Auth service running?**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"healthy","service":"auth-service"}
   ```

2. **Database connected?**
   ```bash
   curl http://localhost:3001/health/ready
   # Should return: {"status":"ready"}
   ```

3. **Test social login endpoint?**
   Use the cURL examples above with real provider tokens

---

## 🐛 Troubleshooting

### "Provider did not return email"
- **Google**: Verify user has verified email in Google account
- **Facebook**: User must allow email permission in login dialog
- **GitHub**: User must have email set public in GitHub settings

### "Token verification failed"
- Check credentials in `.env` are correct
- Verify redirect URIs match in provider settings
- Token might be expired (try getting a new one)

### "CORS error"
- API gateway handles CORS for all services
- Make sure request includes `Content-Type: application/json`

### "User already exists"
- Email was already registered
- User should use regular login
- Or link accounts (future feature)

---

## 📚 Need More Help?

- **Setup Guide**: See `SOCIAL_LOGIN_SETUP.md`
- **API Examples**: See `SOCIAL_LOGIN_EXAMPLES.md`
- **Full Summary**: See `SOCIAL_LOGIN_SUMMARY.md`

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Update `.env` with production credentials
- [ ] Set `SESSION_COOKIE_SECURE=true` in production
- [ ] Add production domain to OAuth provider settings
- [ ] Test all 3 providers in production environment
- [ ] Enable HTTPS
- [ ] Monitor error logs for failures
- [ ] Have a rollback plan

---

## 🎉 You're Done!

Social login is ready to use. Start integrating into your frontend now.

Questions? Check the detailed docs:
- `SOCIAL_LOGIN_SETUP.md` - Complete setup instructions
- `SOCIAL_LOGIN_EXAMPLES.md` - Full API examples
- `API_MANUAL.md` - Full API documentation