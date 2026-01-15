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
        // Store opener reference immediately to prevent loss during redirects
        const opener = window.opener;
        // Safely get parent origin - handle case where opener might be closed
        let parentOrigin = window.location.origin;
        try {
          if (opener && !opener.closed) {
            parentOrigin = new URL(opener.location.href).origin;
          }
        } catch (e) {
          console.warn('Could not access opener location, using current origin:', e);
          parentOrigin = window.location.origin;
        }
        
        // Check if we have user data and token in URL params (from backend redirect)
        const token = searchParams.get('token');
        const userData = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          setError(decodeURIComponent(error));
          setStatus('error');
          
          // Send error message to parent window - try multiple methods
          if (opener && !opener.closed) {
            try {
              opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: decodeURIComponent(error)
              }, parentOrigin);
            } catch (e) {
              console.warn('Failed to send error with origin, trying wildcard:', e);
              opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: decodeURIComponent(error)
              }, '*');
            }
          } else {
            // Fallback: try to find parent window
            try {
              window.parent.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: decodeURIComponent(error)
              }, '*');
            } catch (e) {
              console.error('Cannot communicate with parent window:', e);
            }
          }
          return;
        }

        if (token && userData) {
          // Backend has already processed the OAuth and sent us the results
          try {
            const user = JSON.parse(decodeURIComponent(userData));
            
            console.log('✅ Google OAuth successful, sending message to parent:', {
              user: user,
              hasToken: !!token,
              origin: window.location.origin,
              hasOpener: !!opener,
              openerClosed: opener?.closed
            });
            
            const message = {
              type: 'GOOGLE_AUTH_SUCCESS',
              user: user,
              token: token
            };
            
            // Function to send message using all available methods
            const sendMessage = () => {
              // Method 1: Use stored opener reference
              if (opener && !opener.closed) {
                try {
                  opener.postMessage(message, parentOrigin);
                  console.log('✅ Message sent with opener to origin:', parentOrigin);
                } catch (e) {
                  try {
                    opener.postMessage(message, '*');
                    console.log('✅ Message sent with opener wildcard');
                  } catch (e2) {
                    console.warn('⚠️ Failed to send with opener:', e2);
                  }
                }
              }
              
              // Method 2: Try window.opener (in case it's still available)
              if (window.opener && !window.opener.closed) {
                try {
                  window.opener.postMessage(message, window.location.origin);
                  console.log('✅ Message sent with window.opener to origin');
                } catch (e) {
                  try {
                    window.opener.postMessage(message, '*');
                    console.log('✅ Message sent with window.opener wildcard');
                  } catch (e2) {
                    console.warn('⚠️ Failed to send with window.opener:', e2);
                  }
                }
              }
              
              // Method 3: Try window.parent as fallback
              try {
                window.parent.postMessage(message, '*');
                console.log('✅ Message sent with window.parent');
              } catch (e) {
                console.warn('⚠️ Failed to send with window.parent:', e);
              }
            };
            
            // Send message immediately
            sendMessage();
            
            // Send message multiple times to ensure it's received
            const messageInterval = setInterval(() => {
              sendMessage();
            }, 200);
            
            // Stop sending after 2 seconds
            setTimeout(() => {
              clearInterval(messageInterval);
            }, 2000);
            
            // Also store in localStorage as backup
            try {
              localStorage.setItem('googleAuthResult', JSON.stringify(message));
              localStorage.setItem('googleAuthTimestamp', Date.now().toString());
              console.log('✅ Message stored in localStorage as backup');
            } catch (e) {
              console.warn('⚠️ Failed to store in localStorage:', e);
            }
            
            // Try direct redirect fallback as well
            try {
              if (opener && !opener.closed) {
                // Store auth data in parent's localStorage
                opener.localStorage.setItem('token', token);
                opener.localStorage.setItem('googleAuthUser', JSON.stringify(user));
                opener.localStorage.setItem('googleAuthRedirect', 'true');
                console.log('✅ Stored auth data in parent localStorage');
              } else if (window.opener && !window.opener.closed) {
                window.opener.localStorage.setItem('token', token);
                window.opener.localStorage.setItem('googleAuthUser', JSON.stringify(user));
                window.opener.localStorage.setItem('googleAuthRedirect', 'true');
                console.log('✅ Stored auth data in parent localStorage');
              }
            } catch (e) {
              console.warn('⚠️ Could not store in parent localStorage (cross-origin):', e);
            }
            
            setStatus('success');
            
            // Close popup after a delay to ensure message is sent
            // Try multiple times to close the window
            let closeAttempts = 0;
            const tryCloseWindow = () => {
              closeAttempts++;
              try {
                // Try to close the window
                if (window.opener && !window.opener.closed) {
                  window.close();
                } else if (opener && !opener.closed) {
                  window.close();
                } else {
                  // If opener is closed/null, try closing anyway
                  // Some browsers allow this if window was opened by script
                  window.close();
                }
                
                // If window didn't close after 3 seconds, try redirecting parent
                if (closeAttempts < 3) {
                  setTimeout(tryCloseWindow, 1000);
                } else {
                  // Last resort: try to redirect parent window directly
                  try {
                    if (opener && !opener.closed) {
                      opener.location.href = '/';
                    } else if (window.opener && !window.opener.closed) {
                      window.opener.location.href = '/';
                    }
                  } catch (e) {
                    console.warn('Could not redirect parent window:', e);
                  }
                }
              } catch (e) {
                console.warn('Error closing window:', e);
                if (closeAttempts < 3) {
                  setTimeout(tryCloseWindow, 1000);
                }
              }
            };
            
            // Start trying to close after a short delay
            setTimeout(tryCloseWindow, 500);
            return;
          } catch (parseError) {
            console.error('❌ Failed to parse user data:', parseError);
            setError('Failed to parse authentication data');
            setStatus('error');
            
            if (opener && !opener.closed) {
              try {
                opener.postMessage({
                  type: 'GOOGLE_AUTH_ERROR',
                  error: 'Failed to parse authentication data'
                }, parentOrigin);
              } catch (e) {
                opener.postMessage({
                  type: 'GOOGLE_AUTH_ERROR',
                  error: 'Failed to parse authentication data'
                }, '*');
              }
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
            
            const message = {
              type: 'GOOGLE_AUTH_SUCCESS',
              user: data.user,
              token: data.token
            };
            
            // Try multiple methods to send message
            let messageSent = false;
            
            if (opener && !opener.closed) {
              try {
                opener.postMessage(message, parentOrigin);
                messageSent = true;
              } catch (e) {
                try {
                  opener.postMessage(message, '*');
                  messageSent = true;
                } catch (e2) {
                  console.error('Failed to send with opener:', e2);
                }
              }
            }
            
            if (!messageSent && window.opener && !window.opener.closed) {
              try {
                window.opener.postMessage(message, window.location.origin);
                messageSent = true;
              } catch (e) {
                try {
                  window.opener.postMessage(message, '*');
                  messageSent = true;
                } catch (e2) {
                  console.error('Failed to send with window.opener:', e2);
                }
              }
            }
            
            if (!messageSent) {
              try {
                localStorage.setItem('googleAuthResult', JSON.stringify(message));
                localStorage.setItem('googleAuthTimestamp', Date.now().toString());
                messageSent = true;
              } catch (e) {
                console.error('Failed to store in localStorage:', e);
              }
            }
            
            setStatus('success');
            
            // Close popup after a delay to ensure message is sent
            // Try multiple times to close the window
            let closeAttempts = 0;
            const tryCloseWindow = () => {
              closeAttempts++;
              try {
                // Try to close the window
                if (window.opener && !window.opener.closed) {
                  window.close();
                } else if (opener && !opener.closed) {
                  window.close();
                } else {
                  // If opener is closed/null, try closing anyway
                  // Some browsers allow this if window was opened by script
                  window.close();
                }
                
                // If window didn't close after 3 seconds, try redirecting parent
                if (closeAttempts < 3) {
                  setTimeout(tryCloseWindow, 1000);
                } else {
                  // Last resort: try to redirect parent window directly
                  try {
                    if (opener && !opener.closed) {
                      opener.location.href = '/';
                    } else if (window.opener && !window.opener.closed) {
                      window.opener.location.href = '/';
                    }
                  } catch (e) {
                    console.warn('Could not redirect parent window:', e);
                  }
                }
              } catch (e) {
                console.warn('Error closing window:', e);
                if (closeAttempts < 3) {
                  setTimeout(tryCloseWindow, 1000);
                }
              }
            };
            
            // Start trying to close after a short delay
            setTimeout(tryCloseWindow, 500);
          } else {
            // Send error message to parent window
            const errorMessage = {
              type: 'GOOGLE_AUTH_ERROR',
              error: data.error || 'Authentication failed'
            };
            
            if (opener && !opener.closed) {
              try {
                opener.postMessage(errorMessage, parentOrigin);
              } catch (e) {
                opener.postMessage(errorMessage, '*');
              }
            } else if (window.opener && !window.opener.closed) {
              try {
                window.opener.postMessage(errorMessage, window.location.origin);
              } catch (e) {
                window.opener.postMessage(errorMessage, '*');
              }
            }
            
            setError(data.error || 'Google authentication failed');
            setStatus('error');
          }
        } else {
          setError('No authentication data received');
          setStatus('error');
          
          // Send error message to parent window
          const errorMessage = {
            type: 'GOOGLE_AUTH_ERROR',
            error: 'No authentication data received'
          };
          
          if (opener && !opener.closed) {
            try {
              opener.postMessage(errorMessage, parentOrigin);
            } catch (e) {
              opener.postMessage(errorMessage, '*');
            }
          } else if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(errorMessage, window.location.origin);
            } catch (e) {
              window.opener.postMessage(errorMessage, '*');
            }
          }
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
          <button
            onClick={() => {
              try {
                window.close();
              } catch (e) {
                // If window.close() fails, try redirecting parent
                try {
                  if (window.opener && !window.opener.closed) {
                    window.opener.location.href = '/';
                  }
                } catch (e2) {
                  console.error('Could not close window or redirect parent:', e2);
                }
              }
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#39FF14',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close Window
          </button>
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
