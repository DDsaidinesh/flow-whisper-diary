import React, { useState } from 'react';
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
  const { transactions } = useMoneyFlow();
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

  const generateChartData = () => {
    const { start, end } = getDateRange();
    
    const days = eachDayOfInterval({ start, end });
    
    const initialData = days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      income: 0,
      expense: 0,
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
        } else {
          data.expense += transaction.amount;
        }
      }
    });
    
    return Array.from(dataMap.values()).map(item => ({
      ...item,
      date: format(new Date(item.date), timeFrame === '7days' ? 'EEE' : 'MMM dd'),
    }));
  };
  
  const chartData = generateChartData();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics</h1>
      
      <SummaryCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Income vs Expenses</CardTitle>
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
            <div className="h-[350px]">
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
      
      <Card>
        <CardContent className="pt-6">
          <TransactionTable />
        </CardContent>
      </Card>
    </div>
  );
};

function generateCategorySummary() {
  const { getCategoryTotals, getExpenses } = useMoneyFlow();
  
  const categoryTotals = getCategoryTotals();
  const totalExpenses = getExpenses();
  
  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export default Analytics;
