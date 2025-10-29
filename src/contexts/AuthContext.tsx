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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
    // Check for existing session on app load
    const token = localStorage.getItem('token');
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
          return;
        }
        setUser(data.user);
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
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
        localStorage.setItem('token', data.token);
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
      setLoading(true);
      
      // Redirect to backend OAuth endpoint instead of getting URL from backend
      // The backend will handle the redirect to Google and the callback
      const backendOAuthUrl = `${API_BASE_URL}/auth/google`;
      
      // Open backend OAuth endpoint in popup
      const popup = window.open(
        backendOAuthUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for the popup to close
      const checkClosed = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setLoading(false);
        }
      }, 1000);

      // Listen for message from popup (sent by GoogleCallback component)
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          setUser(event.data.user);
          localStorage.setItem('token', event.data.token);
          setLoading(false);
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          console.error('Google auth error:', event.data.error);
          setLoading(false);
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
        }
      };

      window.addEventListener('message', messageListener);
      
      // Cleanup if popup is blocked or fails to open
      if (!popup) {
        setLoading(false);
        console.error('Popup blocked or failed to open');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
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
