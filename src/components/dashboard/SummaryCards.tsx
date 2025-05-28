import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { cn } from '@/lib/utils';

const SummaryCards: React.FC = () => {
  const { getBalance, getIncome, getExpenses } = useMoneyFlow();
  const [showBalance, setShowBalance] = React.useState(true);
  
  const balance = getBalance();
  const income = getIncome();
  const expenses = getExpenses();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAmount = (amount: number) => {
    if (!showBalance) return '••••••';
    return formatCurrency(amount);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {/* Balance Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <CardContent className="relative pt-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Current Balance</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {formatAmount(balance)}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Balance Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              balance >= 0 
                ? "bg-green-500/20 text-green-100" 
                : "bg-red-500/20 text-red-100"
            )}>
              {balance >= 0 ? '↗ Positive' : '↘ Negative'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-xl group hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <CardContent className="relative pt-6 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-green-100 text-sm font-medium">Total Income</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                {formatAmount(income)}
              </h3>
            </div>
          </div>
          
          {/* Income Growth Indicator */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-white/20 text-green-100 text-xs font-medium">
              This Month
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 to-pink-600 border-0 shadow-xl group hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <CardContent className="relative pt-6 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-red-100 text-sm font-medium">Total Expenses</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                {formatAmount(expenses)}
              </h3>
            </div>
          </div>
          
          {/* Expense Breakdown */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-white/20 text-red-100 text-xs font-medium">
              This Month
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;