import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import SpendingChart from '@/components/analytics/SpendingChart';
import TransactionTable from '@/components/analytics/TransactionTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SummaryCards from '@/components/dashboard/SummaryCards';

type TimeFrame = '7days' | '30days' | 'month';

const Analytics: React.FC = () => {
  const { transactions, getBalance, getIncome, getExpenses } = useMoneyFlow();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('30days');

  const getDateRange = () => {
    const now = new Date();
    
    switch (timeFrame) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const chartData = useMemo(() => {
    const { start, end } = getDateRange();
    
    const days = eachDayOfInterval({ start, end });
    
    const initialData = days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      displayDate: format(day, timeFrame === '7days' ? 'EEE' : 'MMM dd'),
      income: 0,
      expense: 0,
      net: 0,
    }));
    
    const filteredTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });
    
    const dataMap = new Map();
    initialData.forEach(item => {
      dataMap.set(item.date, { ...item });
    });
    
    filteredTransactions.forEach(transaction => {
      const date = transaction.date.split('T')[0];
      const data = dataMap.get(date);
      
      if (data) {
        if (transaction.type === 'income') {
          data.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          data.expense += transaction.amount;
        }
        // Transfers are ignored - they don't affect income or expense totals
        data.net = data.income - data.expense;
      }
    });
    
    return Array.from(dataMap.values());
  }, [transactions, timeFrame]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const periodStats = useMemo(() => {
    const { start, end } = getDateRange();
    const periodTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });

    const periodIncome = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const periodExpenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income: periodIncome,
      expenses: periodExpenses,
      net: periodIncome - periodExpenses,
      transactionCount: periodTransactions.length,
    };
  }, [transactions, timeFrame]);

  const getTimeFrameLabel = () => {
    switch (timeFrame) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'month': return 'This Month';
      default: return 'Last 30 Days';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <div className="text-sm text-gray-500">
          Track your financial performance over time
        </div>
      </div>
      
      {/* Overall Summary Cards */}
      <SummaryCards />

      {/* Period Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Period Overview</CardTitle>
          <Select
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as TimeFrame)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-flow-green-light rounded-lg">
              <div className="text-2xl font-bold text-flow-green">
                {formatCurrency(periodStats.income)}
              </div>
              <div className="text-sm text-gray-600">Income</div>
            </div>
            <div className="text-center p-4 bg-flow-red-light rounded-lg">
              <div className="text-2xl font-bold text-flow-red">
                {formatCurrency(periodStats.expenses)}
              </div>
              <div className="text-sm text-gray-600">Expenses</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              periodStats.net >= 0 ? 'bg-flow-blue-light' : 'bg-gray-100'
            }`}>
              <div className={`text-2xl font-bold ${
                periodStats.net >= 0 ? 'text-flow-blue' : 'text-flow-red'
              }`}>
                {formatCurrency(periodStats.net)}
              </div>
              <div className="text-sm text-gray-600">Net</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {periodStats.transactionCount}
              </div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        {/* Income vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Daily Trends - {getTimeFrameLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="displayDate" 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Net'
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="income" 
                      name="Income" 
                      fill="#4CAF50" 
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="expense" 
                      name="Expense" 
                      fill="#FF6B6B" 
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">No data available</div>
                    <div className="text-sm">Add some transactions to see the chart</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Spending Breakdown Chart */}
        <SpendingChart />
      </div>
      
      {/* Transaction Table */}
      <Card>
        <CardContent className="pt-6">
          <TransactionTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;