
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  userEmail: string | null; 
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
          setUserEmail(email);
          setIsAuthenticated(true);
        }
      }
    };

    checkAuth();
  }, []);

  // Login function with enhanced error handling
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Check if email exists in localStorage (simulating user lookup)
      const users = getAllUsers();
      const existingUser = users.find(u => u.email === email);
      
      if (!existingUser) {
        throw new Error('User not found. Please check your email or register.');
      }

      // In a real app, you'd check password hash. This is just a simulation.
      // Simulate a failed password (just for demonstration purposes)
      if (password === 'wrongpassword') {
        throw new Error('Incorrect password. Please try again.');
      }
      
      // Simulate API call latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store auth state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', existingUser.email);
      localStorage.setItem('userName', existingUser.name || '');
      localStorage.setItem('userId', existingUser.id);
      localStorage.setItem('userCreatedAt', existingUser.created_at || new Date().toISOString());
      
      const userData: User = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        created_at: existingUser.created_at,
        updated_at: new Date().toISOString()
      };
      
      setUser(userData);
      setUserEmail(email);
      setIsAuthenticated(true);
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Helper function to get all users from localStorage
  const getAllUsers = (): User[] => {
    const usersJSON = localStorage.getItem('registeredUsers');
    return usersJSON ? JSON.parse(usersJSON) : [];
  };

  // Registration function with improved error handling
  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      // Check if email is already registered
      const users = getAllUsers();
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        throw new Error('Email already registered. Please use a different email.');
      }
      
      // Simulate API call latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userId = `user_${Date.now()}`;
      const now = new Date().toISOString();
      
      const newUser: User = {
        id: userId,
        email,
        name,
        created_at: now,
        updated_at: now
      };
      
      // Save user to "database" (localStorage)
      const updatedUsers = [...users, newUser];
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created! Please log in.',
      });
      
      // Important: We don't automatically log them in or navigate from here anymore
      // The Register component will handle navigation to login page
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'There was a problem creating your account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    // Clear auth state
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userCreatedAt');
    
    setIsAuthenticated(false);
    setUser(null);
    setUserEmail(null);
    
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
      userEmail,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
