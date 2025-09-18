import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ScrambleText from '../components/Scramble';
import '../styles/fonts.css';
import '../styles/Main.css';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signup, googleLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Add global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error in Signup component:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection in Signup component:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Simplified autofill detection (less performance impact)
  useEffect(() => {
    const handleAutofillCheck = () => {
      try {
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        if (emailInput && emailInput.value.length > 0) {
          emailInput.classList.add('autofill-override');
        }
      } catch (error) {
        console.error('Autofill check error:', error);
      }
    };

    // Only run check on focus/blur events instead of continuous monitoring
    try {
      const emailInput = document.querySelector('input[type="email"]');
      if (emailInput) {
        emailInput.addEventListener('blur', handleAutofillCheck);
        emailInput.addEventListener('focus', handleAutofillCheck);
        
        return () => {
          try {
            emailInput.removeEventListener('blur', handleAutofillCheck);
            emailInput.removeEventListener('focus', handleAutofillCheck);
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        };
      }
    } catch (error) {
      console.error('Setup error:', error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting to signup with:', { name, email, password: '***' });
      const result = await signup(name, email, password);
      if (result.success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      console.error('Signup error in component:', err);
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
      {/* Custom styles for input animations and autofill */}
      <style>
        {`
          .signup-input {
            -webkit-text-fill-color: #39FF14 !important;
            caret-color: #39FF14;
            -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            transition: background-color 9999s ease-in-out 0s;
            font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #39FF14 !important;
          }
          .signup-input:-webkit-autofill,
          .signup-input:-webkit-autofill:hover,
          .signup-input:-webkit-autofill:focus,
          .signup-input:-webkit-autofill:active {
            -webkit-text-fill-color: #39FF14 !important;
            caret-color: #39FF14 !important;
            -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            transition: background-color 9999s ease-in-out 0s !important;
            font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #39FF14 !important;
            background-color: rgba(255, 255, 255, 0.05) !important;
          }
          .signup-input:autofill {
            -webkit-text-fill-color: #39FF14 !important;
            caret-color: #39FF14 !important;
            box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #39FF14 !important;
            background-color: rgba(255, 255, 255, 0.05) !important;
          }
          /* Force override for all autofill states */
          .signup-input:-webkit-autofill::first-line {
            font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
            color: #39FF14 !important;
          }
          /* Additional aggressive overrides */
          input.signup-input:-webkit-autofill,
          input.signup-input:-webkit-autofill:hover,
          input.signup-input:-webkit-autofill:focus,
          input.signup-input:-webkit-autofill:active {
            -webkit-text-fill-color: #39FF14 !important;
            -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            background-color: rgba(255, 255, 255, 0.05) !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #39FF14 !important;
          }
          /* Force override for autofilled inputs */
          .autofill-override {
            -webkit-text-fill-color: #39FF14 !important;
            -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            background-color: rgba(255, 255, 255, 0.05) !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #39FF14 !important;
          }
          /* Remove all outlines from checkbox */
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
          input[type="checkbox"]:focus {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          input[type="checkbox"]:hover {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          input[type="checkbox"]:active {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
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

      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '0',
          padding: '3rem',
          width: '100%',
          maxWidth: '450px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
     

          {/* Signup Form */}
          <form onSubmit={handleSubmit}>
            <h2 className="aeonik-regular" style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: '400',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              Create Account
            </h2>
            
            <p className="aeonik-regular" style={{ 
              color: '#888', 
              fontSize: '0.9rem', 
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              Join Auxin Today
            </p>

            {error && (
              <div className="aeonik-regular" style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '0',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#ff6b6b',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={googleLogin}
              disabled={isLoading}
              className="aeonik-regular"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0',
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
              <span className="aeonik-regular" style={{
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

            {/* Name Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="aeonik-regular" style={{ 
                color: 'white', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    try {
                      setName(e.target.value);
                    } catch (error) {
                      console.error('Name input error:', error);
                    }
                  }}
                  placeholder=""
                  required
                  className="aeonik-regular signup-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0',
                    border: isNameFocused ? '1px solid #39FF14' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: isNameFocused ? '#39FF14' : 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    caretColor: '#39FF14'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#39FF14';
                    setIsNameFocused(true);
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    setIsNameFocused(false);
                  }}
                />
                {(!isNameFocused && name.length === 0) && (
                  <div className="aeonik-regular" style={{
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
                      Enter your full name
                    </ScrambleText>
                  </div>
                )}
              </div>
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
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    try {
                      setEmail(e.target.value);
                    } catch (error) {
                      console.error('Email input error:', error);
                    }
                  }}
                  placeholder=""
                  required
                  className="aeonik-regular signup-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0',
                    border: isEmailFocused ? '1px solid #39FF14' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: isEmailFocused ? '#39FF14' : 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    caretColor: '#39FF14'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#39FF14';
                    setIsEmailFocused(true);
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    setIsEmailFocused(false);
                  }}
                />
                {(!isEmailFocused && email.length === 0) && (
                  <div className="aeonik-regular" style={{
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
                      duration={1100}
                    >
                      example@email.com
                    </ScrambleText>
                  </div>
                )}
              </div>
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    try {
                      setPassword(e.target.value);
                    } catch (error) {
                      console.error('Password input error:', error);
                    }
                  }}
                  placeholder=""
                  required
                  className="aeonik-regular signup-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem', // Make space for the toggle button
                    borderRadius: '0',
                    border: isPasswordFocused ? '1px solid #39FF14' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: isPasswordFocused ? '#39FF14' : 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    caretColor: '#39FF14'
                  }}
                  onFocus={(e) => {
                    try {
                      e.target.style.borderColor = '#39FF14';
                      setIsPasswordFocused(true);
                    } catch (error) {
                      console.error('Focus error:', error);
                    }
                  }}
                  onBlur={(e) => {
                    try {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      setIsPasswordFocused(false);
                    } catch (error) {
                      console.error('Blur error:', error);
                    }
                  }}
                />
                {(!isPasswordFocused && password.length === 0) && (
                  <div className="aeonik-regular" style={{
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
                      Create a password
                    </ScrambleText>
                  </div>
                )}
                {/* Show/Hide Password Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="aeonik-regular"
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

            {/* Confirm Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="aeonik-regular" style={{ 
                color: 'white', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    try {
                      setConfirmPassword(e.target.value);
                    } catch (error) {
                      console.error('Confirm password input error:', error);
                    }
                  }}
                  placeholder=""
                  required
                  className="aeonik-regular signup-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem', // Make space for the toggle button
                    borderRadius: '0',
                    border: isConfirmPasswordFocused ? '1px solid #39FF14' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: isConfirmPasswordFocused ? '#39FF14' : 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    caretColor: '#39FF14'
                  }}
                  onFocus={(e) => {
                    try {
                      e.target.style.borderColor = '#39FF14';
                      setIsConfirmPasswordFocused(true);
                    } catch (error) {
                      console.error('Focus error:', error);
                    }
                  }}
                  onBlur={(e) => {
                    try {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      setIsConfirmPasswordFocused(false);
                    } catch (error) {
                      console.error('Blur error:', error);
                    }
                  }}
                />
                {(!isConfirmPasswordFocused && confirmPassword.length === 0) && (
                  <div className="aeonik-regular" style={{
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
                      duration={1300}
                    >
                      Confirm your password
                    </ScrambleText>
                  </div>
                )}
                {/* Show/Hide Confirm Password Button */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="aeonik-regular"
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
                  {showConfirmPassword ? (
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

            {/* Terms Agreement */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              marginBottom: '2rem',
              gap: '0.5rem'
            }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  outline: 'none',
                  border: 'none',
                  boxShadow: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  marginTop: '2px'
                }}
              />
              <label htmlFor="terms" className="aeonik-regular" style={{ 
                color: 'white', 
                fontSize: '0.9rem',
                cursor: 'pointer',
                lineHeight: '1.4'
              }}>
                I agree to the{' '}
                <Link to="/terms" style={{ color: '#39FF14', textDecoration: 'none' }}>
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" style={{ color: '#39FF14', textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="aeonik-regular"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0',
                border: 'none',
                background: 'linear-gradient(135deg, #39FF14, #00cc00)',
                color: '#000',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1,
                marginBottom: '1rem'
              }}
              onMouseEnter={() => {
                if (!isLoading) {

                }
              }}
              onMouseLeave={() => {
           
              }}
            >
              {isLoading ? (
                'Creating Account...'
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
                  C  R  E  A  T  E     A  C  C  O  U  N  T
                </ScrambleText>
              )}
            </button>

            {/* Login Link */}
            <div style={{ textAlign: 'center' }}>
              <span className="aeonik-regular" style={{ color: '#888', fontSize: '0.9rem' }}>
                Already have an account?{' '}
              </span>
              <Link 
                to="/login" 
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
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
      

    </div>
  );
};

export default Signup;
