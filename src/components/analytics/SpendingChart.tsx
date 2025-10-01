import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const SpendingChart: React.FC = () => {
  const { getCategoryTotals, getExpenses } = useMoneyFlow();
  
  const categoryTotals = getCategoryTotals();
  const totalExpenses = getExpenses();
  
  const chartData = Object.entries(categoryTotals)
    .map(([name, value], index) => ({
      name,
      value,
      percentage: totalExpenses > 0 ? ((value / totalExpenses) * 100) : 0,
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Amount: <span className="font-medium text-flow-expense">{formatCurrency(data.value)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;

    return (
      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate">{entry.value}</span>
            </div>
            <div className="flex gap-2 text-gray-600 ml-2">
              <span>{formatCurrency(chartData.find(d => d.name === entry.value)?.value || 0)}</span>
              <span>({chartData.find(d => d.name === entry.value)?.percentage.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Spending Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium mb-1">No expense data</p>
              <p className="text-sm text-gray-400">Add some expenses to see the breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Spending Breakdown</span>
          <span className="text-sm font-normal text-muted-foreground">
            Total: {formatCurrency(totalExpenses)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                outerRadius={80}
                innerRadius={30}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <CustomLegend payload={chartData.map(item => ({ value: item.name, color: item.color }))} />
        
        {/* Top Categories Summary */}
        {chartData.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Top Categories</h4>
            <div className="space-y-1">
              {chartData.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">#{index + 1}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-flow-red font-medium">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpendingChart;