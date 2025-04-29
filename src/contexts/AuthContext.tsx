
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if the user is already authenticated on component mount
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true';
      const email = localStorage.getItem('userEmail');
      const name = localStorage.getItem('userName');
      
      setIsAuthenticated(auth);
      setUserEmail(email);
      setUserName(name);
    };

    checkAuth();
  }, []);

  // Temporary login function (to be replaced with real auth later)
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store auth state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      
      setIsAuthenticated(true);
      setUserEmail(email);
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Temporary registration function (to be replaced with real auth later)
  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store auth state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      
      setIsAuthenticated(true);
      setUserName(name);
      setUserEmail(email);
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created!',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'There was a problem creating your account. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserName(null);
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userEmail,
      userName,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
