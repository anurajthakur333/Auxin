# Auxin Media - Frontend

A modern, responsive frontend for Auxin Media built with React, TypeScript, and Vite.

## 🚀 Features

- **Modern Tech Stack**: React 19, TypeScript, Vite
- **Responsive Design**: Mobile-first approach with Bootstrap integration
- **Custom Animations**: ScrambleText effects, smooth scrolling with Lenis
- **Interactive Components**: Particle systems, dynamic squares background
- **Authentication**: Complete auth flow with Google OAuth integration
- **Custom Typography**: Aeonik font family integration
- **Performance Optimized**: Vite build system with code splitting

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 6
- **Styling**: CSS + Bootstrap 5
- **Routing**: React Router DOM
- **Animations**: Custom ScrambleText, Lenis smooth scrolling
- **Graphics**: Canvas-based particle system and interactive backgrounds
- **Font**: Custom Aeonik font family

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd auxin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
VITE_API_BASE_URL=your-backend-api-url
```

4. Start the development server:
```bash
npm run dev
```

## 🎯 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:ts` - TypeScript check + build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── Particles.tsx    # Canvas-based particle system
│   ├── Scramble.tsx     # Text scramble animation
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── lib/               # Utility functions
│   ├── apiConfig.ts   # API configuration
│   └── googleAuth.ts  # Google OAuth helpers
├── pages/             # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── ...
├── styles/            # CSS files
│   ├── fonts.css      # Custom font definitions
│   ├── Main.css       # Global styles
│   └── ...
└── assets/            # Static assets
    └── fonts/         # Custom font files
```

## 🎨 Key Components

### ScrambleText
Custom text animation component with configurable effects:
```tsx
<ScrambleText
  trigger="load"
  speed="fast"
  revealSpeed={0.3}
  scrambleIntensity={1}
>
  Your Text Here
</ScrambleText>
```

### Particles
Canvas-based particle system with customizable properties:
```tsx
<Particles 
  density="medium"
  speed="slow"
  size="uniform-small"
  color="rgb(255, 255, 255)"
/>
```

### Squares
Interactive grid background with hover effects:
```tsx
<Squares 
  speed={0.3} 
  squareSize={100}
  direction='up'
  hoverPattern='plus'
/>
```

## 🚀 Deployment

### Netlify
The project is configured for Netlify deployment with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect rules configured

### Vercel
Also configured for Vercel with proper rewrites for SPA routing.

## 🔧 Configuration

### Environment Variables
- `VITE_API_BASE_URL` - Backend API URL for authentication and data

### Vite Configuration
- React plugin enabled
- Custom asset handling for fonts
- Development proxy for API calls
- Optimized build output

## 🎭 Custom Fonts

The project uses the Aeonik font family:
- Aeonik Regular
- Aeonik Bold
- Aeonik Light
- Aeonik Italic variants
- AuxinNumbers (custom number font)

## 📱 Responsive Design

- Mobile-first approach
- Bootstrap 5 grid system
- Custom breakpoints for optimal viewing
- Touch-friendly interactions

## 🔐 Authentication

Complete authentication system with:
- Email/password signup and login
- Google OAuth integration
- JWT token management
- Protected routes
- Persistent sessions

## 🎪 Performance Features

- Lazy loading for optimal bundle size
- Canvas-based animations for smooth performance
- Optimized font loading
- Efficient state management
- Code splitting for faster initial loads

## 📄 License

Private project for Auxin Media.

---

Built with ❤️ for Auxin Media