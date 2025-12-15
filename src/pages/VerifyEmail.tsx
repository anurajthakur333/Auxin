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
      setError('EMAIL IS REQUIRED TO SEND VERIFICATION LINK.');
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
        setMessage('VERIFICATION LINK SENT! PLEASE CHECK YOUR EMAIL AND CLICK THE LINK TO VERIFY.');
      } else {
        throw new Error(res?.error || 'FAILED TO SEND VERIFICATION EMAIL');
      }
    } catch (err: any) {
      console.error('❌ Failed to send verification email:', err);
      const errorMsg = err?.message || err?.error || 'FAILED TO SEND VERIFICATION EMAIL. PLEASE TRY AGAIN.';
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
          <h2 className="aeonik-mono" style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            VERIFY YOUR EMAIL
          </h2>
          
          <p className="aeonik-mono" style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem' }}>
            {email ? (
              <>WE'VE SENT A VERIFICATION LINK TO <span style={{ color: '#39FF14' }}>{email.toUpperCase()}</span></>
            ) : (
              'PLEASE CHECK YOUR EMAIL FOR A VERIFICATION LINK'
            )}
          </p>

          {error && (
            <div className="aeonik-mono" style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '0px',
              padding: '0.75rem',
              marginBottom: '1rem',
              color: '#ff6b6b',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {error.toUpperCase()}
            </div>
          )}

          {message && (
            <div className="aeonik-mono" style={{
              background: 'rgba(57,255,20,0.08)',
              border: '1px solid rgba(57,255,20,0.3)',
              borderRadius: '0px',
              padding: '0.75rem',
              marginBottom: '1rem',
              color: '#39FF14',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {message.toUpperCase()}
            </div>
          )}

          {/* Instructions */}
          <div className="aeonik-mono" style={{ 
            color: '#888', 
            fontSize: '0.85rem', 
            textAlign: 'left',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            <p style={{ marginBottom: '0.75rem' }}>STEP 1: CHECK YOUR INBOX FOR THE VERIFICATION EMAIL</p>
            <p style={{ marginBottom: '0.75rem' }}>STEP 2: CLICK THE "VERIFY EMAIL" BUTTON IN THE EMAIL</p>
            <p>STEP 3: YOU'LL BE REDIRECTED TO LOGIN AFTER VERIFICATION</p>
          </div>

          {/* Resend Button */}
          <button
            type="button"
            onClick={handleSendVerification}
            disabled={isLoading}
            className="aeonik-mono"
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
            {isLoading ? 'SENDING...' : 'RESEND VERIFICATION EMAIL'}
          </button>

          {/* Back to Login */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="aeonik-mono"
              style={{ 
                color: '#888', 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              BACK TO LOGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
