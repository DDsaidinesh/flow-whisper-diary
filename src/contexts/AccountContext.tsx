import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the account type interface
export interface AccountType {
  id: string;
  user_id: string | null;
  name: string;
  category: 'asset' | 'liability' | 'equity';
  description?: string;
  icon?: string;
  color?: string;
  is_default: boolean;
  is_system: boolean;
  affects_net_worth: boolean;
  created_at: string;
  updated_at: string;
}

// Define the account interface
export interface Account {
  id: string;
  user_id: string;
  account_type_id: string;
  name: string;
  balance: number;
  initial_balance: number;
  currency: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  color?: string;
  icon?: string;
  account_number?: string;
  created_at: string;
  updated_at: string;
  account_type?: AccountType; // Joined data
}

// Define the context interface
interface AccountsContextType {
  accounts: Account[];
  accountTypes: AccountType[];
  isLoading: boolean;
  
  // Account operations
  addAccount: (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'balance'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  getAccountById: (id: string) => Account | undefined;
  getAccountsByType: (typeId: string) => Account[];
  
  // Account type operations
  addAccountType: (accountType: Omit<AccountType, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_system'>) => Promise<void>;
  updateAccountType: (id: string, updates: Partial<AccountType>) => Promise<void>;
  deleteAccountType: (id: string) => Promise<void>;
  
  // Utility functions
  calculateNetWorth: () => number;
  getAssetAccounts: () => Account[];
  getLiabilityAccounts: () => Account[];
  refreshAccounts: () => Promise<void>;
}

// Create the context
const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

// Create a hook to use the context
export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};

// Define the provider props
interface AccountsProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AccountsProvider: React.FC<AccountsProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Load account types from Supabase
  const loadAccountTypes = async () => {
    if (!isAuthenticated || !user) {
      setAccountTypes([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('account_types')
        .select('*')
        .or(`user_id.eq.${user.id},is_system.eq.true`)
        .order('is_system', { ascending: false })
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        setAccountTypes(data as AccountType[]);
      }
    } catch (error: any) {
      console.error('Error loading account types:', error.message);
      toast({
        title: 'Error loading account types',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Load accounts from Supabase
  const loadAccounts = async () => {
    if (!isAuthenticated || !user) {
      setAccounts([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          account_types (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        const processedAccounts = data.map(account => ({
          ...account,
          account_type: account.account_types,
        })) as Account[];
        
        setAccounts(processedAccounts);
      }
    } catch (error: any) {
      console.error('Error loading accounts:', error.message);
      toast({
        title: 'Error loading accounts',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      if (isAuthenticated && user) {
        await Promise.all([
          loadAccountTypes(),
          loadAccounts()
        ]);
      }
      setIsLoading(false);
    };

    initializeData();
  }, [isAuthenticated, user]);

  // Refresh all accounts data
  const refreshAccounts = async () => {
    await Promise.all([loadAccounts(), loadAccountTypes()]);
  };

  // Add a new account
  const addAccount = async (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'balance'>) => {
    if (!isAuthenticated || !user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...account,
          user_id: user.id,
          balance: account.initial_balance,
        })
        .select(`
          *,
          account_types (*)
        `)
        .single();
        
      if (error) throw error;
      
      const newAccount = {
        ...data,
        account_type: data.account_types,
      } as Account;
      
      setAccounts(prev => [newAccount, ...prev]);
      
      toast({
        title: 'Account created',
        description: `${account.name} has been created successfully`,
      });
    } catch (error: any) {
      console.error('Error adding account:', error.message);
      toast({
        title: 'Error creating account',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Update an account
  const updateAccount = async (id: string, updates: Partial<Account>) => {
    if (!isAuthenticated || !user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          account_types (*)
        `)
        .single();
        
      if (error) throw error;
      
      const updatedAccount = {
        ...data,
        account_type: data.account_types,
      } as Account;
      
      setAccounts(prev => prev.map(account => 
        account.id === id ? updatedAccount : account
      ));
      
      toast({
        title: 'Account updated',
        description: 'Account has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating account:', error.message);
      toast({
        title: 'Error updating account',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Delete an account
  const deleteAccount = async (id: string) => {
    if (!isAuthenticated || !user) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setAccounts(prev => prev.filter(account => account.id !== id));
      
      toast({
        title: 'Account deleted',
        description: 'Account has been deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting account:', error.message);
      toast({
        title: 'Error deleting account',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Add a new account type
  const addAccountType = async (accountType: Omit<AccountType, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_system'>) => {
    if (!isAuthenticated || !user) return;

    try {
      const { data, error } = await supabase
        .from('account_types')
        .insert({
          ...accountType,
          user_id: user.id,
          is_system: false,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setAccountTypes(prev => [...prev, data as AccountType]);
      
      toast({
        title: 'Account type created',
        description: `${accountType.name} account type has been created`,
      });
    } catch (error: any) {
      console.error('Error adding account type:', error.message);
      toast({
        title: 'Error creating account type',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Update an account type
  const updateAccountType = async (id: string, updates: Partial<AccountType>) => {
    if (!isAuthenticated || !user) return;

    try {
      const { data, error } = await supabase
        .from('account_types')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setAccountTypes(prev => prev.map(type => 
        type.id === id ? data as AccountType : type
      ));
      
      toast({
        title: 'Account type updated',
        description: 'Account type has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating account type:', error.message);
      toast({
        title: 'Error updating account type',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Delete an account type
  const deleteAccountType = async (id: string) => {
    if (!isAuthenticated || !user) return;

    try {
      const { error } = await supabase
        .from('account_types')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_system', false);
        
      if (error) throw error;
      
      setAccountTypes(prev => prev.filter(type => type.id !== id));
      
      toast({
        title: 'Account type deleted',
        description: 'Account type has been deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting account type:', error.message);
      toast({
        title: 'Error deleting account type',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Utility functions
  const getAccountById = (id: string) => {
    return accounts.find(account => account.id === id);
  };

  const getAccountsByType = (typeId: string) => {
    return accounts.filter(account => account.account_type_id === typeId);
  };

  const calculateNetWorth = () => {
    return accounts.reduce((total, account) => {
      if (!account.account_type) return total;
      
      // Only include accounts that affect net worth
      if (!account.account_type.affects_net_worth) return total;
      
      if (account.account_type.category === 'asset') {
        return total + account.balance;
      } else if (account.account_type.category === 'liability') {
        return total - account.balance;
      }
      
      return total;
    }, 0);
  };

  const getAssetAccounts = () => {
    return accounts.filter(account => account.account_type?.category === 'asset');
  };

  const getLiabilityAccounts = () => {
    return accounts.filter(account => account.account_type?.category === 'liability');
  };

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        accountTypes,
        isLoading,
        addAccount,
        updateAccount,
        deleteAccount,
        getAccountById,
        getAccountsByType,
        addAccountType,
        updateAccountType,
        deleteAccountType,
        calculateNetWorth,
        getAssetAccounts,
        getLiabilityAccounts,
        refreshAccounts,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
};
