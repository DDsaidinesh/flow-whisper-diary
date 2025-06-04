import React from 'react';
import { ArrowUp, ArrowDown, Wallet, TrendingUp, CreditCard, Building, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { useAccounts } from '@/contexts/AccountContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const EnhancedSummaryCards: React.FC = () => {
  const { getIncome, getExpenses } = useMoneyFlow();
  const { accounts, calculateNetWorth, getAssetAccounts, getLiabilityAccounts } = useAccounts();
  const [showBalances, setShowBalances] = useState(true);
  
  // Calculate financial metrics
  const netWorth = calculateNetWorth();
  const totalIncome = getIncome();
  const totalExpenses = getExpenses();
  const monthlyFlow = totalIncome - totalExpenses;
  
  // Account categorization
  const assetAccounts = getAssetAccounts();
  const liabilityAccounts = getLiabilityAccounts();
  
  const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Account type summaries
  const accountSummary = accounts.reduce((summary, account) => {
    if (!account.account_type) return summary;
    
    const typeName = account.account_type.name;
    if (!summary[typeName]) {
      summary[typeName] = {
        count: 0,
        balance: 0,
        category: account.account_type.category,
      };
    }
    
    summary[typeName].count += 1;
    summary[typeName].balance += account.balance;
    
    return summary;
  }, {} as Record<string, { count: number; balance: number; category: string }>);

  const formatCurrency = (amount: number) => {
    if (!showBalances) return '••••••';
    return `₹${Math.abs(amount).toLocaleString()}`;
  };

  const getAccountTypeIcon = (typeName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Cash': <Wallet className="h-4 w-4" />,
      'Checking Account': <Building className="h-4 w-4" />,
      'Savings Account': <TrendingUp className="h-4 w-4" />,
      'Credit Card': <CreditCard className="h-4 w-4" />,
      'Investment': <TrendingUp className="h-4 w-4" />,
      'Digital Wallet': <Wallet className="h-4 w-4" />,
    };
    
    return iconMap[typeName] || <Wallet className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Privacy Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Financial Overview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBalances(!showBalances)}
          className="gap-2"
        >
          {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showBalances ? 'Hide' : 'Show'} Balances
        </Button>
      </div>

      {/* Main Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              netWorth >= 0 ? "text-blue-700" : "text-red-600"
            )}>
              {netWorth >= 0 ? '' : '-'}{formatCurrency(netWorth)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Assets - Liabilities
            </p>
          </CardContent>
        </Card>

        {/* Total Assets */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(totalAssets)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {assetAccounts.length} accounts
            </p>
          </CardContent>
        </Card>

        {/* Total Liabilities */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              Total Liabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(totalLiabilities)}
            </div>
            <p className="text-xs text-red-600 mt-1">
              {liabilityAccounts.length} accounts
            </p>
          </CardContent>
        </Card>

        {/* Monthly Cash Flow */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Monthly Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              monthlyFlow >= 0 ? "text-purple-700" : "text-red-600"
            )}>
              {monthlyFlow >= 0 ? '+' : '-'}{formatCurrency(monthlyFlow)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Income - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Type Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Object.entries(accountSummary).map(([typeName, data]) => (
            <Card key={typeName} className="relative">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAccountTypeIcon(typeName)}
                    <div>
                      <p className="text-sm font-medium">{typeName}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.count} account{data.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-lg font-semibold",
                      data.category === 'asset' ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(data.balance)}
                    </div>
                    <Badge 
                      variant={data.category === 'asset' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {data.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Account Access */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Quick Account Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.slice(0, 6).map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.account_type?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-semibold",
                      account.account_type?.category === 'asset' 
                        ? "text-green-600" 
                        : "text-red-600"
                    )}>
                      {formatCurrency(account.balance)}
                    </div>
                    {account.is_default && (
                      <Badge variant="outline" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {accounts.length > 6 && (
          <div className="text-center">
            <Button variant="outline" size="sm">
              View All {accounts.length} Accounts
            </Button>
          </div>
        )}
      </div>

      {/* Financial Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(accountSummary)
                .filter(([_, data]) => data.category === 'asset')
                .map(([typeName, data]) => {
                  const percentage = totalAssets > 0 ? (data.balance / totalAssets) * 100 : 0;
                  return (
                    <div key={typeName} className="flex justify-between items-center">
                      <span className="text-xs">{typeName}</span>
                      <span className="text-xs font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Debt Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {totalLiabilities > 0 ? (
                Object.entries(accountSummary)
                  .filter(([_, data]) => data.category === 'liability')
                  .map(([typeName, data]) => (
                    <div key={typeName} className="flex justify-between items-center">
                      <span className="text-xs">{typeName}</span>
                      <span className="text-xs font-medium text-red-600">
                        {formatCurrency(data.balance)}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-green-600">No outstanding debts! 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs">Income</span>
                <span className="text-xs font-medium text-green-600">
                  +{formatCurrency(totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Expenses</span>
                <span className="text-xs font-medium text-red-600">
                  -{formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">Net Flow</span>
                  <span className={cn(
                    "text-xs font-bold",
                    monthlyFlow >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {monthlyFlow >= 0 ? '+' : ''}{formatCurrency(monthlyFlow)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedSummaryCards;