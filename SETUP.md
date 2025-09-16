# Auxin Authentication Setup Guide

This guide will help you set up Google OAuth authentication and MongoDB integration for both development and production environments.

## 🚀 Quick Start

### 1. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

### 2. MongoDB Setup

#### Development (Local MongoDB)
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Production (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI_PROD` in your `.env` file

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs:
   - Development: `http://localhost:5173/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
6. Copy Client ID and Secret to your `.env` file

### 4. Environment Variables

Update your `.env` file with the following:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/auxin
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/auxin

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Environment
NODE_ENV=development
PORT=3001

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 🛠️ Development

### Start Both Frontend and Backend
```bash
npm run dev:full
```

### Start Only Frontend
```bash
npm run dev
```

### Start Only Backend
```bash
npm run dev:server
```

## 🏗️ Production

### Build and Start
```bash
# Build both frontend and backend
npm run build
npm run build:server

# Start production server
npm start
```

### Environment Variables for Production
Make sure to set these environment variables in your production environment:

```env
NODE_ENV=production
MONGODB_URI_PROD=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
FRONTEND_URL=https://yourdomain.com
PORT=3001
```

## 🔧 Configuration

### Making Pages Protected

To protect any page, wrap it with `ProtectedRoute`:

```tsx
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/protected-page" 
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  } 
/>
```

### Adding New Authentication Methods

1. Add new route in `src/routes/auth.ts`
2. Update `AuthContext` with new method
3. Add UI component for the new auth method

## 🗄️ Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (optional, hashed),
  googleId: String (optional, unique),
  avatar: String (optional),
  isEmailVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **CORS Protection**: Configured for your domain
- **Input Validation**: Email format and password strength
- **Error Handling**: Secure error messages
- **Session Management**: Automatic token verification

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **Google OAuth Not Working**
   - Verify redirect URI matches exactly
   - Check Google Cloud Console settings
   - Ensure API is enabled

3. **JWT Token Issues**
   - Check JWT_SECRET is set
   - Verify token expiration
   - Check token format

4. **CORS Errors**
   - Update FRONTEND_URL in .env
   - Check server CORS configuration

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Get Google OAuth URL
- `POST /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout (client-side)

### Health Check
- `GET /api/health` - Server health status

## 🔄 Deployment

### Vercel/Netlify (Frontend)
1. Build frontend: `npm run build`
2. Deploy `dist` folder
3. Set environment variables

### Railway/Heroku (Backend)
1. Build backend: `npm run build:server`
2. Deploy with environment variables
3. Ensure MongoDB connection

### Docker (Full Stack)
```dockerfile
# Add Dockerfile for containerized deployment
```

## 📊 Monitoring

- Database queries are logged in development
- Error tracking ready for production
- Health check endpoint available
- JWT token expiration handling

## 🎯 Next Steps

1. Set up email verification
2. Add password reset functionality
3. Implement user roles and permissions
4. Add social login providers (GitHub, Facebook)
5. Set up monitoring and analytics
6. Add rate limiting
7. Implement 2FA

---

**Need Help?** Check the troubleshooting section or create an issue in the repository.
