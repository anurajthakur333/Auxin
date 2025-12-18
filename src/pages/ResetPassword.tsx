import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ScrambleText from '../components/Scramble';
import '../styles/fonts.css';
import '../styles/Main.css';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);
  
  // Validation states
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('INVALID RESET LINK. PLEASE REQUEST A NEW PASSWORD RESET.');
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password/${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setIsTokenValid(true);
          setUserEmail(data.email || '');
        } else {
          setError(data.error || 'INVALID OR EXPIRED RESET LINK. PLEASE REQUEST A NEW PASSWORD RESET.');
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setError('FAILED TO VALIDATE RESET LINK. PLEASE TRY AGAIN.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Validation functions
  const validatePassword = (password: string): string => {
    if (!password) return 'PASSWORD IS REQUIRED';
    if (password.length < 6) return 'PASSWORD MUST BE AT LEAST 6 CHARACTERS';
    return '';
  };

  const validateConfirmPassword = (confirm: string): string => {
    if (!confirm) return 'PLEASE CONFIRM YOUR PASSWORD';
    if (confirm !== password) return 'PASSWORDS DO NOT MATCH';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate fields
    const passwordValidation = validatePassword(password);
    const confirmValidation = validateConfirmPassword(confirmPassword);
    
    setPasswordError(passwordValidation);
    setConfirmError(confirmValidation);

    if (passwordValidation || confirmValidation) {
      setError('PLEASE FIX THE ERRORS ABOVE');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('PASSWORD RESET SUCCESSFUL! REDIRECTING TO LOGIN...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        setError(data.error || 'FAILED TO RESET PASSWORD. PLEASE TRY AGAIN.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('AN ERROR OCCURRED. PLEASE TRY AGAIN.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        background: "#000",
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="aeonik-mono" style={{ color: '#39FF14', fontSize: '1.2rem' }}>
          VALIDATING RESET LINK...
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        background: "#000",
        position: "relative",
        zIndex: 1
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '0',
            padding: '3rem',
            width: '100%',
            maxWidth: '450px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <h2 className="aeonik-mono" style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: '400',
              marginBottom: '1rem'
            }}>
              INVALID RESET LINK
            </h2>
            
            <div className="aeonik-mono" style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '0',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              color: '#ff6b6b',
              fontSize: '0.9rem'
            }}>
              {error.toUpperCase()}
            </div>

            <Link 
              to="/forgot-password" 
              className="aeonik-mono"
              style={{ 
                display: 'inline-block',
                background: 'linear-gradient(135deg, #39FF14, #00cc00)',
                color: '#000',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              REQUEST NEW RESET LINK
            </Link>

            <div style={{ marginTop: '1.5rem' }}>
              <Link 
                to="/login" 
                className="aeonik-mono"
                style={{ 
                  color: '#39FF14', 
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
              >
                BACK TO LOGIN
              </Link>
            </div>
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
          .reset-input {
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
          .reset-input:-webkit-autofill,
          .reset-input:-webkit-autofill:hover,
          .reset-input:-webkit-autofill:focus,
          .reset-input:-webkit-autofill:active {
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
     
          {/* Reset Password Form */}
          <form onSubmit={handleSubmit}>
            <h2 className="aeonik-mono" style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: '400',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              CREATE NEW PASSWORD
            </h2>
            
            <p className="aeonik-mono" style={{ 
              color: '#888', 
              fontSize: '0.9rem', 
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              {userEmail ? `ENTER A NEW PASSWORD FOR ${userEmail.toUpperCase()}` : 'ENTER YOUR NEW PASSWORD BELOW'}
            </p>

            {error && (
              <div className="aeonik-mono" style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '0',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#ff6b6b',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {error.toUpperCase()}
              </div>
            )}

            {success && (
              <div className="aeonik-mono" style={{
                background: 'rgba(57, 255, 20, 0.1)',
                border: '1px solid rgba(57, 255, 20, 0.3)',
                borderRadius: '0',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#39FF14',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {success.toUpperCase()}
              </div>
            )}

            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="aeonik-mono" style={{ 
                color: 'white', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                NEW PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    if (value.length > 0) {
                      setPasswordError(validatePassword(value));
                    } else {
                      setPasswordError('');
                    }
                    // Also revalidate confirm if it has a value
                    if (confirmPassword.length > 0) {
                      setConfirmError(value !== confirmPassword ? 'PASSWORDS DO NOT MATCH' : '');
                    }
                  }}
                  placeholder=""
                  required
                  className="aeonik-mono reset-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
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
                    e.target.style.borderColor = '#39FF14';
                    setIsPasswordFocused(true);
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    setIsPasswordFocused(false);
                  }}
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
                      duration={1000}
                    >
                      Enter new password
                    </ScrambleText>
                  </div>
                )}
              </div>
              {passwordError && (
                <div className="aeonik-mono" style={{
                  color: '#ff6b6b',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem',
                  marginLeft: '0.25rem'
                }}>
                  {passwordError.toUpperCase()}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="aeonik-mono" style={{ 
                color: 'white', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                CONFIRM PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPassword(value);
                    if (value.length > 0) {
                      setConfirmError(value !== password ? 'PASSWORDS DO NOT MATCH' : '');
                    } else {
                      setConfirmError('');
                    }
                  }}
                  placeholder=""
                  required
                  className="aeonik-mono reset-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0',
                    border: isConfirmFocused ? '1px solid #39FF14' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: isConfirmFocused ? '#39FF14' : 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    caretColor: '#39FF14'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#39FF14';
                    setIsConfirmFocused(true);
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    setIsConfirmFocused(false);
                  }}
                />
                {(!isConfirmFocused && confirmPassword.length === 0) && (
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
                      Confirm new password
                    </ScrambleText>
                  </div>
                )}
              </div>
              {confirmError && (
                <div className="aeonik-mono" style={{
                  color: '#ff6b6b',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem',
                  marginLeft: '0.25rem'
                }}>
                  {confirmError.toUpperCase()}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!success}
              className="aeonik-mono"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0',
                border: 'none',
                background: 'linear-gradient(135deg, #39FF14, #00cc00)',
                color: '#000',
                fontSize: '1rem',
                cursor: isLoading || success ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isLoading || success ? 0.7 : 1,
                marginBottom: '1rem'
              }}
            >
              {isLoading ? (
                'RESETTING PASSWORD...'
              ) : success ? (
                'PASSWORD RESET!'
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
                  R  E  S  E  T     P  A  S  S  W  O  R  D
                </ScrambleText>
              )}
            </button>

            {/* Back to Login Link */}
            <div style={{ textAlign: 'center' }}>
              <span className="aeonik-mono" style={{ color: '#888', fontSize: '0.9rem' }}>
                REMEMBER YOUR PASSWORD?{' '}
              </span>
              <Link 
                to="/login" 
                className="aeonik-mono"
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
                SIGN IN
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;



