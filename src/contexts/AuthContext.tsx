
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userEmail: string | null; 
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    setIsLoading(true);
    
    // Check for existing session first
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
          throw error;
        }

        if (currentSession) {
          console.log('Initial session found:', currentSession.user?.email);
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          setUserEmail(currentSession.user?.email ?? null);
        } else {
          console.log('No active session found');
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          setUserEmail(null);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        // Reset auth state on error
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        setUserEmail(null);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          setUserEmail(currentSession.user?.email ?? null);
        } else {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          setUserEmail(null);
        }

        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          navigate('/');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
      }
    );

    initializeAuth();

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Login function with enhanced error handling
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Session is automatically managed by Supabase
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred';
      
      // Handle specific error cases
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Incorrect email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email before logging in.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  // Registration function with improved error handling
  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Success - but let the component handle navigation and toasts
      // This allows Register component to control the flow
      
    } catch (error: any) {
      let errorMessage = 'There was a problem creating your account';
      
      if (error.message) {
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please use a different email.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear any local auth state
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      setUserEmail(null);
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message || 'An error occurred during logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      userEmail,
      session,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
