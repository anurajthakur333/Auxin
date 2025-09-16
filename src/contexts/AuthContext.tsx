import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
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
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        return true;
      } else {
        console.error('Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        return true;
      } else {
        console.error('Signup failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Get Google auth URL from backend
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      if (response.ok) {
        // Open Google OAuth in popup
        const popup = window.open(
          data.authURL,
          'google-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for the popup to close and get the auth code
        const checkClosed = setInterval(async () => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setLoading(false);
            // The popup will handle the callback and redirect
          }
        }, 1000);

        // Listen for message from popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            setUser(event.data.user);
            localStorage.setItem('token', event.data.token);
            setLoading(false);
            window.removeEventListener('message', messageListener);
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            console.error('Google auth error:', event.data.error);
            setLoading(false);
            window.removeEventListener('message', messageListener);
          }
        };

        window.addEventListener('message', messageListener);
      } else {
        console.error('Failed to get Google auth URL:', data.error);
        setLoading(false);
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
