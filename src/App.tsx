// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileMenuProvider, useProfileMenu } from './contexts/ProfileMenuContext';
import ProfileMenu from './components/ProfileMenu';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Meeting from './pages/Meeting';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import GoogleCallback from './pages/GoogleCallback';
import SplinePage from './pages/Spline';
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
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
          </Routes>
          <ProfileMenuWrapper />
        </Router>
      </ProfileMenuProvider>
    </AuthProvider>
  );
}