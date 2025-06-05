import React from 'react';
import { ArrowUp, ArrowDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';

const SummaryCards: React.FC = () => {
  const { getBalance, getIncome, getExpenses } = useMoneyFlow();
  
  const balance = getBalance();
  const income = getIncome();
  const expenses = getExpenses();
  
  // Format currency consistently
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Balance Card */}
      <Card className="bg-white border-flow-blue-light hover:shadow-lg transition-shadow duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-flow-blue-light">
              <Wallet className="h-6 w-6 text-flow-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Current Balance</p>
              <h3 className={`text-2xl font-bold transition-colors ${
                balance >= 0 ? 'text-flow-blue' : 'text-flow-red'
              }`}>
                {formatCurrency(balance)}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {balance >= 0 ? 'Positive Balance' : 'Negative Balance'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Income Card */}
      <Card className="bg-white border-flow-green-light hover:shadow-lg transition-shadow duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-flow-green-light">
              <ArrowUp className="h-6 w-6 text-flow-green" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
              <h3 className="text-2xl font-bold text-flow-green">
                {formatCurrency(income)}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Money earned
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses Card */}
      <Card className="bg-white border-flow-red-light hover:shadow-lg transition-shadow duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-flow-red-light">
              <ArrowDown className="h-6 w-6 text-flow-red" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold text-flow-red">
                {formatCurrency(expenses)}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Money spent
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;