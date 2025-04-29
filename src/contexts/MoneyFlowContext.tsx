import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
}

// Define categories for each transaction type
export const CATEGORIES: Record<TransactionType, string[]> = {
  income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'],
  expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Education', 'Personal', 'Other']
};

// Define the categories
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

// Define the transaction interface to match database
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
  created_at: string;
  updated_at: string;
}

// Define the context interface
interface MoneyFlowContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  addCategory: (category: Omit<Category, 'id' | 'user_id' | 'is_default'>) => void;
  getBalance: () => number;
  getIncome: () => number;
  getExpenses: () => number;
  getCategoryTotals: () => Record<string, number>;
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

// Sample data for initial load
const createSampleData = (userId: string): Transaction[] => [
  {
    id: '1',
    user_id: userId,
    amount: 3500,
    description: 'Monthly Salary',
    category: 'Salary',
    type: 'income',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: userId,
    amount: 800,
    description: 'Rent Payment',
    category: 'Housing',
    type: 'expense',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: userId,
    amount: 120,
    description: 'Grocery Shopping',
    category: 'Food',
    type: 'expense',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: userId,
    amount: 200,
    description: 'Freelance Project',
    category: 'Freelance',
    type: 'income',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: userId,
    amount: 50,
    description: 'Movie Night',
    category: 'Entertainment',
    type: 'expense',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Create the provider component
export const MoneyFlowProvider: React.FC<MoneyFlowProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAuthenticated, user } = useAuth();

  // Load categories
  useEffect(() => {
    if (isAuthenticated && user) {
      const loadCategories = () => {
        // Check for user's custom categories
        const key = `moneyFlowCategories_${user.id}`;
        const savedCategories = localStorage.getItem(key);
        
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          // If no custom categories, use defaults
          const defaultCategoriesWithUserId = DEFAULT_CATEGORIES.map(cat => ({
            ...cat,
            user_id: user.id
          }));
          setCategories(defaultCategoriesWithUserId);
          localStorage.setItem(key, JSON.stringify(defaultCategoriesWithUserId));
        }
      };
      
      loadCategories();
    }
  }, [isAuthenticated, user]);

  // Load data from localStorage on component mount or when auth state changes
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      
      if (isAuthenticated && user) {
        const key = `moneyFlowTransactions_${user.id}`;
        const savedTransactions = localStorage.getItem(key);
        
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        } else {
          // If no data exists for this user, use sample data
          const userSampleData = createSampleData(user.id);
          setTransactions(userSampleData);
          localStorage.setItem(key, JSON.stringify(userSampleData));
        }
      } else {
        // Clear transactions when not authenticated
        setTransactions([]);
      }
      
      setIsLoading(false);
    };
    
    loadTransactions();
  }, [isAuthenticated, user]);

  // Save data to localStorage whenever transactions change
  useEffect(() => {
    if (isAuthenticated && user && transactions.length > 0) {
      const key = `moneyFlowTransactions_${user.id}`;
      localStorage.setItem(key, JSON.stringify(transactions));
    }
  }, [transactions, isAuthenticated, user]);

  // Save categories to localStorage when they change
  useEffect(() => {
    if (isAuthenticated && user && categories.length > 0) {
      const key = `moneyFlowCategories_${user.id}`;
      localStorage.setItem(key, JSON.stringify(categories));
    }
  }, [categories, isAuthenticated, user]);

  // Add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!isAuthenticated || !user) return;

    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}`,
      user_id: user.id,
      created_at: now,
      updated_at: now,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Delete a transaction
  const deleteTransaction = (id: string) => {
    if (!isAuthenticated) return;
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  // Clear all transactions
  const clearAllTransactions = () => {
    if (!isAuthenticated || !user) return;
    setTransactions([]);
    const key = `moneyFlowTransactions_${user.id}`;
    localStorage.removeItem(key);
  };

  // Add a new category
  const addCategory = (category: Omit<Category, 'id' | 'user_id' | 'is_default'>) => {
    if (!isAuthenticated || !user) return;
    
    const newCategory: Category = {
      ...category,
      id: `cat_${Date.now()}`,
      user_id: user.id,
      is_default: false,
    };
    
    setCategories(prev => [...prev, newCategory]);
  };

  // Get total balance
  const getBalance = () => {
    return transactions.reduce((total, transaction) => {
      return transaction.type === 'income'
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);
  };

  // Get total income
  const getIncome = () => {
    return transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  // Get total expenses
  const getExpenses = () => {
    return transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  // Get category totals for expense categories
  const getCategoryTotals = () => {
    return transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((totals, transaction) => {
        const { category, amount } = transaction;
        return {
          ...totals,
          [category]: (totals[category] || 0) + amount,
        };
      }, {} as Record<string, number>);
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
        isLoading,
      }}
    >
      {children}
    </MoneyFlowContext.Provider>
  );
};
