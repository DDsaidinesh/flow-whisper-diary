import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the transaction types
export type TransactionType = 'income' | 'expense';

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
  expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Education', 'Personal', 'Other']
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
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

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
          .or(`is_default.eq.true,user_id.eq.${user.id}`);
        
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
        // Fetch transactions from Supabase
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

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!isAuthenticated || !user) return;

    try {
      // Find the category_id based on the category name
      let categoryId = '';
      
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
          .insert({
            name: transaction.category,
            type: transaction.type,
            user_id: user.id,
            is_default: false
          })
          .select('id')
          .single();
          
        if (error) throw error;
        categoryId = data.id;
      }
      
      // Insert the transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: transaction.amount,
          description: transaction.description,
          category_id: categoryId,
          type: transaction.type,
          date: transaction.date
        })
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
    } catch (error: any) {
      console.error('Error adding transaction:', error.message);
      toast({
        title: 'Error adding transaction',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    if (!isAuthenticated || !user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      
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
        .insert({
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
          user_id: user.id,
          is_default: false
        })
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

  // Get total balance - filtered by current user
  const getBalance = () => {
    if (!isAuthenticated || !user) return 0;
    
    return transactions
      .reduce((total, transaction) => {
        return transaction.type === 'income'
          ? total + transaction.amount
          : total - transaction.amount;
      }, 0);
  };

  // Get total income - filtered by current user
  const getIncome = () => {
    if (!isAuthenticated || !user) return 0;
    
    return transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  // Get total expenses - filtered by current user
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
      // First cast to unknown, then to MigrationResult to ensure type safety
      const migrationResult = (data as unknown) as MigrationResult;
      
      // Show success message
      toast({
        title: 'Data migration successful',
        description: `Migrated ${migrationResult.migrated_count} transactions to the database`,
      });
      
      // Reload transactions
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
        addTransaction,
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
