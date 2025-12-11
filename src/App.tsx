// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileMenuProvider, useProfileMenu } from './contexts/ProfileMenuContext';
import ProfileMenu from './components/ProfileMenu';
import Home from './pages/Home';
import VerifyEmail from './pages/VerifyEmail';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Meeting from './pages/Meeting';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GoogleCallback from './pages/GoogleCallback';
import SplinePage from './pages/Spline';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './contexts/AuthContext';
import "./styles/fonts.css";
import "./styles/Main.css";

// Component to render ProfileMenu at root level
const ProfileMenuWrapper = () => {
  const { isProfileMenuOpen, closeProfileMenu } = useProfileMenu();
  const { logout } = useAuth();
  
  return (
    <ProfileMenu 
      isOpen={isProfileMenuOpen} 
      onClose={closeProfileMenu}
      onLogout={logout}
    />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProfileMenuProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/spline" element={<SplinePage />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route 
              path="/meeting" 
              element={
                <ProtectedRoute>
                  <Meeting />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment/success" 
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment/cancel" 
              element={
                <ProtectedRoute>
                  <PaymentCancel />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ProfileMenuWrapper />
        </Router>
      </ProfileMenuProvider>
    </AuthProvider>
  );
}