import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, startOfYear } from 'date-fns';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { useAccounts } from '@/contexts/AccountContext';
import SpendingChart from '@/components/analytics/SpendingChart';
import TransactionTable from '@/components/analytics/TransactionTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Calendar, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimeFrame = '7days' | '30days' | '3months' | '6months' | '1year' | 'all';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

// Type definitions
interface AccountType {
  name: string;
  category: 'asset' | 'liability' | 'equity';
  description?: string;
  color?: string;
  icon?: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  account_type?: AccountType;
  account_type_id: string;
  description?: string;
  account_number?: string;
  color?: string;
  icon?: string;
  currency: string;
  is_active: boolean;
  is_default: boolean;
}

interface AccountTypeDistribution {
  name: string;
  balance: number;
  count: number;
  category: string;
}

interface CategoryTrend {
  name: string;
  amount: number;
  count: number;
  avgAmount: number;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category?: string;
  from_account_id?: string;
  to_account_id?: string;
}

interface AccountPerformance extends Account {
  inflows: number;
  outflows: number;
  netFlow: number;
  transactionCount: number;
  efficiency: number;
}

interface CashFlowData {
  date: string;
  fullDate: string;
  income: number;
  expense: number;
  transfers: number;
  netFlow: number;
}

interface Metrics {
  totalIncome: number;
  totalExpenses: number;
  totalTransfers: number;
  netFlow: number;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  savingsRate: number;
  debtToAssetRatio: number;
  transactionCount: number;
  avgTransactionSize: number;
}

const EnhancedAnalytics: React.FC = () => {
  const { transactions } = useMoneyFlow() as { transactions: Transaction[] };
  const { accounts, calculateNetWorth, getAssetAccounts, getLiabilityAccounts } = useAccounts() as { 
    accounts: Account[],
    calculateNetWorth: () => number,
    getAssetAccounts: () => Account[],
    getLiabilityAccounts: () => Account[]
  };
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('30days');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('all');

  // Calculate date range based on timeframe
  const getDateRange = () => {
    const now = new Date();
    
    switch (timeFrame) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case '3months':
        return { start: subMonths(now, 3), end: now };
      case '6months':
        return { start: subMonths(now, 6), end: now };
      case '1year':
        return { start: subMonths(now, 12), end: now };
      case 'all':
        const oldestTransaction = transactions.length > 0 
          ? new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())))
          : subDays(now, 30);
        return { start: oldestTransaction, end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  // Filter transactions by date range
  const filteredTransactions = useMemo<Transaction[]>(() => {
    const { start, end } = getDateRange();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });
  }, [transactions, timeFrame]);

  // Account performance analysis
  const accountPerformance = useMemo<AccountPerformance[]>(() => {
    const accountStats = accounts.map(account => {
      const accountTransactions = filteredTransactions.filter(t => 
        t.from_account_id === account.id || t.to_account_id === account.id
      );
      
      const inflows = accountTransactions
        .filter(t => t.to_account_id === account.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const outflows = accountTransactions
        .filter(t => t.from_account_id === account.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netFlow = inflows - outflows;
      const transactionCount = accountTransactions.length;
      
      return {
        ...account,
        inflows,
        outflows,
        netFlow,
        transactionCount,
        efficiency: transactionCount > 0 ? netFlow / transactionCount : 0,
      };
    });
    
    return accountStats.sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow));
  }, [accounts, filteredTransactions]);

  // Cash flow over time
  const cashFlowData = useMemo<CashFlowData[]>(() => {
    const { start, end } = getDateRange();
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dayTransactions = filteredTransactions.filter(t => 
        format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const transfers = dayTransactions
        .filter(t => t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(day, timeFrame === '7days' ? 'EEE' : 'MMM dd'),
        fullDate: format(day, 'yyyy-MM-dd'),
        income,
        expense,
        transfers,
        netFlow: income - expense,
      };
    });
  }, [filteredTransactions, timeFrame]);

  // Account type distribution
  const accountTypeDistribution = useMemo(() => {
    const typeStats = accounts.reduce((acc, account) => {
      const typeName = account.account_type?.name || 'Unknown';
      if (!acc[typeName]) {
        acc[typeName] = {
          name: typeName,
          balance: 0,
          count: 0,
          category: account.account_type?.category || 'unknown',
        };
      }
      acc[typeName].balance += account.balance;
      acc[typeName].count += 1;
      return acc;
    }, {} as Record<string, AccountTypeDistribution>);
    
    return Object.values(typeStats).sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  }, [accounts]);

  // Category spending trends
  const categoryTrends = useMemo<CategoryTrend[]>(() => {
    const categoryStats = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Other';
        if (!acc[category]) {
          acc[category] = {
            name: category,
            amount: 0,
            count: 0,
            avgAmount: 0,
          };
        }
        acc[category].amount += transaction.amount;
        acc[category].count += 1;
        acc[category].avgAmount = acc[category].amount / acc[category].count;
        return acc;
      }, {} as Record<string, CategoryTrend>);
    
    return Object.values(categoryStats).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Financial metrics
  const metrics = useMemo<Metrics>(() => {
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalTransfers = filteredTransactions.filter(t => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0);
    
    const netWorth = calculateNetWorth();
    const totalAssets = getAssetAccounts().reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = getLiabilityAccounts().reduce((sum, acc) => sum + acc.balance, 0);
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      totalTransfers,
      netFlow: totalIncome - totalExpenses,
      netWorth,
      totalAssets,
      totalLiabilities,
      savingsRate,
      debtToAssetRatio,
      transactionCount: filteredTransactions.length,
      avgTransactionSize: filteredTransactions.length > 0 
        ? filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length 
        : 0,
    };
  }, [filteredTransactions, calculateNetWorth, getAssetAccounts, getLiabilityAccounts]);

  // Most active accounts
  const mostActiveAccounts = useMemo(() => {
    return accountPerformance
      .filter(acc => acc.transactionCount > 0)
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 5);
  }, [accountPerformance]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your financial health and spending patterns
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    metrics.netWorth >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    ₹{Math.abs(metrics.netWorth).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-2">
                <Badge variant={metrics.netWorth >= 0 ? "default" : "destructive"}>
                  {metrics.netWorth >= 0 ? "Positive" : "Negative"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    metrics.savingsRate >= 20 ? "text-green-600" : 
                    metrics.savingsRate >= 10 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {metrics.savingsRate.toFixed(1)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-2">
                <Badge variant={
                  metrics.savingsRate >= 20 ? "default" : 
                  metrics.savingsRate >= 10 ? "secondary" : "destructive"
                }>
                  {metrics.savingsRate >= 20 ? "Excellent" : 
                   metrics.savingsRate >= 10 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Debt Ratio</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    metrics.debtToAssetRatio <= 30 ? "text-green-600" : 
                    metrics.debtToAssetRatio <= 50 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {metrics.debtToAssetRatio.toFixed(1)}%
                  </p>
                </div>
                <AlertTriangle className={cn(
                  "h-8 w-8",
                  metrics.debtToAssetRatio <= 30 ? "text-green-500" : 
                  metrics.debtToAssetRatio <= 50 ? "text-yellow-500" : "text-red-500"
                )} />
              </div>
              <div className="mt-2">
                <Badge variant={
                  metrics.debtToAssetRatio <= 30 ? "default" : 
                  metrics.debtToAssetRatio <= 50 ? "secondary" : "destructive"
                }>
                  {metrics.debtToAssetRatio <= 30 ? "Healthy" : 
                   metrics.debtToAssetRatio <= 50 ? "Moderate" : "High Risk"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
                  <p className="text-2xl font-bold">
                    ₹{metrics.avgTransactionSize.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-2">
                <Badge variant="outline">
                  {metrics.transactionCount} transactions
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Income vs Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#4CAF50" />
                      <Bar dataKey="expense" name="Expense" fill="#FF6B6B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <SpendingChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Savings Rate</span>
                      <span className="text-sm font-medium">{metrics.savingsRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full",
                          metrics.savingsRate >= 20 ? "bg-green-500" : 
                          metrics.savingsRate >= 10 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(metrics.savingsRate, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Debt Ratio</span>
                      <span className="text-sm font-medium">{metrics.debtToAssetRatio.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full",
                          metrics.debtToAssetRatio <= 30 ? "bg-green-500" : 
                          metrics.debtToAssetRatio <= 50 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(metrics.debtToAssetRatio, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <div className={cn(
                        "text-3xl font-bold",
                        (metrics.savingsRate >= 20 && metrics.debtToAssetRatio <= 30) ? "text-green-600" :
                        (metrics.savingsRate >= 10 && metrics.debtToAssetRatio <= 50) ? "text-yellow-600" : "text-red-600"
                      )}>
                        {Math.round(
                          ((metrics.savingsRate >= 20 ? 50 : metrics.savingsRate >= 10 ? 25 : 0) +
                           (metrics.debtToAssetRatio <= 30 ? 50 : metrics.debtToAssetRatio <= 50 ? 25 : 0))
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Health Score</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accountTypeDistribution
                    .filter(type => type.category === 'asset')
                    .slice(0, 5)
                    .map((type, index) => {
                      const percentage = metrics.totalAssets > 0 
                        ? (type.balance / metrics.totalAssets) * 100 
                        : 0;
                      return (
                        <div key={type.name} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm">{type.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              ₹{type.balance.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mostActiveAccounts.map((account, index) => (
                    <div key={account.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {account.account_type?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {account.transactionCount} txns
                        </div>
                        <div className={cn(
                          "text-xs",
                          account.netFlow >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {account.netFlow >= 0 ? '+' : ''}₹{account.netFlow.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accountPerformance.slice(0, 8).map((account) => (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">₹{account.inflows.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Inflows
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">₹{account.outflows.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Outflows
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">₹{account.netFlow.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Net Flow
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryTrends.slice(0, 5).map((category) => (
                    <div key={category.name} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.count} transactions
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Spent</p>
                          <p className="font-medium">₹{category.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg per Transaction</p>
                          <p className="font-medium">₹{category.avgAmount.toFixed(0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <SpendingChart />
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stackId="1"
                      stroke="#4CAF50"
                      fill="#4CAF50"
                      name="Income"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stackId="2"
                      stroke="#FF6B6B"
                      fill="#FF6B6B"
                      name="Expense"
                    />
                    <Area
                      type="monotone"
                      dataKey="transfers"
                      stackId="3"
                      stroke="#2196F3"
                      fill="#2196F3"
                      name="Transfers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{metrics.totalIncome.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  During selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹{metrics.totalExpenses.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  During selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Net Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "text-2xl font-bold",
                  metrics.netFlow >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.netFlow >= 0 ? '+' : ''}₹{metrics.netFlow.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Income - Expenses
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryTrends.slice(0, 8).map((category, index) => {
                    const percentage = metrics.totalExpenses > 0 
                      ? (category.amount / metrics.totalExpenses) * 100 
                      : 0;
                    return (
                      <div key={category.name} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {category.count} transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{category.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <SpendingChart />
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#4CAF50" 
                      strokeWidth={2}
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#FF6B6B" 
                      strokeWidth={2}
                      name="Expense"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transfers" 
                      stroke="#2196F3" 
                      strokeWidth={2}
                      name="Transfers"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accountPerformance
                    .filter(acc => acc.netFlow !== 0)
                    .slice(0, 6)
                    .map((account) => (
                    <div key={account.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.account_type?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "text-sm font-medium",
                          account.netFlow >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {account.netFlow >= 0 ? '+' : ''}₹{account.netFlow.toLocaleString()}
                        </div>
                        {account.netFlow >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <p className="font-medium text-blue-900">Savings Performance</p>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your savings rate of {metrics.savingsRate.toFixed(1)}% is{' '}
                      {metrics.savingsRate >= 20 
                        ? 'excellent! You\'re building wealth effectively.' 
                        : metrics.savingsRate >= 10 
                        ? 'good, but could be improved. Aim for 20%+.' 
                        : 'concerning. Consider reducing expenses or increasing income.'
                      }
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <PieChartIcon className="h-5 w-5 text-purple-600" />
                      <p className="font-medium text-purple-900">Account Diversification</p>
                    </div>
                    <p className="text-sm text-purple-700">
                      You have {accounts.length} accounts across{' '}
                      {new Set(accounts.map(acc => acc.account_type?.name)).size} different types.{' '}
                      {accounts.length >= 5 
                        ? 'Good diversification!' 
                        : 'Consider diversifying across more account types.'
                      }
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <p className="font-medium text-orange-900">Debt Management</p>
                    </div>
                    <p className="text-sm text-orange-700">
                      Your debt-to-asset ratio is {metrics.debtToAssetRatio.toFixed(1)}%.{' '}
                      {metrics.debtToAssetRatio <= 30 
                        ? 'Excellent debt management!' 
                        : metrics.debtToAssetRatio <= 50 
                        ? 'Manageable debt levels.' 
                        : 'Consider debt reduction strategies.'
                      }
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <p className="font-medium text-green-900">Transaction Patterns</p>
                    </div>
                    <p className="text-sm text-green-700">
                      You average {(metrics.transactionCount / (timeFrame === '7days' ? 7 : timeFrame === '30days' ? 30 : 90)).toFixed(1)} transactions per day.{' '}
                      Most active account: {mostActiveAccounts[0]?.name || 'None'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TransactionTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalytics;