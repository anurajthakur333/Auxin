import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ClientProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route that requires the user to be both:
 * 1. Logged in with verified email
 * 2. A client (has a clientCode)
 * 
 * Regular users without clientCode cannot access the dashboard
 */
const ClientProtectedRoute: React.FC<ClientProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000',
        color: '#39FF14',
        fontFamily: 'Aeonik, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in but email not verified, force verification flow
  if (user && !user.isEmailVerified) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email)}`} replace />;
  }

  // Check if user is a client (has clientCode)
  if (!user.clientCode) {
    // User is not a client - show access denied page
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000',
        color: '#FFF',
        fontFamily: 'Aeonik, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: 'clamp(40px, 8vw, 80px)', 
          color: '#FF6B6B',
          marginBottom: '20px',
          fontWeight: 600,
          letterSpacing: '-2px'
        }}>
          ACCESS DENIED
        </div>
        <div style={{ 
          fontSize: 'clamp(14px, 2vw, 18px)', 
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '30px',
          maxWidth: '500px',
          lineHeight: 1.6
        }}>
          You don't have client access to this dashboard. 
          <br />
          Please contact the administrator if you believe this is an error.
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: 'rgba(255, 255, 255, 0.4)',
          marginBottom: '30px'
        }}>
          Logged in as: {user.email}
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid #39FF14',
              color: '#39FF14',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'Aeonik, sans-serif',
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            GO HOME
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ClientProtectedRoute;
