
import React from 'react';
import { ArrowUp, ArrowDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';

const SummaryCards: React.FC = () => {
  const { getBalance, getIncome, getExpenses } = useMoneyFlow();
  
  const balance = getBalance();
  const income = getIncome();
  const expenses = getExpenses();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-white border-flow-blue-light">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-flow-blue-light">
              <Wallet className="h-6 w-6 text-flow-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Balance</p>
              <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-flow-blue' : 'text-flow-red'}`}>
                ₹{balance.toFixed(2)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-flow-green-light">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-flow-green-light">
              <ArrowUp className="h-6 w-6 text-flow-green" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <h3 className="text-2xl font-bold text-flow-green">
                ₹{income.toFixed(2)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-flow-red-light">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-flow-red-light">
              <ArrowDown className="h-6 w-6 text-flow-red" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <h3 className="text-2xl font-bold text-flow-red">
                ₹{expenses.toFixed(2)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
