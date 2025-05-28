import React, { useState, useMemo } from 'react';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  Download,
  Target,
  Wallet,
  Eye,
  EyeOff,
  FileSpreadsheet
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

type TimeFrame = '7days' | '30days' | 'month' | 'quarter' | 'year' | 'all';

const Analytics: React.FC = () => {
  const { transactions, getCategoryTotals } = useMoneyFlow();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('30days');
  const [showAmounts, setShowAmounts] = useState(true);

  const getDateRange = () => {
    const now = new Date();
    
    switch (timeFrame) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: subDays(now, 90), end: now };
      case 'year':
        return { start: subDays(now, 365), end: now };
      default:
        return { start: new Date(0), end: now };
    }
  };

  const { start, end } = getDateRange();
  
  const filteredTransactions = useMemo(() => {
    if (timeFrame === 'all') return transactions;
    return transactions.filter(t => {
      const transDate = new Date(t.date);
      return isWithinInterval(transDate, { start, end });
    });
  }, [transactions, start, end, timeFrame]);

  // Calculate summary stats
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100) : 0;

  // Category breakdown for expenses
  const expenseCategories = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseCategories)
    .map(([name, value]) => ({ 
      name, 
      value,
      percentage: totalExpenses > 0 ? ((value / totalExpenses) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value);

  // Daily trend data
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start, end });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTransactions = filteredTransactions.filter(
        t => t.date.startsWith(dayStr)
      );
      
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(day, timeFrame === '7days' ? 'EEE' : 'MMM dd'),
        income,
        expense,
        net: income - expense
      };
    });
  }, [filteredTransactions, start, end, timeFrame]);

  // Monthly comparison
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    
    filteredTransactions.forEach(t => {
      const month = format(new Date(t.date), 'MMM yyyy');
      if (!months[month]) {
        months[month] = { income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        months[month].income += t.amount;
      } else {
        months[month].expense += t.amount;
      }
    });

    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        ...data,
        savings: data.income - data.expense
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [filteredTransactions]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

  const formatCurrency = (amount: number) => {
    if (!showAmounts) return '••••••';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Export analytics data
  const exportAnalytics = () => {
    const analyticsData = [
      ['Analytics Summary', '', '', ''],
      ['Time Period', timeFrame, '', ''],
      ['Total Income', totalIncome.toString(), '', ''],
      ['Total Expenses', totalExpenses.toString(), '', ''],
      ['Net Savings', netSavings.toString(), '', ''],
      ['Savings Rate', `${savingsRate.toFixed(1)}%`, '', ''],
      ['', '', '', ''],
      ['Category Breakdown', '', '', ''],
      ['Category', 'Amount', 'Percentage', ''],
      ...pieData.map(cat => [cat.name, cat.value.toString(), `${cat.percentage.toFixed(1)}%`, '']),
      ['', '', '', ''],
      ['Daily Data', '', '', ''],
      ['Date', 'Income', 'Expense', 'Net'],
      ...dailyData.map(day => [day.date, day.income.toString(), day.expense.toString(), day.net.toString()])
    ];

    const csvContent = analyticsData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `money-diary-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <BarChart3 className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Money Diary Analytics
          </h1>
        </div>
        <p className="text-gray-600">
          Insights and trends from your financial diary
        </p>
      </div>

      {/* Controls */}
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-3">
              <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
                <SelectTrigger className="w-[160px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAmounts(!showAmounts)}
                className="gap-2"
              >
                {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showAmounts ? 'Hide' : 'Show'} Amounts
              </Button>
            </div>

            <Button onClick={exportAnalytics} variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8" />
              <div>
                <p className="text-blue-100 text-sm">Net Savings</p>
                <p className="text-xl font-bold">{formatCurrency(netSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8" />
              <div>
                <p className="text-green-100 text-sm">Total Income</p>
                <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8" />
              <div>
                <p className="text-red-100 text-sm">Total Expenses</p>
                <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8" />
              <div>
                <p className="text-purple-100 text-sm">Savings Rate</p>
                <p className="text-xl font-bold">{savingsRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Pie Chart */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-purple-600" />
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <PieChartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No expense data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={showAmounts ? 
                        ({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%` :
                        ({ name }) => name
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => showAmounts ? [`₹${value}`, 'Amount'] : ['••••••', 'Amount']} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Trend Chart */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Daily Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value) => showAmounts ? [`₹${value}`, ''] : ['••••••', '']}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison */}
      {monthlyData.length > 1 && (
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Monthly Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value) => showAmounts ? [`₹${value}`, ''] : ['••••••', '']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} />
                  <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Details */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No category data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pieData.map((category, index) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">
                        {category.percentage.toFixed(1)}% of total expenses
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-gray-900">
                    {formatCurrency(category.value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;