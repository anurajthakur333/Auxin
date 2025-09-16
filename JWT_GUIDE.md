# JWT Token Decoding Guide

## 🔐 **JWT Token Structure**

A JWT token has 3 parts separated by dots (`.`):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM5YWMwNzBhNDY4ZTdhY2YwM2YzMmEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTgwNDcyMzksImV4cCI6MTc1ODY1MjAzOX0.1qsQG3QsiYCjZatVJWmtmQliqELV-FIT5yqmtgLgWiA
```

1. **Header** (red): Algorithm and token type
2. **Payload** (purple): User data and claims
3. **Signature** (blue): Verification signature

## 🛠️ **How to Decode JWT Tokens**

### 1. **Using the Built-in Functions**

```typescript
import { decodeToken, isTokenExpired, getTokenExpiration } from './src/lib/jwt';

// Get token from localStorage or API response
const token = localStorage.getItem('token');

// Decode token (without verification)
const decoded = decodeToken(token);
console.log('Decoded payload:', decoded);
// Output: { userId: "68c9ac070a468e7acf03f32a", email: "test@example.com", iat: 1758047239, exp: 1758652039 }

// Check if token is expired
const expired = isTokenExpired(token);
console.log('Is expired:', expired);

// Get expiration date
const expirationDate = getTokenExpiration(token);
console.log('Expires at:', expirationDate);
```

### 2. **Manual Decoding (Browser)**

```javascript
// Get token
const token = localStorage.getItem('token');

// Split the token
const parts = token.split('.');

// Decode the payload (middle part)
const payload = JSON.parse(atob(parts[1]));

console.log('Decoded payload:', payload);
```

### 3. **Using Online Tools**

- **JWT.io**: https://jwt.io/
- **JWT Decoder**: https://jwt-decoder.com/
- **JWT Debugger**: https://jwt.ms/

### 4. **Using Command Line**

```bash
# Install jq for JSON formatting
npm install -g jq

# Decode JWT token
echo "YOUR_JWT_TOKEN" | cut -d. -f2 | base64 -d | jq .
```

### 5. **Using Node.js**

```javascript
const jwt = require('jsonwebtoken');

// Decode without verification
const decoded = jwt.decode(token);
console.log(decoded);

// Verify and decode
const verified = jwt.verify(token, 'your-secret-key');
console.log(verified);
```

## 📊 **JWT Payload Structure**

Our JWT tokens contain:

```typescript
interface JWTPayload {
  userId: string;    // User's MongoDB ID
  email: string;     // User's email
  iat: number;       // Issued at (timestamp)
  exp: number;       // Expires at (timestamp)
}
```

## 🔍 **Common Use Cases**

### 1. **Check User Authentication**

```typescript
const checkAuth = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No token found');
    return false;
  }
  
  if (isTokenExpired(token)) {
    console.log('Token expired');
    localStorage.removeItem('token');
    return false;
  }
  
  const user = decodeToken(token);
  console.log('User authenticated:', user);
  return true;
};
```

### 2. **Get User Info from Token**

```typescript
const getUserFromToken = () => {
  const token = localStorage.getItem('token');
  
  if (!token || isTokenExpired(token)) {
    return null;
  }
  
  const decoded = decodeToken(token);
  return {
    id: decoded?.userId,
    email: decoded?.email
  };
};
```

### 3. **Token Expiration Warning**

```typescript
const checkTokenExpiration = () => {
  const token = localStorage.getItem('token');
  
  if (!token) return;
  
  const expirationDate = getTokenExpiration(token);
  const now = new Date();
  const timeLeft = expirationDate.getTime() - now.getTime();
  const hoursLeft = timeLeft / (1000 * 60 * 60);
  
  if (hoursLeft < 24) {
    console.warn(`Token expires in ${hoursLeft.toFixed(1)} hours`);
  }
};
```

## 🚨 **Security Notes**

### ✅ **Safe Operations**
- `decodeToken()` - Safe, no verification
- `isTokenExpired()` - Safe, no verification
- `getTokenExpiration()` - Safe, no verification

### ⚠️ **Use with Caution**
- `verifyToken()` - Verifies signature, use for server-side validation
- Never trust client-side decoded data for security decisions
- Always verify tokens on the server before making important decisions

## 🔧 **Debugging JWT Issues**

### 1. **Token Not Working**
```typescript
const debugToken = (token: string) => {
  console.log('Token:', token);
  console.log('Is expired:', isTokenExpired(token));
  console.log('Decoded:', decodeToken(token));
  console.log('Expires at:', getTokenExpiration(token));
};
```

### 2. **Check Token Format**
```typescript
const isValidJWTFormat = (token: string) => {
  const parts = token.split('.');
  return parts.length === 3;
};
```

### 3. **Common Issues**
- **Token expired**: Check `isTokenExpired()`
- **Invalid format**: Check if token has 3 parts
- **Malformed JSON**: Check if payload can be decoded
- **Wrong secret**: Server verification will fail

## 📝 **Example Usage in React**

```typescript
import { useAuth } from './contexts/AuthContext';
import { decodeToken, isTokenExpired } from './lib/jwt';

const UserProfile = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      const expired = isTokenExpired(token);
      
      console.log('User from token:', decoded);
      console.log('Token expired:', expired);
    }
  }, [token]);
  
  return <div>User: {user?.name}</div>;
};
```

## 🎯 **Quick Reference**

| Function | Purpose | Safe? | Returns |
|----------|---------|-------|---------|
| `decodeToken()` | Decode without verification | ✅ | `JWTPayload \| null` |
| `verifyToken()` | Verify and decode | ⚠️ | `JWTPayload` |
| `isTokenExpired()` | Check expiration | ✅ | `boolean` |
| `getTokenExpiration()` | Get expiration date | ✅ | `Date \| null` |

---

**Remember**: Always verify tokens on the server for security-critical operations!
