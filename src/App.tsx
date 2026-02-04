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
import AdminLogin from './pages/admin/AdminLogin';
import Admin from './pages/admin/Admin';
import ClientProjectsPage from './pages/admin/ClientProjectsPage';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GoogleCallback from './pages/GoogleCallback';
import SplinePage from './pages/Spline';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import InvoiceView from './pages/InvoiceView';
import ProtectedRoute from './components/ProtectedRoute';
import ClientProtectedRoute from './components/ClientProtectedRoute';
import EmployeeProtectedRoute from './components/EmployeeProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import AuthNavigationHandler from './components/AuthNavigationHandler';
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
          <AuthNavigationHandler />
          <Routes>
            <Route path="/" element={<Home />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Admin />} />
            <Route path="/admin/client-projects/:clientId" element={<ClientProjectsPage />} />
            <Route path="/employee/login" element={<EmployeeLogin />} />
            <Route 
              path="/employee/dashboard" 
              element={
                <EmployeeProtectedRoute>
                  <EmployeeDashboard />
                </EmployeeProtectedRoute>
              } 
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/spline" element={<SplinePage />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
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
              path="/dashboard" 
              element={
                <ClientProtectedRoute>
                  <Dashboard />
                </ClientProtectedRoute>
              } 
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/invoice/:invoiceId" 
              element={
                <ClientProtectedRoute>
                  <InvoiceView />
                </ClientProtectedRoute>
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