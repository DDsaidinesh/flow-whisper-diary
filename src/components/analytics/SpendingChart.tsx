
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';

const COLORS = ['#33C3F0', '#4CAF50', '#FFC107', '#FF6B6B', '#9C27B0', '#3F51B5', '#009688', '#FF5722', '#795548', '#607D8B'];

const SpendingChart: React.FC = () => {
  const { getCategoryTotals, getExpenses } = useMoneyFlow();
  
  const categoryTotals = getCategoryTotals();
  const totalExpenses = getExpenses();
  
  const chartData = Object.entries(categoryTotals).map(([name, value], index) => ({
    name,
    value,
    percentage: totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : 0,
  }));
  
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Spending Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No expense data to display</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingChart;
