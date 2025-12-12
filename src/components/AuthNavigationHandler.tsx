import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Global component that handles navigation after authentication
 * This ensures users are redirected properly after Google login from any page
 */
const AuthNavigationHandler: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only handle navigation if user is logged in
    if (!user) return;

    // Don't redirect if already on a protected route or home
    const currentPath = location.pathname;
    const isAuthPage = currentPath === '/login' || currentPath === '/signup';
    const isCallbackPage = currentPath === '/auth/google/callback';
    const isProtectedRoute = currentPath.startsWith('/meeting') || 
                             currentPath.startsWith('/payment');
    const isHomePage = currentPath === '/';
    const isVerifyEmailPage = currentPath === '/verify-email';

    // Don't redirect if already on a protected route, home, or verify email page
    if (isProtectedRoute || (isHomePage && user.isEmailVerified) || isVerifyEmailPage) {
      return;
    }

    // If on auth pages and logged in, redirect to home
    if (isAuthPage && user.isEmailVerified) {
      console.log('🔍 User logged in on auth page, redirecting to home');
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
      return;
    }

    // If on callback page and logged in, redirect to home
    if (isCallbackPage && user.isEmailVerified) {
      console.log('🔍 User logged in on callback page, redirecting to home');
      navigate('/', { replace: true });
      return;
    }

    // If user is not verified, redirect to verify email (unless already there)
    if (!user.isEmailVerified && !isVerifyEmailPage) {
      console.log('🔍 User not verified, redirecting to verify email');
      navigate(`/verify-email?email=${encodeURIComponent(user.email)}`, { replace: true });
      return;
    }
  }, [user, navigate, location]);

  // Listen for Google auth success event and force navigation
  useEffect(() => {
    const handleGoogleAuthSuccess = (event: CustomEvent) => {
      console.log('🔍 Google auth success event received in navigation handler');
      const userData = event.detail?.user;
      
      if (userData) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          const currentPath = location.pathname;
          const isAuthPage = currentPath === '/login' || currentPath === '/signup';
          const isCallbackPage = currentPath === '/auth/google/callback';
          
          if (isAuthPage || isCallbackPage) {
            if (userData.isEmailVerified) {
              console.log('🔍 Navigating to home after Google login');
              navigate('/', { replace: true });
            } else {
              console.log('🔍 Navigating to verify email after Google login');
              navigate(`/verify-email?email=${encodeURIComponent(userData.email)}`, { replace: true });
            }
          }
        }, 300);
      }
    };

    window.addEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener);
    
    return () => {
      window.removeEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener);
    };
  }, [navigate, location]);

  return null; // This component doesn't render anything
};

export default AuthNavigationHandler;
