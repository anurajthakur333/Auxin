import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/fonts.css';
import '../styles/Main.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, googleLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh", 
      background: "#000",
      position: "relative",
      zIndex: 1
    }}>
      <Navbar />
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '3rem',
          width: '100%',
          maxWidth: '450px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="aeonik-regular" style={{ 
              color: '#39FF14', 
              fontSize: '2rem', 
              fontWeight: '600',
              margin: 0
            }}>
              AUXIN
            </h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <h2 className="aeonik-regular" style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: '400',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              Login
            </h2>
            
            <p className="aeonik-regular" style={{ 
              color: '#888', 
              fontSize: '0.9rem', 
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              Welcome back to Auxin Media
            </p>

            {error && (
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#ff6b6b',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Google Login Button */}
            <button
              type="button"
              onClick={googleLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '0.9rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1,
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = '#39FF14';
                  e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.2)'
              }} />
              <span style={{
                padding: '0 1rem',
                color: '#888',
                fontSize: '0.9rem'
              }}>
                or
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.2)'
              }} />
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="aeonik-regular" style={{ 
                color: 'white', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#39FF14';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="aeonik-regular" style={{ 
                color: 'white', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#39FF14';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              />
            </div>

            {/* Remember Me */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '2rem',
              gap: '0.5rem'
            }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#39FF14'
                }}
              />
              <label htmlFor="remember" className="aeonik-regular" style={{ 
                color: 'white', 
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}>
                Remember Me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #39FF14, #00cc00)',
                color: '#000',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1,
                marginBottom: '1rem'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(57, 255, 20, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            {/* Forgot Password */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <a 
                href="#" 
                className="aeonik-regular"
                style={{ 
                  color: '#39FF14', 
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Sign Up Link */}
            <div style={{ textAlign: 'center' }}>
              <span className="aeonik-regular" style={{ color: '#888', fontSize: '0.9rem' }}>
                Don't have an account?{' '}
              </span>
              <Link 
                to="/signup" 
                className="aeonik-regular"
                style={{ 
                  color: '#39FF14', 
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
