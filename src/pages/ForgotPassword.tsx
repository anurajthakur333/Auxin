import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ScrambleText from '../components/Scramble';
import '../styles/fonts.css';
import '../styles/Main.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Add global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error in ForgotPassword component:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection in ForgotPassword component:', event.reason);
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
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    if (email.length > 254) return 'Email is too long';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate email
    const emailValidation = validateEmail(email);
    setEmailError(emailValidation);

    if (emailValidation) {
      setError('Please fix the errors above');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to your backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset instructions have been sent to your email address.');
        setEmail('');
      } else {
        setError(data.error || 'Failed to send reset instructions. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
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
          .forgot-input {
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
          .forgot-input:-webkit-autofill,
          .forgot-input:-webkit-autofill:hover,
          .forgot-input:-webkit-autofill:focus,
          .forgot-input:-webkit-autofill:active {
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
          .forgot-input:autofill {
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
          .forgot-input:-webkit-autofill::first-line {
            font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
            color: #39FF14 !important;
          }
          /* Additional aggressive overrides */
          input.forgot-input:-webkit-autofill,
          input.forgot-input:-webkit-autofill:hover,
          input.forgot-input:-webkit-autofill:focus,
          input.forgot-input:-webkit-autofill:active {
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
     
          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit}>
            <h2 className="aeonik-regular" style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: '400',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              Reset Password
            </h2>
            
            <p className="aeonik-regular" style={{ 
              color: '#888', 
              fontSize: '0.9rem', 
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              Enter your email address and we'll send you instructions to reset your password
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

            {success && (
              <div className="aeonik-regular" style={{
                background: 'rgba(57, 255, 20, 0.1)',
                border: '1px solid rgba(57, 255, 20, 0.3)',
                borderRadius: '0',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#39FF14',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {success}
              </div>
            )}

            {/* Email Field */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="aeonik-regular" style={{ 
                color: 'white', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    try {
                      const value = e.target.value;
                      setEmail(value);
                      // Real-time validation
                      if (value.length > 0) {
                        setEmailError(validateEmail(value));
                      } else {
                        setEmailError('');
                      }
                    } catch (error) {
                      console.error('Email input error:', error);
                    }
                  }}
                  placeholder=""
                  required
                  className="aeonik-regular forgot-input"
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
                      duration={1000}
                    >
                      example@email.com
                    </ScrambleText>
                  </div>
                )}
              </div>
              {emailError && (
                <div className="aeonik-regular" style={{
                  color: '#ff6b6b',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem',
                  marginLeft: '0.25rem'
                }}>
                  {emailError}
                </div>
              )}
            </div>

            {/* Submit Button */}
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
                  // Add hover effect if needed
                }
              }}
              onMouseLeave={() => {
                // Remove hover effect if needed
              }}
            >
              {isLoading ? (
                'Sending Instructions...'
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
                  S  E  N  D     R  E  S  E  T     L  I  N  K
                </ScrambleText>
              )}
            </button>

            {/* Back to Login Link */}
            <div style={{ textAlign: 'center' }}>
              <span className="aeonik-regular" style={{ color: '#888', fontSize: '0.9rem' }}>
                Remember your password?{' '}
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

export default ForgotPassword;
