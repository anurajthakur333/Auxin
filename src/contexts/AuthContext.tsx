import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../lib/apiConfig';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for Google auth redirect fallback (from direct redirect method)
    const googleAuthRedirect = localStorage.getItem('googleAuthRedirect');
    if (googleAuthRedirect === 'true') {
      const storedUser = localStorage.getItem('googleAuthUser');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          const user = {
            id: userData.id || userData._id,
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar,
            isEmailVerified: userData.isEmailVerified !== undefined 
              ? userData.isEmailVerified 
              : true
          };
          
          console.log('✅ Processing Google auth redirect fallback:', user);
          setUser(user);
          
          // Clean up redirect flags
          localStorage.removeItem('googleAuthRedirect');
          localStorage.removeItem('googleAuthUser');
          
          // Trigger navigation event
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('googleAuthSuccess', { 
              detail: { user: user } 
            }));
          }, 100);
          
          setLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse stored Google auth user:', e);
          localStorage.removeItem('googleAuthRedirect');
          localStorage.removeItem('googleAuthUser');
        }
      }
    }
    
    // Check for existing session on app load
    // First check localStorage (Remember Me was checked), then sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          console.error('Response text:', responseText);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          return;
        }
        setUser(data.user);
        // Token is already stored in the correct storage, no need to re-store
      } else {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const responseText = await response.text();
      
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        console.error('Response status:', response.status);
        console.error('Response text:', responseText);
        return { success: false, error: 'Server error. Please try again.' };
      }

      if (response.ok) {
        setUser(data.user);
        // Store token based on Remember Me preference
        if (rememberMe) {
          localStorage.setItem('token', data.token);
          sessionStorage.removeItem('token'); // Clear the other storage
        } else {
          sessionStorage.setItem('token', data.token);
          localStorage.removeItem('token'); // Clear the other storage
        }
        return { success: true };
      } else {
        console.error('Login failed:', data.error);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      let data;
      const responseText = await response.text();
      
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        console.error('Response status:', response.status);
        console.error('Response text:', responseText);
        return { success: false, error: 'Server error. Please try again.' };
      }

      if (response.ok) {
        // Don't set user or token on signup - user needs to verify email first
        // Only store email temporarily for verification
        if (data.user && !data.user.isEmailVerified) {
          // Don't set user state or token - wait for email verification
          return { success: true };
        } else {
          // If somehow email is already verified, set user normally
          setUser(data.user);
          localStorage.setItem('token', data.token);
          return { success: true };
        }
      } else {
        console.error('Signup failed:', data.error);
        return { success: false, error: data.error || 'Failed to create account' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (): Promise<void> => {
    try {
      console.log("in google service<<<<<<<<<<<<<<<<<<<<<<<<")
      setLoading(true);
      
      // Redirect to backend OAuth endpoint instead of getting URL from backend
      // The backend will handle the redirect to Google and the callback
      const backendOAuthUrl = `${API_BASE_URL}/auth/google`;
      
      console.log('🔍 Opening Google OAuth popup:', backendOAuthUrl);
      
      // Open backend OAuth endpoint in popup
      const popup = window.open(
        backendOAuthUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        setLoading(false);
        console.error('❌ Popup blocked or failed to open');
        return;
      }

      // Listen for the popup to close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          console.log('🔍 Popup closed');
          clearInterval(checkClosed);
          // Don't set loading to false here - wait for message or timeout
        }
      }, 500);

      // Also check localStorage for fallback communication
      const checkLocalStorage = setInterval(() => {
        try {
          const storedResult = localStorage.getItem('googleAuthResult');
          const timestamp = localStorage.getItem('googleAuthTimestamp');
          
          if (storedResult && timestamp) {
            const timeDiff = Date.now() - parseInt(timestamp);
            // Only process if stored within last 10 seconds
            if (timeDiff < 10000) {
              const message = JSON.parse(storedResult);
              console.log('✅ Found Google auth result in localStorage:', message);
              
              // Process the message
              if (message.type === 'GOOGLE_AUTH_SUCCESS' && message.user && message.token) {
                const userData = {
                  id: message.user.id || message.user._id,
                  email: message.user.email,
                  name: message.user.name,
                  avatar: message.user.avatar,
                  isEmailVerified: message.user.isEmailVerified !== undefined 
                    ? message.user.isEmailVerified 
                    : true
                };
                const token = message.token;
                
                setUser(userData);
                localStorage.setItem('token', token);
                sessionStorage.removeItem('token');
                
                // Clean up
                localStorage.removeItem('googleAuthResult');
                localStorage.removeItem('googleAuthTimestamp');
                
                clearInterval(checkLocalStorage);
                clearInterval(checkClosed);
                clearTimeout(timeout);
                window.removeEventListener('message', messageListener);
                setLoading(false);
                
                if (popup && !popup.closed) {
                  setTimeout(() => popup.close(), 100);
                }
                
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('googleAuthSuccess', { 
                    detail: { user: userData } 
                  }));
                }, 50);
              }
            } else {
              // Stale data, remove it
              localStorage.removeItem('googleAuthResult');
              localStorage.removeItem('googleAuthTimestamp');
            }
          }
        } catch (e) {
          console.error('Error checking localStorage:', e);
        }
      }, 500);

      // Timeout after 5 minutes
      const timeout = setTimeout(() => {
        console.error('❌ Google OAuth timeout');
        clearInterval(checkClosed);
        clearInterval(checkLocalStorage);
        window.removeEventListener('message', messageListener);
        setLoading(false);
        
        // Clean up localStorage
        localStorage.removeItem('googleAuthResult');
        localStorage.removeItem('googleAuthTimestamp');
        
        if (popup && !popup.closed) {
          popup.close();
        }
      }, 5 * 60 * 1000);
      
      // Listen for message from popup (sent by GoogleCallback component)
      const messageListener = (event: MessageEvent) => {
        console.log('🔍 Message received:', {
          origin: event.origin,
          expectedOrigin: window.location.origin,
          type: event.data?.type,
          hasData: !!event.data,
          data: event.data
        });

        // Additional check: only process messages with the expected type
        if (!event.data || typeof event.data !== 'object' || !event.data.type) {
          console.warn('⚠️ Invalid message format:', event.data);
          return;
        }
        
        // Only process Google auth messages
        if (event.data.type !== 'GOOGLE_AUTH_SUCCESS' && event.data.type !== 'GOOGLE_AUTH_ERROR') {
          console.warn('⚠️ Ignoring message with unexpected type:', event.data.type);
          return;
        }
        
        // For Google OAuth, we're more lenient with origin checking
        // The popup redirects through backend, so origin might vary
        // We trust messages that have the correct structure and type
        const currentOrigin = window.location.origin;
        const isSameOrigin = event.origin === currentOrigin;
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           event.origin.includes('localhost') ||
                           event.origin.includes('127.0.0.1');
        
        // Allow same origin, localhost, or if it's a Google auth message with valid structure
        const isValidMessage = isSameOrigin || isLocalhost || 
                              (event.data.type && event.data.user && event.data.token);
        
        if (!isValidMessage) {
          console.warn('⚠️ Message from potentially unauthorized origin:', {
            origin: event.origin,
            expected: currentOrigin,
            isLocalhost: isLocalhost,
            hasValidStructure: !!(event.data.type && event.data.user && event.data.token)
          });
          // Still process if it has valid structure (for cross-origin scenarios)
          if (!(event.data.type && event.data.user && event.data.token)) {
            return;
          }
        }
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          console.log('✅ Google auth success, setting user:', event.data.user);
          
          // Validate user data structure
          if (!event.data.user || !event.data.token) {
            console.error('❌ Invalid user data or token in message');
            setLoading(false);
            clearInterval(checkClosed);
            clearTimeout(timeout);
            window.removeEventListener('message', messageListener);
            return;
          }
          
          // Set user and token
          const userData = {
            id: event.data.user.id || event.data.user._id,
            email: event.data.user.email,
            name: event.data.user.name,
            avatar: event.data.user.avatar,
            isEmailVerified: event.data.user.isEmailVerified !== undefined 
              ? event.data.user.isEmailVerified 
              : true // Google OAuth users are auto-verified
          };
          const token = event.data.token;
          
          console.log('✅ Setting user state:', userData);
          setUser(userData);
          localStorage.setItem('token', token);
          
          // Clear session storage to avoid conflicts
          sessionStorage.removeItem('token');
          
          setLoading(false);
          clearInterval(checkClosed);
          clearTimeout(timeout);
          window.removeEventListener('message', messageListener);
          
          // Close popup if still open
          if (popup && !popup.closed) {
            setTimeout(() => {
              if (popup && !popup.closed) {
                popup.close();
              }
            }, 100);
          }
          
          console.log('✅ Google login completed successfully');
          console.log('✅ User state updated, token stored');
          console.log('✅ Current user state:', userData);
          
          // Trigger a custom event for navigation (components can listen to this)
          // Use a small delay to ensure state is set first
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('googleAuthSuccess', { 
              detail: { user: userData } 
            }));
            console.log('✅ Google auth success event dispatched');
          }, 50);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          console.error('❌ Google auth error:', event.data.error);
          setLoading(false);
          clearInterval(checkClosed);
          clearInterval(checkLocalStorage);
          clearTimeout(timeout);
          window.removeEventListener('message', messageListener);
          
          // Clean up localStorage
          localStorage.removeItem('googleAuthResult');
          localStorage.removeItem('googleAuthTimestamp');
          
          // Close popup if still open
          if (popup && !popup.closed) {
            popup.close();
          }
        }
      };

      window.addEventListener('message', messageListener);
      
    } catch (error) {
      console.error('❌ Google login error:', error);
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    googleLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
