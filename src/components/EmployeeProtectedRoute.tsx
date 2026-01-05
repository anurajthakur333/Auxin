import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface EmployeeProtectedRouteProps {
  children: React.ReactNode;
}

const EmployeeProtectedRoute: React.FC<EmployeeProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const employeeToken = localStorage.getItem('employeeToken');
      setIsAuthenticated(!!employeeToken);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000',
        color: '#39FF14',
        fontFamily: 'Aeonik Mono, monospace'
      }}>
        LOADING...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/employee/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default EmployeeProtectedRoute;

