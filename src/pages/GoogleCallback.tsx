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
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setError('Google authentication was cancelled or failed');
          setStatus('error');
          return;
        }

        if (!code) {
          setError('No authorization code received from Google');
          setStatus('error');
          return;
        }

        // Send code to backend
        const response = await fetch(`${API_BASE_URL}/api/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (response.ok) {
          // Send success message to parent window
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            user: data.user,
            token: data.token
          }, window.location.origin);
          
          setStatus('success');
          
          // Close popup after a short delay
          setTimeout(() => {
            window.close();
          }, 1000);
        } else {
          // Send error message to parent window
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: data.error
          }, window.location.origin);
          
          setError(data.error || 'Google authentication failed');
          setStatus('error');
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
