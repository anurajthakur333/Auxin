import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../lib/apiConfig';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Check if we have user data and token in URL params (from backend redirect)
        const token = searchParams.get('token');
        const userData = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          setError(decodeURIComponent(error));
          setStatus('error');
          
          // Send error message to parent window
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: decodeURIComponent(error)
          }, window.location.origin);
          return;
        }

        if (token && userData) {
          // Backend has already processed the OAuth and sent us the results
          try {
            const user = JSON.parse(decodeURIComponent(userData));
            
            console.log('✅ Google OAuth successful, sending message to parent:', {
              user: user,
              hasToken: !!token,
              origin: window.location.origin
            });
            
            // Send success message to parent window
            // Try multiple target origins to ensure message is received
            if (window.opener) {
              const message = {
                type: 'GOOGLE_AUTH_SUCCESS',
                user: user,
                token: token
              };
              
              console.log('📤 Sending message to parent:', {
                hasOpener: !!window.opener,
                currentOrigin: window.location.origin,
                messageType: message.type
              });
              
              // Try with current origin first
              try {
                window.opener.postMessage(message, window.location.origin);
                console.log('✅ Message sent with origin:', window.location.origin);
              } catch (e) {
                console.warn('⚠️ Failed to send with origin, trying wildcard:', e);
              }
              
              // Also try with wildcard as fallback (for cross-origin scenarios)
              setTimeout(() => {
                try {
                  window.opener?.postMessage(message, '*');
                  console.log('✅ Message sent with wildcard');
                } catch (e) {
                  console.error('❌ Failed to send message with wildcard:', e);
                }
              }, 50);
              
              // One more attempt after a short delay
              setTimeout(() => {
                try {
                  window.opener?.postMessage(message, '*');
                  console.log('✅ Message sent again (retry)');
                } catch (e) {
                  console.error('❌ Failed to send message (retry):', e);
                }
              }, 200);
            } else {
              console.error('❌ window.opener is null');
              setError('Cannot communicate with parent window');
              setStatus('error');
              return;
            }
            
            setStatus('success');
            
            // Close popup after a delay to ensure message is sent
            setTimeout(() => {
              window.close();
            }, 1500);
            return;
          } catch (parseError) {
            console.error('❌ Failed to parse user data:', parseError);
            setError('Failed to parse authentication data');
            setStatus('error');
            
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'Failed to parse authentication data'
              }, window.location.origin);
            }
            return;
          }
        }

        // Fallback: Check for OAuth code (old flow)
        const code = searchParams.get('code');
        
        if (code) {
          // Send code to backend for processing
          const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();

          if (response.ok) {
            console.log('✅ Google OAuth successful (fallback flow), sending message to parent');
            
            // Send success message to parent window
            if (window.opener) {
              const message = {
                type: 'GOOGLE_AUTH_SUCCESS',
                user: data.user,
                token: data.token
              };
              
              // Try with current origin first
              try {
                window.opener.postMessage(message, window.location.origin);
              } catch (e) {
                console.warn('⚠️ Failed to send with origin:', e);
              }
              
              // Also try with wildcard as fallback
              setTimeout(() => {
                try {
                  window.opener?.postMessage(message, '*');
                } catch (e) {
                  console.error('❌ Failed to send message:', e);
                }
              }, 50);
              
              // Retry after delay
              setTimeout(() => {
                try {
                  window.opener?.postMessage(message, '*');
                } catch (e) {
                  console.error('❌ Failed to send message (retry):', e);
                }
              }, 200);
            }
            
            setStatus('success');
            
            // Close popup after a delay to ensure message is sent
            setTimeout(() => {
              window.close();
            }, 1500);
          } else {
            // Send error message to parent window
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: data.error || 'Authentication failed'
            }, window.location.origin);
            
            setError(data.error || 'Google authentication failed');
            setStatus('error');
          }
        } else {
          setError('No authentication data received');
          setStatus('error');
          
          // Send error message to parent window
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'No authentication data received'
          }, window.location.origin);
        }
      } catch (err) {
        console.error('Google callback error:', err);
        setError('An unexpected error occurred');
        setStatus('error');
        
        // Send error message to parent window
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'An unexpected error occurred'
        }, window.location.origin);
      }
    };

    handleGoogleCallback();
  }, [searchParams]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: 'Aeonik, sans-serif',
      padding: '2rem'
    }}>
      {status === 'loading' && (
        <>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #39FF14',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }} />
          <p>Authenticating with Google...</p>
        </>
      )}
      
      {status === 'success' && (
        <>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#39FF14',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" stroke="#000" />
            </svg>
          </div>
          <p>Authentication successful! Closing window...</p>
        </>
      )}
      
      {status === 'error' && (
        <>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#ff6b6b',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" stroke="#fff" />
            </svg>
          </div>
          <p style={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</p>
          <button
            onClick={() => window.close()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#39FF14',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close Window
          </button>
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GoogleCallback;
