
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, session, isLoading: authLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (authLoading) {
    return null; // or a loading spinner component
  }

  // Check if we have a valid session
  if (!isAuthenticated || !session?.access_token) {
    // Redirect to login page if user is not authenticated, and pass the current location
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
