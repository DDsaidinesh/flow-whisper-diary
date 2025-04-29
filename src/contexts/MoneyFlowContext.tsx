
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Define the transaction types
export type TransactionType = 'income' | 'expense';

// Define categories
export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'],
  expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Education', 'Personal', 'Other']
};

// Define the transaction interface
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
  userId?: string; // Add userId field to associate with specific users
}

// Define the context interface
interface MoneyFlowContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  getBalance: () => number;
  getIncome: () => number;
  getExpenses: () => number;
  getCategoryTotals: () => Record<string, number>;
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
const SAMPLE_DATA: Transaction[] = [
  {
    id: '1',
    amount: 3500,
    description: 'Monthly Salary',
    category: 'Salary',
    type: 'income',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo@example.com',
  },
  {
    id: '2',
    amount: 800,
    description: 'Rent Payment',
    category: 'Housing',
    type: 'expense',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo@example.com',
  },
  {
    id: '3',
    amount: 120,
    description: 'Grocery Shopping',
    category: 'Food',
    type: 'expense',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo@example.com',
  },
  {
    id: '4',
    amount: 200,
    description: 'Freelance Project',
    category: 'Freelance',
    type: 'income',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo@example.com',
  },
  {
    id: '5',
    amount: 50,
    description: 'Movie Night',
    category: 'Entertainment',
    type: 'expense',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo@example.com',
  },
];

// Create the provider component
export const MoneyFlowProvider: React.FC<MoneyFlowProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { isAuthenticated, userEmail } = useAuth();

  // Load data from localStorage on component mount or when auth state changes
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      const key = `moneyFlowTransactions_${userEmail}`;
      const savedTransactions = localStorage.getItem(key);
      
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        // If no data exists for this user, use sample data
        // In a real app, you'd probably want to start with an empty array instead
        const userSampleData = SAMPLE_DATA.filter(t => t.userId === 'demo@example.com')
          .map(t => ({...t, userId: userEmail}));
        setTransactions(userSampleData);
      }
    } else {
      // Clear transactions when not authenticated
      setTransactions([]);
    }
  }, [isAuthenticated, userEmail]);

  // Save data to localStorage whenever transactions change
  useEffect(() => {
    if (isAuthenticated && userEmail && transactions.length > 0) {
      const key = `moneyFlowTransactions_${userEmail}`;
      localStorage.setItem(key, JSON.stringify(transactions));
    }
  }, [transactions, isAuthenticated, userEmail]);

  // Add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    if (!isAuthenticated || !userEmail) return;

    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      userId: userEmail,
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
    if (!isAuthenticated || !userEmail) return;
    setTransactions([]);
    const key = `moneyFlowTransactions_${userEmail}`;
    localStorage.removeItem(key);
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
        addTransaction,
        deleteTransaction,
        clearAllTransactions,
        getBalance,
        getIncome,
        getExpenses,
        getCategoryTotals,
      }}
    >
      {children}
    </MoneyFlowContext.Provider>
  );
};
