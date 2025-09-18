# API Configuration for Railway Backend

This project supports both local development and production deployment with Railway backend.

## Environment Setup

### Local Development
1. Copy `env.example` to `.env`
2. For local development, the frontend uses Vite proxy (no additional config needed)
3. Start backend locally: `npm run dev:server`
4. Start frontend: `npm run dev`

### Production Deployment
1. Set the environment variable in your frontend deployment:
   ```bash
   VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
   ```

2. Replace `your-railway-backend-url.railway.app` with your actual Railway backend URL

## How It Works

### API Configuration (`src/lib/apiConfig.ts`)
- **Local Development**: Uses relative URLs (`/api/*`) handled by Vite proxy
- **Production**: Uses full Railway URL from `VITE_API_BASE_URL`
- Automatically detects environment based on hostname and port

### Updated Files
- ✅ `src/contexts/AuthContext.tsx` - All auth API calls
- ✅ `src/pages/GoogleCallback.tsx` - Google OAuth callback
- ✅ `src/lib/apiConfig.ts` - Centralized API configuration

### Environment Detection
The app automatically detects the environment:
- **Development**: `localhost`, `127.0.0.1`, or port `5173`
- **Production**: Any other hostname (uses Railway URL)

## Railway Backend Setup

Make sure your Railway backend:
1. Is deployed and accessible
2. Has CORS configured for your frontend domain
3. Has all required environment variables set
4. Responds to the same API endpoints (`/api/auth/*`)

## Testing

### Local Testing
```bash
npm run dev:full  # Starts both frontend and backend
```

### Production Testing
1. Deploy frontend with `VITE_API_BASE_URL` set
2. Verify API calls in browser network tab
3. Check console for any CORS or connection errors
