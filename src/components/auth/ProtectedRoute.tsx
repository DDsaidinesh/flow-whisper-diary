
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, session } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      // Show a more specific message about the page they're trying to access
      const pageName = location.pathname.replace('/', '');
      const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      
      toast({
        title: "Authentication Required",
        description: `Please login to access the ${formattedPageName} page`,
        variant: "destructive",
      });
    }
  }, [isAuthenticated, location.pathname, toast]);

  // Check if we have a valid session
  if (!isAuthenticated || !session?.access_token) {
    // Redirect to login page if user is not authenticated, and pass the current location
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
