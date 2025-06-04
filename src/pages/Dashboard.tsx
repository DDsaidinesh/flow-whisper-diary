import React from 'react';
import EnhancedTransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import EnhancedSummaryCards from '@/components/dashboard/SummaryCards';
import SpendingChart from '@/components/analytics/SpendingChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, TrendingUp, CreditCard } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountContext';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';

const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const { transactions } = useMoneyFlow();

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Quick stats
  const totalAccounts = accounts.length;
  const recentTransactionsCount = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return transactionDate >= weekAgo;
  }).length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Your complete financial overview and quick actions
        </p>
      </div>
      
      {/* Enhanced Financial Summary */}
      <EnhancedSummaryCards />
      
      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/accounts')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Accounts
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/transactions')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View All Transactions
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/analytics')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics & Reports
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Accounts</span>
                <span className="font-semibold">{totalAccounts}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Transactions</span>
                <span className="font-semibold">{transactions.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="font-semibold">{recentTransactionsCount} transactions</span>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Accounts</span>
                  <span className="font-semibold">
                    {accounts.filter(acc => acc.is_active).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Transaction Form */}
          <EnhancedTransactionForm isDialog={false} />
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/transactions')}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-600' 
                            : transaction.type === 'expense'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '→'}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.category || 'Transfer'}
                            {transaction.type === 'transfer' && (
                              <span className="ml-2">
                                {transaction.from_account?.name} → {transaction.to_account?.name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income' 
                            ? 'text-green-600' 
                            : transaction.type === 'expense'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                          ₹{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first transaction to get started!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spending Chart */}
          <SpendingChart />
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;