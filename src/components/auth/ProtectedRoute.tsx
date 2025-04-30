
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, session, user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Only show the toast if we're sure authentication has failed after loading
    if (!authLoading && !isAuthenticated && showToast) {
      const pageName = location.pathname.replace('/', '');
      const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      
      toast({
        title: "Authentication Required",
        description: `Please login to access the ${formattedPageName} page`,
        variant: "destructive",
      });
      setShowToast(false); // Reset the toast flag
    }
  }, [authLoading, isAuthenticated, location.pathname, toast, showToast]);

  // Show loading state while checking auth
  if (authLoading) {
    return null; // or a loading spinner component
  }

  // Check if we have a valid session
  if (!isAuthenticated || !session?.access_token) {
    setShowToast(true); // Set flag to show toast after redirect
    // Redirect to login page if user is not authenticated, and pass the current location
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
