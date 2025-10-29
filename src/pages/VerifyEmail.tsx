import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiCall } from '../lib/apiConfig';
import '../styles/fonts.css';
import '../styles/Main.css';

const parseQuery = (search: string) => {
  const params = new URLSearchParams(search);
  return {
    email: params.get('email') || '',
  };
};

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = useMemo(() => parseQuery(location.search), [location.search]);

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Auto-send OTP if user just arrived from signup
    if (email) {
      console.log('📧 Auto-sending OTP to:', email);
      handleResend();
    } else {
      console.warn('⚠️ No email found in URL, cannot auto-send OTP');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleResend = async () => {
    if (!email) {
      setError('Email is required to send verification code.');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setIsLoading(true);
      console.log('📤 Sending OTP request for:', email);
      
      const res = await apiCall('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      if (res?.success) {
        console.log('✅ OTP sent successfully');
        setMessage('Verification code sent to your email. Please check your inbox.');
      } else {
        throw new Error(res?.error || 'Failed to send code');
      }
    } catch (err: any) {
      console.error('❌ Failed to send OTP:', err);
      const errorMsg = err?.message || err?.error || 'Failed to send code. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !email) {
      setError('Please enter the code.');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      
      // First verify the OTP
      const res = await apiCall('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      
      if (res?.success) {
        // Backend returns token and user on successful verification
        if (res.token && res.user) {
          // Store token and reload to trigger auth context
          localStorage.setItem('token', res.token);
          // Force reload to refresh auth state
          window.location.href = '/';
        } else {
          // Fallback: navigate to login if token not received
          navigate('/login', { 
            replace: true,
            state: { message: 'Email verified! Please log in.' }
          });
        }
      } else {
        setError(res?.error || 'Invalid or expired code.');
      }
    } catch (err: any) {
      console.error('❌ Verification error:', err);
      const errorMsg = err?.message || err?.error || 'Verification failed. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#000', position: 'relative', zIndex: 1 
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '0px',
          padding: '3rem',
          width: '100%',
          maxWidth: '450px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <form onSubmit={handleVerify}>
            <h2 className="aeonik-regular" style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              Verify Email
            </h2>
            <p className="aeonik-regular" style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem' }}>
              Enter the 6-digit code sent to {email ? <span style={{ color: '#39FF14' }}>{email}</span> : 'your email'}
            </p>

            {error && (
              <div className="aeonik-regular" style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '0px',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#ff6b6b',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {message && (
              <div className="aeonik-regular" style={{
                background: 'rgba(57,255,20,0.08)',
                border: '1px solid rgba(57,255,20,0.3)',
                borderRadius: '0px',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#39FF14',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {message}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="aeonik-regular" style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                placeholder=""
                className="aeonik-regular"
                style={{
                  width: '100%',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  padding: '0.75rem',
                  borderRadius: '0px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#39FF14',
                  fontSize: '1.25rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="aeonik-regular"
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
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="aeonik-regular"
                style={{ color: '#39FF14', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Resend Code
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;


