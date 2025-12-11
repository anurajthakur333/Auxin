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
  const emailNormalized = useMemo(() => email.trim().toLowerCase(), [email]);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Auto-send verification email on mount
  useEffect(() => {
    if (!emailNormalized) {
      console.warn('⚠️ No email found in URL');
      return;
    }
    
    // Prevent double-send in React StrictMode
    const winAny = window as any;
    if (!winAny.__auxinVerifyAutoSend) winAny.__auxinVerifyAutoSend = {};
    const lastSentAt = winAny.__auxinVerifyAutoSend[emailNormalized] as number | undefined;
    const now = Date.now();
    if (!lastSentAt || (now - lastSentAt) > 5000) {
      winAny.__auxinVerifyAutoSend[emailNormalized] = now;
      handleSendVerification();
    }
  }, [emailNormalized]);

  const handleSendVerification = async () => {
    if (!emailNormalized) {
      setError('Email is required to send verification link.');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setIsLoading(true);
      console.log('📤 Sending verification email for:', emailNormalized);
      
      // Try API-prefixed route first, then fallback
      let res: any;
      try {
        res = await apiCall('/api/auth/send-otp', {
          method: 'POST',
          body: JSON.stringify({ email: emailNormalized }),
        });
      } catch (primaryErr: any) {
        res = await apiCall('/auth/send-otp', {
          method: 'POST',
          body: JSON.stringify({ email: emailNormalized }),
        });
      }
      
      if (res?.success) {
        console.log('✅ Verification email sent');
        setMessage('Verification link sent! Please check your email and click the link to verify.');
        setEmailSent(true);
      } else {
        throw new Error(res?.error || 'Failed to send verification email');
      }
    } catch (err: any) {
      console.error('❌ Failed to send verification email:', err);
      const errorMsg = err?.message || err?.error || 'Failed to send verification email. Please try again.';
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
          <h2 className="aeonik-regular" style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            Verify Your Email
          </h2>
          
          <p className="aeonik-regular" style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem' }}>
            {email ? (
              <>We've sent a verification link to <span style={{ color: '#39FF14' }}>{email}</span></>
            ) : (
              'Please check your email for a verification link'
            )}
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

          {/* Email Icon */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto',
              background: 'rgba(57, 255, 20, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
          </div>

          {/* Instructions */}
          <div className="aeonik-regular" style={{ 
            color: '#888', 
            fontSize: '0.85rem', 
            textAlign: 'center',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            <p style={{ marginBottom: '0.5rem' }}>📧 Check your inbox for the verification email</p>
            <p style={{ marginBottom: '0.5rem' }}>🔗 Click the "VERIFY EMAIL" button in the email</p>
            <p>✅ You'll be redirected to login after verification</p>
          </div>

          {/* Resend Button */}
          <button
            type="button"
            onClick={handleSendVerification}
            disabled={isLoading}
            className="aeonik-regular"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0px',
              border: '1px solid #39FF14',
              background: 'transparent',
              color: '#39FF14',
              fontSize: '1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.7 : 1,
              marginBottom: '1rem',
              textTransform: 'uppercase'
            }}
          >
            {isLoading ? 'Sending...' : 'Resend Verification Email'}
          </button>

          {/* Back to Login */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="aeonik-regular"
              style={{ 
                color: '#888', 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
