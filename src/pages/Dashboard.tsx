import React from 'react';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SpendingChart from '@/components/analytics/SpendingChart';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { transactions, getBalance, getIncome, getExpenses, isLoading } = useMoneyFlow();

  if (isLoading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flow-blue mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 5);
  const balance = getBalance();
  const totalIncome = getIncome();
  const totalExpenses = getExpenses();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Financial Dashboard
        </h1>
        <p className="text-gray-600">
          Get an overview of your financial health and recent activity
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-900">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Avg Income</p>
                <p className="text-xl font-bold text-green-900">
                  {totalIncome > 0 ? formatCurrency(totalIncome / Math.max(transactions.filter(t => t.type === 'income').length, 1)) : '₹0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-full">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Avg Expense</p>
                <p className="text-xl font-bold text-red-900">
                  {totalExpenses > 0 ? formatCurrency(totalExpenses / Math.max(transactions.filter(t => t.type === 'expense').length, 1)) : '₹0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column - Form and Chart */}
        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          {/* Transaction Form */}
          <TransactionForm isDialog={false} />
          
          {/* Spending Chart */}
          <div className="lg:block">
            <SpendingChart />
          </div>
        </div>

        {/* Right Column - Transaction List */}
        <div className="lg:col-span-2">
          <TransactionList />
        </div>
      </div>

      {/* Financial Health Indicator */}
      {transactions.length > 0 && (
        <Card className="border-l-4 border-l-flow-blue">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity className="h-5 w-5 text-flow-blue" />
              Financial Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  balance >= 0 ? 'text-flow-green' : 'text-flow-red'
                }`}>
                  {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                </div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-xs text-gray-500 mt-1">
                  {balance >= 0 ? 'You\'re in the positive!' : 'Consider reducing expenses'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-flow-blue mb-2">
                  {totalExpenses > 0 ? Math.round((totalIncome / totalExpenses) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-600">Income Coverage</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalExpenses > 0 
                    ? totalIncome >= totalExpenses 
                      ? 'Great! Income covers expenses' 
                      : 'Expenses exceed income'
                    : 'No expenses recorded'
                  }
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-flow-neutral mb-2">
                  {transactions.length}
                </div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-xs text-gray-500 mt-1">
                  Keep tracking for better insights
                </p>
              </div>
            </div>
            
            {/* Progress Bar for Savings Rate */}
            {totalIncome > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Savings Rate</span>
                  <span className="text-sm text-gray-600">
                    {Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      balance >= 0 ? 'bg-flow-green' : 'bg-flow-red'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100))}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {balance >= 0 
                    ? 'Good job saving money!' 
                    : 'Try to increase income or reduce expenses'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Welcome Message for New Users */}
      {transactions.length === 0 && (
        <Card className="bg-gradient-to-r from-flow-blue-light to-flow-green-light border-flow-blue">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 bg-flow-blue rounded-full flex items-center justify-center mb-4">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to MoneyFlow!
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start your financial journey by adding your first transaction. Track your income and expenses to get insights into your spending habits.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-flow-green-light rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-flow-green font-bold">1</span>
                  </div>
                  <p className="font-medium">Add Transactions</p>
                  <p className="text-gray-500">Record your income and expenses</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-flow-blue-light rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-flow-blue font-bold">2</span>
                  </div>
                  <p className="font-medium">Track Patterns</p>
                  <p className="text-gray-500">See where your money goes</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-flow-red-light rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-flow-red font-bold">3</span>
                  </div>
                  <p className="font-medium">Make Better Decisions</p>
                  <p className="text-gray-500">Improve your financial health</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;