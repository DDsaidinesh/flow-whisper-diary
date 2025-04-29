
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  name: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if the user is already authenticated on component mount
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true';
      if (auth) {
        const email = localStorage.getItem('userEmail');
        const name = localStorage.getItem('userName');
        const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
        
        if (email) {
          setUser({
            id: userId,
            email,
            name,
            created_at: localStorage.getItem('userCreatedAt') || new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setIsAuthenticated(true);
        }
      }
    };

    checkAuth();
  }, []);

  // Temporary login function (to be replaced with real auth later)
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userId = `user_${Date.now()}`;
      const now = new Date().toISOString();
      
      // Store auth state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userCreatedAt', now);
      
      const userData: User = {
        id: userId,
        email,
        name: null,
        created_at: now,
        updated_at: now
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
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
      
      const userId = `user_${Date.now()}`;
      const now = new Date().toISOString();
      
      // Store auth state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userCreatedAt', now);
      
      const userData: User = {
        id: userId,
        email,
        name,
        created_at: now,
        updated_at: now
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
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
    localStorage.removeItem('userId');
    localStorage.removeItem('userCreatedAt');
    
    setIsAuthenticated(false);
    setUser(null);
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
