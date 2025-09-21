# Production Login Fix - Auxin Media

## 🔥 Critical Issues Identified

### 1. **API Base URL Configuration Error**
**Problem**: The frontend environment variable is missing the protocol.
```
Current: VITE_API_BASE_URL = auxin-backend.railway.internal
```
**Fix**: Update to include the full URL with protocol:
```
VITE_API_BASE_URL = https://auxin-backend.railway.internal
```

### 2. **Google OAuth Redirect URI Mismatch**
**Problem**: Backend has localhost redirect URI in production.
```
Current: GOOGLE_REDIRECT_URI="http://localhost:5173/auth/google/callback"
```
**Fix**: Update to production URL:
```
GOOGLE_REDIRECT_URI="https://auxin.media/auth/google/callback"
```

### 3. **Missing Google OAuth Credentials**
**Problem**: Placeholder values in production environment.
```
Current: GOOGLE_CLIENT_ID="your-google-client-id"
Current: GOOGLE_CLIENT_SECRET="your-google-client-secret"
```
**Fix**: Set actual Google OAuth credentials.

## 🛠️ Complete Environment Variable Fixes

### Frontend (Netlify) Environment Variables
```bash
VITE_API_BASE_URL=https://auxin-backend.railway.internal
NODE_ENV=production
```

### Backend (Railway) Environment Variables
```bash
# Database
MONGODB_URI_PROD=mongodb+srv://Auxin:Average%40123%21@auxincluster0.uswiagz.mongodb.net/

# JWT Configuration
JWT_SECRET=f270b5a8dc8624ce9a30ac711afbb64e
JWT_EXPIRES_IN=7d

# Google OAuth (CRITICAL: Set real credentials)
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
GOOGLE_REDIRECT_URI=https://auxin.media/auth/google/callback

# Application Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://auxin.media

# Railway specific
NPM_CONFIG_AUDIT=false
NPM_CONFIG_FUND=false
NPM_CONFIG_PRODUCTION=(leave empty)
```

## 🎯 Immediate Actions Required

### 1. Update Frontend Environment (Netlify)
1. Go to Netlify Dashboard → auxin.media site
2. Navigate to Site Settings → Environment Variables
3. Update `VITE_API_BASE_URL` to: `https://auxin-backend.railway.internal`

### 2. Update Backend Environment (Railway)
1. Go to Railway Dashboard → auxin-backend project
2. Navigate to Variables tab
3. Update the following:
   - `GOOGLE_REDIRECT_URI` → `https://auxin.media/auth/google/callback`
   - `GOOGLE_CLIENT_ID` → (your actual Google Client ID)
   - `GOOGLE_CLIENT_SECRET` → (your actual Google Client Secret)

### 3. Google Cloud Console Configuration
1. Go to Google Cloud Console → APIs & Credentials
2. Find your OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://auxin.media/auth/google/callback`
4. Add authorized JavaScript origin: `https://auxin.media`

## 🔄 Deployment Steps

### 1. Deploy Frontend Changes
```bash
# The apiConfig.ts fix has been applied
# Redeploy on Netlify after updating environment variables
```

### 2. Redeploy Backend
```bash
# After updating Railway environment variables
# Redeploy the backend service
```

## 🧪 Testing Checklist

After applying all fixes:

- [ ] Frontend loads at https://auxin.media
- [ ] Login page accessible
- [ ] Regular email/password login works
- [ ] Google OAuth login works
- [ ] Token verification works
- [ ] User registration works
- [ ] Protected routes work correctly

## 🚨 Critical Notes

1. **The main issue**: Frontend was trying to call `auxin-backend.railway.internal/api/auth/login` without HTTPS protocol, resulting in invalid URLs.

2. **CORS Configuration**: Backend CORS is correctly configured for `https://auxin.media`.

3. **Railway Internal URLs**: Railway internal URLs (`*.railway.internal`) are accessible but need full HTTPS protocol.

4. **Google OAuth**: Currently has placeholder credentials - this needs real Google OAuth app credentials to work.

## 🔧 Code Changes Made

### src/lib/apiConfig.ts
- Added automatic HTTPS protocol addition for Railway URLs
- Improved error handling for missing protocols
- Maintained backward compatibility

### Key Change:
```typescript
// If the URL doesn't include protocol, add https://
if (apiUrl && !apiUrl.startsWith('http')) {
  return `https://${apiUrl}`;
}
```

## 📋 Expected Results

After applying these fixes:
1. Regular login should work immediately
2. Google OAuth will work once real credentials are set
3. All API calls will use proper HTTPS URLs
4. CORS issues will be resolved
5. 404 errors will be eliminated

## 🎉 Next Steps

1. Apply environment variable changes
2. Redeploy both services
3. Test login functionality
4. Set up real Google OAuth credentials
5. Test Google login flow
