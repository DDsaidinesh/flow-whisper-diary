import React, { useState } from 'react';
import TransactionForm from '@/components/transactions/TransactionForm';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  PlusCircle,
  Eye,
  EyeOff,
  FileText,
  PieChart,
  Target,
  Clock
} from 'lucide-react';
import { format, isToday, isYesterday, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { transactions, getBalance, getIncome, getExpenses } = useMoneyFlow();
  const [showBalance, setShowBalance] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const balance = getBalance();
  const income = getIncome();
  const expenses = getExpenses();

  // Group transactions by date for diary view
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  const recentDates = Object.keys(groupedTransactions)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 7);

  // This week's summary
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const thisWeekTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= weekStart && transDate <= weekEnd;
  });

  const weekIncome = thisWeekTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const weekExpenses = thisWeekTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    if (!showBalance) return '••••••';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM dd');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 space-y-6">
      {/* Header - Diary Style */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Money Diary
          </h1>
        </div>
        <p className="text-gray-600">
          {format(new Date(), 'EEEE, MMMM dd, yyyy')}
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Current Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-green-100 text-sm font-medium">This Week Income</p>
                <p className="text-2xl font-bold">{formatCurrency(weekIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingDown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-red-100 text-sm font-medium">This Week Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(weekExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center" onClick={() => setShowForm(true)}>
            <PlusCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="font-medium text-blue-900">Add Entry</p>
            <p className="text-xs text-blue-600">Record transaction</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <PieChart className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="font-medium text-purple-900">Analytics</p>
            <p className="text-xs text-purple-600">View insights</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="font-medium text-green-900">Goals</p>
            <p className="text-xs text-green-600">Track progress</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <p className="font-medium text-orange-900">Export</p>
            <p className="text-xs text-orange-600">Download data</p>
          </CardContent>
        </Card>
      </div>

      {/* Diary Entries */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Diary Entries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentDates.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Your Money Diary is Empty</h3>
              <p className="text-gray-500 mb-4">Start by recording your first financial transaction</p>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Write First Entry
              </Button>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {recentDates.map((date) => (
                <div key={date} className="border-b border-gray-100 last:border-b-0">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <h3 className="font-semibold text-gray-800">{getDateLabel(date)}</h3>
                      <div className="ml-auto text-sm text-gray-500">
                        {groupedTransactions[date].length} entries
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {groupedTransactions[date].map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                transaction.type === 'income'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-600'
                              )}
                            >
                              {transaction.type === 'income' ? (
                                <TrendingUp className="h-5 w-5" />
                              ) : (
                                <TrendingDown className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  transaction.type === 'income'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                )}
                              >
                                {transaction.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={cn(
                                "font-bold text-lg",
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              )}
                            >
                              {transaction.type === 'income' ? '+' : '-'}₹
                              {transaction.amount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(transaction.date), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Diary Entry</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                ×
              </Button>
            </div>
            <div className="p-4">
              <TransactionForm isDialog={true} onClose={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;