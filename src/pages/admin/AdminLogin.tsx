import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrambleText from '../../components/Scramble';
import { API_BASE_URL } from '../../lib/apiConfig';
import '../../styles/fonts.css';
import '../../styles/Main.css';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Attempting admin login to:', `${API_BASE_URL}/api/auth/admin/login`);
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔐 Response status:', response.status);

      // Handle non-JSON responses (like 404)
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('🔐 Non-JSON response:', text);
        setError(`SERVER ERROR: ${response.status} - ${text || 'Route not found'}`);
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        // Store admin token
        localStorage.setItem('adminToken', data.token);
        console.log('✅ Admin login successful, redirecting to dashboard');
        // Redirect to admin dashboard
        navigate('/admin/dashboard', { replace: true });
      } else {
        // For invalid credentials or other auth failures, show a strong legal warning
        const baseMessage = (data.error || 'INVALID CREDENTIALS').toUpperCase();
        const legalWarning =
          '⚠️ WARNING: RESTRICTED AREA\n' +
          'UNAUTHORIZED ACCESS IS A PUNISHABLE OFFENSE UNDER SECTION 43 AND SECTION 66 OF THE INFORMATION TECHNOLOGY ACT, 2000 (INDIA).\n' +
          'VIOLATORS MAY FACE CRIMINAL PROSECUTION, FINES, AND IMPRISONMENT.\n' +
          'ALL ACCESS ATTEMPTS ARE LOGGED.';
        setError(`${baseMessage}\n\n${legalWarning}`);
      }
    } catch (err) {
      console.error('🔐 Admin login error:', err);
      setError('AN ERROR OCCURRED. PLEASE TRY AGAIN.');
    } finally {
      setIsLoading(false);
    }
  };

  // Lock admin login to desktop-only (width > 900px)
  React.useEffect(() => {
    const handleResize = () => {
      try {
        setIsSmallScreen(window.innerWidth <= 900);
      } catch (err) {
        console.error('Viewport check error (AdminLogin):', err);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Desktop-only gate: show a refined access denied screen on small widths
  if (isSmallScreen) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #000000 100%)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background grid */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(255, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: 0.3,
            zIndex: 0,
          }}
        />

        {/* Content container */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Lock icon */}
          <div
            style={{
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(255, 0, 0, 0.05))',
                border: '2px solid rgba(255, 82, 82, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(255, 0, 0, 0.3)',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff5252"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1
            className="aeonik-mono"
            style={{
              color: '#ff5252',
              fontSize: '2.5rem',
              letterSpacing: '0.3em',
              fontWeight: 700,
              marginBottom: '1rem',
              textTransform: 'uppercase',
              textShadow: '0 0 20px rgba(255, 82, 82, 0.5)',
            }}
          >
            ACCESS DENIED
          </h1>

          {/* Subtitle */}
          <p
            className="aeonik-mono"
            style={{
              color: '#888',
              fontSize: '0.9rem',
              marginBottom: '3rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Desktop Access Required
          </p>

          {/* Warning box */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 82, 82, 0.15), rgba(0, 0, 0, 0.8))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 82, 82, 0.4)',
              borderRadius: '0px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 20px 60px rgba(255, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              className="aeonik-mono"
              style={{
                color: '#ff9090',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⚠</span>
              WARNING · RESTRICTED ADMIN AREA
            </div>

            <div
              className="aeonik-mono"
              style={{
                color: '#f6e088',
                fontSize: '0.7rem',
                lineHeight: 1.8,
                marginBottom: '1rem',
                letterSpacing: '0.05em',
              }}
            >
              UNAUTHORIZED ACCESS IS A PUNISHABLE OFFENSE UNDER SECTION 43 AND SECTION 66 OF THE INFORMATION TECHNOLOGY ACT, 2000 (INDIA).
            </div>

            <div
              className="aeonik-mono"
              style={{
                color: '#f6e088',
                fontSize: '0.7rem',
                lineHeight: 1.8,
                marginBottom: '1rem',
                letterSpacing: '0.05em',
              }}
            >
              VIOLATORS MAY FACE CRIMINAL PROSECUTION, FINES, AND IMPRISONMENT.
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '1rem',
                marginTop: '1rem',
              }}
            >
              <div
                className="aeonik-mono"
                style={{
                  color: '#e3e7ef',
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                }}
              >
                ALL ACCESS ATTEMPTS ARE LOGGED.
              </div>
            </div>
          </div>

          {/* Info message */}
          <div
            className="aeonik-mono"
            style={{
              color: '#666',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              lineHeight: 1.6,
            }}
          >
            This administrative interface requires a desktop environment for security and compliance purposes.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh", 
      background: "#000",
      position: "relative",
      zIndex: 1
    }}>
      {/* Custom styles for input animations and autofill */}
      <style>
        {`
          .login-input {
            -webkit-text-fill-color: #39FF14 !important;
            caret-color: #39FF14;
            -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            transition: background-color 9999s ease-in-out 0s;
            font-family: 'Aeonik Mono', monospace !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #39FF14 !important;
          }
          .login-input:-webkit-autofill,
          .login-input:-webkit-autofill:hover,
          .login-input:-webkit-autofill:focus,
          .login-input:-webkit-autofill:active {
            -webkit-text-fill-color: #39FF14 !important;
            caret-color: #39FF14 !important;
            -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            transition: background-color 9999s ease-in-out 0s !important;
            font-family: 'Aeonik Mono', monospace !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #39FF14 !important;
            background-color: rgba(255, 255, 255, 0.05) !important;
          }
          input[type="checkbox"] {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
            background: white !important;
            width: 16px !important;
            height: 16px !important;
            position: relative !important;
          }
          input[type="checkbox"]:checked {
            background: #39FF14 !important;
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          input[type="checkbox"]:checked::after {
            content: '✓' !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            color: #000 !important;
            font-size: 12px !important;
            font-weight: bold !important;
          }
        `}
      </style>

      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.95))',
            backdropFilter: 'blur(20px)',
            borderRadius: '0px',
            padding: '3rem 3.25rem',
            width: '100%',
            maxWidth: '460px',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 32px 80px rgba(0, 0, 0, 0.85)',
            boxSizing: 'border-box',
          }}>
          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Header with badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <div>
                <h2 className="aeonik-mono" style={{ 
                  color: 'white', 
                  fontSize: '1.4rem', 
                  marginBottom: '0.25rem',
                  letterSpacing: '0.15em',
                }}>
                  ADMIN LOGIN
                </h2>
                <p className="aeonik-mono" style={{ 
                  color: '#888', 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}>
                  RESTRICTED SYSTEM ACCESS
                </p>
              </div>
              <div
                className="aeonik-mono"
                style={{
                  border: '1px solid rgba(255, 0, 0, 0.7)',
                  color: '#ff6b6b',
                  fontSize: '0.7rem',
                  padding: '0.35rem 0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  background: 'rgba(255, 0, 0, 0.1)',
                }}
              >
                ALERT
              </div>
            </div>

            {error && (
              <div
                className="aeonik-mono"
                style={{
                  background: 'rgba(255, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 0, 0, 0.6)',
                  borderRadius: '0px',
                  padding: '0.9rem',
                  marginBottom: '1.25rem',
                  color: '#ff6b6b',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  textTransform: 'uppercase',
                  boxShadow: '0 0 25px rgba(255, 0, 0, 0.25)',
                }}
              >
                {error.split('\n').map((line, idx) => (
                  <div key={idx} style={{ marginBottom: idx === error.split('\n').length - 1 ? 0 : 4 }}>
                    {line}
                  </div>
                ))}
              </div>
            )}

            {/* Email Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="aeonik-mono" style={{ 
                color: 'white', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                EMAIL
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  required
                  className="aeonik-mono login-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0px',
                    border: isEmailFocused ? '1px solid #39FF14' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: isEmailFocused ? '#39FF14' : 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    caretColor: '#39FF14'
                  }}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
                {(!isEmailFocused && email.length === 0) && (
                  <div className="aeonik-mono" style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#888',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem'
                  }}>
                    <ScrambleText
                      trigger="load"
                      scrambleColor="#888"
                      speed="slow"
                      revealSpeed={0.5}
                      matchWidth
                      fps={30}
                      duration={1000}
                    >
                      ADMIN@EMAIL.COM
                    </ScrambleText>
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="aeonik-mono" style={{ 
                color: 'white', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  required
                  className="aeonik-mono login-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    borderRadius: '0px',
                    border: isPasswordFocused ? '1px solid #39FF14' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: isPasswordFocused ? '#39FF14' : 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    caretColor: '#39FF14'
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                {(!isPasswordFocused && password.length === 0) && (
                  <div className="aeonik-mono" style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#888',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem'
                  }}>
                    <ScrambleText
                      trigger="load"
                      scrambleColor="#888"
                      speed="slow"
                      revealSpeed={0.5}
                      matchWidth
                      fps={30}
                      duration={1200}
                    >
                      ENTER YOUR PASSWORD
                    </ScrambleText>
                  </div>
                )}
                {/* Show/Hide Password Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="aeonik-mono"
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.3s ease',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#39FF14';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#888';
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="aeonik-mono"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0px',
                border: 'none',
                background: 'linear-gradient(135deg, #39FF14, #00cc00)',
                color: '#000',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1,
                marginBottom: '1rem',
                textTransform: 'uppercase'
              }}
            >
              {isLoading ? (
                'LOGGING IN...'
              ) : (
                <ScrambleText
                  trigger="hover"
                  scrambleColor="#000"
                  speed="medium"
                  revealSpeed={0.4}
                  matchWidth
                  fps={30}
                  duration={800}
                >
                  LOGIN
                </ScrambleText>
              )}
            </button>
          </form>
          </div>
      </div>
    </div>
  );
};

export default AdminLogin;