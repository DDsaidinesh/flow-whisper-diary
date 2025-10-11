import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the transaction types
export type TransactionType = 'income' | 'expense' | 'transfer';

// Define category structure to match database
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  user_id?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

// Define account structure to match database
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
}

// Define the transaction interface to match database
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id: string;
  category?: string; // For compatibility with existing code
  type: TransactionType;
  date: string;
  from_account_id?: string;
  to_account_id?: string;
  created_at: string;
  updated_at: string;
}

// Define the migration result interface
interface MigrationResult {
  success: boolean;
  migrated_count: number;
  errors: Array<{
    transaction: any;
    error: string;
  }>;
}

// Define categories for each transaction type
export const CATEGORIES: Record<TransactionType, string[]> = {
  income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'],
  expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Education', 'Personal', 'Other'],
  transfer: ['Account Transfer'] // Transfers don't really need multiple categories
};

// Define the default categories
export const DEFAULT_CATEGORIES: Category[] = [
  // Income categories
  { id: 'inc_salary', name: 'Salary', type: 'income', is_default: true, color: '#4caf50' },
  { id: 'inc_freelance', name: 'Freelance', type: 'income', is_default: true, color: '#8bc34a' },
  { id: 'inc_investments', name: 'Investments', type: 'income', is_default: true, color: '#cddc39' },
  { id: 'inc_gifts', name: 'Gifts', type: 'income', is_default: true, color: '#ffeb3b' },
  { id: 'inc_other', name: 'Other', type: 'income', is_default: true, color: '#ffc107' },
  
  // Expense categories
  { id: 'exp_food', name: 'Food', type: 'expense', is_default: true, color: '#f44336' },
  { id: 'exp_housing', name: 'Housing', type: 'expense', is_default: true, color: '#e91e63' },
  { id: 'exp_transport', name: 'Transportation', type: 'expense', is_default: true, color: '#9c27b0' },
  { id: 'exp_entertainment', name: 'Entertainment', type: 'expense', is_default: true, color: '#673ab7' },
  { id: 'exp_utilities', name: 'Utilities', type: 'expense', is_default: true, color: '#3f51b5' },
  { id: 'exp_healthcare', name: 'Healthcare', type: 'expense', is_default: true, color: '#2196f3' },
  { id: 'exp_shopping', name: 'Shopping', type: 'expense', is_default: true, color: '#03a9f4' },
  { id: 'exp_education', name: 'Education', type: 'expense', is_default: true, color: '#00bcd4' },
  { id: 'exp_personal', name: 'Personal', type: 'expense', is_default: true, color: '#009688' },
  { id: 'exp_other', name: 'Other', type: 'expense', is_default: true, color: '#607d8b' },
];

  // Define the context interface
interface MoneyFlowContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  defaultAccount: Account | null;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addTransfer: (fromAccountId: string, toAccountId: string, amount: number, description: string, date: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearAllTransactions: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id' | 'is_default'>) => Promise<void>;
  getBalance: () => number;
  getIncome: () => number;
  getExpenses: () => number;
  getCategoryTotals: () => Record<string, number>;
  migrateLocalData: () => Promise<void>;
  isLoading: boolean;
}

// Create the context
const MoneyFlowContext = createContext<MoneyFlowContextType | undefined>(undefined);

// Create a hook to use the context
export const useMoneyFlow = () => {
  const context = useContext(MoneyFlowContext);
  if (context === undefined) {
    throw new Error('useMoneyFlow must be used within a MoneyFlowProvider');
  }
  return context;
};

// Define the provider props
interface MoneyFlowProviderProps {
  children: ReactNode;
}

// Create the provider component
export const MoneyFlowProvider: React.FC<MoneyFlowProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [defaultAccount, setDefaultAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Load accounts from Supabase
  useEffect(() => {
    const loadAccounts = async () => {
      if (!isAuthenticated || !user) {
        setAccounts([]);
        setDefaultAccount(null);
        return;
      }

      try {
        // Fetch accounts from Supabase
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setAccounts(data as Account[]);
          // Find the default account
          const defaultAcc = data.find(acc => acc.is_default) || data[0] || null;
          setDefaultAccount(defaultAcc as Account);
        }
      } catch (error: any) {
        console.error('Error loading accounts:', error.message);
        toast({
          title: 'Error loading accounts',
          description: 'Could not load your accounts. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    loadAccounts();
  }, [isAuthenticated, user, toast]);

  // Load categories from Supabase
  useEffect(() => {
    const loadCategories = async () => {
      if (!isAuthenticated || !user) {
        setCategories([]);
        return;
      }

      try {
        // Fetch categories from Supabase
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .or(`is_default.eq.true,user_id.eq.${user.id}`)
          .order('is_default', { ascending: false })
          .order('type')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setCategories(data as Category[]);
        }
      } catch (error: any) {
        console.error('Error loading categories:', error.message);
        // Fallback to local storage if Supabase fails
        const key = `moneyFlowCategories_${user.id}`;
        const savedCategories = localStorage.getItem(key);
        
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
          toast({
            title: 'Offline mode',
            description: 'Using locally stored categories due to connection issue',
            variant: 'destructive',
          });
        }
      }
    };
    
    loadCategories();
  }, [isAuthenticated, user, toast]);

  // Load transactions from Supabase
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      
      if (!isAuthenticated || !user) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch transactions from Supabase with categories
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select(`
            *,
            categories (name)
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        if (transactionsError) {
          throw transactionsError;
        }
        
        if (transactionsData) {
          // Process the fetched data to match our expected structure
          const processedTransactions = transactionsData.map(transaction => ({
            ...transaction,
            category: transaction.categories?.name || '',
          })) as Transaction[];
          
          setTransactions(processedTransactions);
        }
      } catch (error: any) {
        console.error('Error loading transactions:', error.message);
        
        // Fallback to local storage if Supabase fails
        const key = `moneyFlowTransactions_${user.id}`;
        const savedTransactions = localStorage.getItem(key);
        
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
          toast({
            title: 'Offline mode',
            description: 'Using locally stored transactions due to connection issue',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTransactions();
  }, [isAuthenticated, user, toast]);

  // Add a new transfer transaction
  const addTransfer = async (fromAccountId: string, toAccountId: string, amount: number, description: string, date: string) => {
    if (!isAuthenticated || !user) return;

    try {
      // Find or create a transfer category
      let categoryId = '';
      const transferCategory = categories.find(cat => 
        cat.name === 'Account Transfer' && cat.type === 'transfer'
      );
      
      if (transferCategory) {
        categoryId = transferCategory.id;
      } else {
        // Create transfer category
        const { data, error } = await supabase
          .from('categories')
          .insert([{
            name: 'Account Transfer',
            type: 'transfer' as any,
            user_id: user.id,
            is_default: false,
            color: '#9C27B0'
          }])
          .select('id')
          .single();
          
        if (error) throw error;
        categoryId = data.id;
      }
      
      // Insert the transfer transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount: amount,
          description: description,
          category_id: categoryId,
          type: 'transfer' as any,
          date: date,
          from_account_id: fromAccountId,
          to_account_id: toAccountId
        }])
        .select(`
          *,
          categories (name)
        `)
        .single();
        
      if (error) throw error;
      
      // Update the local state
      const newTransaction = {
        ...data,
        category: data.categories?.name || 'Account Transfer'
      } as Transaction;
      
      setTransactions(prev => [newTransaction, ...prev]);

      // Reload accounts to get updated balances after transfer
      await reloadAccounts();
      
      toast({
        title: 'Transfer completed',
        description: `₹${amount.toLocaleString('en-IN')} transferred successfully`,
      });
    } catch (error: any) {
      console.error('Error adding transfer:', error.message);
      toast({
        title: 'Error creating transfer',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!isAuthenticated || !user) return;

    try {
      // Find the category_id based on the category name
      let categoryId = transaction.category_id || '';
      
      if (!categoryId && transaction.category) {
        // Find a matching category
        const matchingCategory = categories.find(cat => 
          cat.name === transaction.category && cat.type === transaction.type
        );
        
        if (matchingCategory) {
          categoryId = matchingCategory.id;
        } else {
          // Create a new category if needed
          const { data, error } = await supabase
            .from('categories')
            .insert([{
              name: transaction.category,
              type: transaction.type as any,
              user_id: user.id,
              is_default: false
            }])
            .select('id')
            .single();
            
          if (error) throw error;
          categoryId = data.id;
        }
      }

      // Use the default account if no specific account is provided
      const fromAccountId = transaction.from_account_id || defaultAccount?.id;
      
      if (!fromAccountId) {
        throw new Error('No default account found. Please create an account first.');
      }
      
      // Insert the transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount: transaction.amount,
          description: transaction.description,
          category_id: categoryId,
          type: transaction.type as any,
          date: transaction.date,
          from_account_id: fromAccountId,
          to_account_id: transaction.to_account_id
        }])
        .select(`
          *,
          categories (name)
        `)
        .single();
        
      if (error) throw error;
      
      // Update the local state
      const newTransaction = {
        ...data,
        category: data.categories?.name || ''
      } as Transaction;
      
      setTransactions(prev => [newTransaction, ...prev]);

      // Reload accounts to get updated balances after transaction
      await reloadAccounts();
      
      toast({
        title: 'Transaction added',
        description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of ₹${transaction.amount} recorded successfully`,
      });
    } catch (error: any) {
      console.error('Error adding transaction:', error.message);
      toast({
        title: 'Error adding transaction',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Reload accounts to get updated balances
  const reloadAccounts = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
        
      if (data) {
        setAccounts(data as Account[]);
        const defaultAcc = data.find(acc => acc.is_default) || data[0] || null;
        setDefaultAccount(defaultAcc as Account);
      }
    } catch (error: any) {
      console.error('Error reloading accounts:', error.message);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    if (!isAuthenticated || !user) return;

    try {
      // Get the transaction details before deletion for balance update
      const transactionToDelete = transactions.find(t => t.id === id);
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      
      // Reload accounts to get updated balances (triggers will handle the balance update)
      if (transactionToDelete?.from_account_id || transactionToDelete?.to_account_id) {
        await reloadAccounts();
      }
      
      toast({
        title: 'Transaction deleted',
        description: 'The transaction has been successfully deleted',
      });
    } catch (error: any) {
      console.error('Error deleting transaction:', error.message);
      toast({
        title: 'Error deleting transaction',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Clear all transactions
  const clearAllTransactions = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setTransactions([]);
      
      // Reload accounts to get updated balances (triggers will handle balance updates)
      await reloadAccounts();
      
      toast({
        title: 'All transactions cleared',
        description: 'All of your transactions have been deleted',
      });
    } catch (error: any) {
      console.error('Error clearing transactions:', error.message);
      toast({
        title: 'Error clearing transactions',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Add a new category
  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'is_default'>) => {
    if (!isAuthenticated || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          type: category.type as any,
          color: category.color,
          icon: category.icon,
          user_id: user.id,
          is_default: false
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      setCategories(prev => [...prev, data as Category]);
      
      toast({
        title: 'Category added',
        description: `The category "${category.name}" has been added successfully`,
      });
    } catch (error: any) {
      console.error('Error adding category:', error.message);
      toast({
        title: 'Error adding category',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Get total balance from accounts (not just transaction calculations)
  const getBalance = () => {
    if (!isAuthenticated || !user || !defaultAccount) return 0;
    
    return defaultAccount.balance || 0;
  };

  // Get total income - filtered by current user (excludes transfers)
  const getIncome = () => {
    if (!isAuthenticated || !user) return 0;
    
    return transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  // Get total expenses - filtered by current user (excludes transfers)
  const getExpenses = () => {
    if (!isAuthenticated || !user) return 0;
    
    return transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  // Get category totals for expense categories - filtered by current user
  const getCategoryTotals = () => {
    if (!isAuthenticated || !user) return {};
    
    return transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((totals, transaction) => {
        const categoryName = transaction.category || '';
        return {
          ...totals,
          [categoryName]: (totals[categoryName] || 0) + transaction.amount,
        };
      }, {} as Record<string, number>);
  };

  // Migrate data from localStorage to Supabase
  const migrateLocalData = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const key = `moneyFlowTransactions_${user.id}`;
      const savedTransactions = localStorage.getItem(key);
      
      if (!savedTransactions) {
        toast({
          title: 'No local data',
          description: 'There is no local data to migrate',
        });
        return;
      }
      
      const localTransactions = JSON.parse(savedTransactions);
      
      // Call the migration function
      const { data, error } = await supabase
        .rpc('migrate_local_storage_data', {
          p_user_id: user.id,
          p_transactions: localTransactions
        });
        
      if (error) throw error;
      
      // Parse the result properly as MigrationResult
      const migrationResult = (data as unknown) as MigrationResult;
      
      // Show success message
      toast({
        title: 'Data migration successful',
        description: `Migrated ${migrationResult.migrated_count} transactions to the database`,
      });
      
      // Reload transactions and update account balances
      const { data: newTransactions, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
        
      if (fetchError) throw fetchError;
      
      if (newTransactions) {
        // Process the fetched data to match our expected structure
        const processedTransactions = newTransactions.map(transaction => ({
          ...transaction,
          category: transaction.categories?.name || '',
        })) as Transaction[];
        
        setTransactions(processedTransactions);
      }

      // Reload accounts to get updated balances
      await reloadAccounts();
    } catch (error: any) {
      console.error('Error migrating data:', error.message);
      toast({
        title: 'Error migrating data',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <MoneyFlowContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        defaultAccount,
        addTransaction,
        addTransfer,
        deleteTransaction,
        clearAllTransactions,
        addCategory,
        getBalance,
        getIncome,
        getExpenses,
        getCategoryTotals,
        migrateLocalData,
        isLoading,
      }}
    >
      {children}
    </MoneyFlowContext.Provider>
  );
};