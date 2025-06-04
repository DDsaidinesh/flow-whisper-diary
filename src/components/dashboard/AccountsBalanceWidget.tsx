import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '@/contexts/AccountContext';
import { cn } from '@/lib/utils';

interface AccountsBalanceWidgetProps {
  showTitle?: boolean;
  maxAccounts?: number;
  compact?: boolean;
}

const AccountsBalanceWidget: React.FC<AccountsBalanceWidgetProps> = ({ 
  showTitle = true, 
  maxAccounts = 5,
  compact = false 
}) => {
  const navigate = useNavigate();
  const { accounts, calculateNetWorth } = useAccounts();
  const [showBalances, setShowBalances] = useState(true);

  const netWorth = calculateNetWorth();
  const displayAccounts = accounts.slice(0, maxAccounts);

  const formatCurrency = (amount: number) => {
    if (!showBalances) return '••••••';
    return `₹${Math.abs(amount).toLocaleString()}`;
  };

  const getAccountIcon = (accountTypeName: string) => {
    // Simple colored dots for different account types
    const colorMap: Record<string, string> = {
      'Cash': 'bg-green-500',
      'Checking Account': 'bg-blue-500',
      'Savings Account': 'bg-cyan-500',
      'Credit Card': 'bg-red-500',
      'Investment': 'bg-purple-500',
      'Digital Wallet': 'bg-orange-500',
      'Fixed Deposit': 'bg-indigo-500',
    };
    
    return colorMap[accountTypeName] || 'bg-gray-500';
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium">Net Worth</p>
              <p className={cn(
                "text-lg font-bold",
                netWorth >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {netWorth >= 0 ? '' : '-'}{formatCurrency(netWorth)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalances(!showBalances)}
              className="h-8 w-8"
            >
              {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="space-y-2">
            {displayAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    getAccountIcon(account.account_type?.name || '')
                  )} />
                  <span className="text-xs truncate">{account.name}</span>
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  account.account_type?.category === 'asset' 
                    ? "text-green-600" 
                    : "text-red-600"
                )}>
                  {formatCurrency(account.balance)}
                </span>
              </div>
            ))}
          </div>
          
          {accounts.length > maxAccounts && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 h-8"
              onClick={() => navigate('/accounts')}
            >
              +{accounts.length - maxAccounts} more
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-medium">Account Balances</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalances(!showBalances)}
              className="h-8 w-8"
            >
              {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/accounts')}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Net Worth Summary */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Net Worth</p>
              <p className={cn(
                "text-xl font-bold",
                netWorth >= 0 ? "text-blue-700" : "text-red-600"
              )}>
                {netWorth >= 0 ? '' : '-'}{formatCurrency(netWorth)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600">
                {accounts.filter(acc => acc.account_type?.category === 'asset').length} Assets
              </p>
              <p className="text-xs text-blue-600">
                {accounts.filter(acc => acc.account_type?.category === 'liability').length} Liabilities
              </p>
            </div>
          </div>
        </div>

        {/* Account List */}
        <div className="space-y-3">
          {displayAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  getAccountIcon(account.account_type?.name || '')
                )} />
                <div>
                  <p className="font-medium text-sm">{account.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {account.account_type?.name}
                    </p>
                    <Badge 
                      variant={account.account_type?.category === 'asset' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {account.account_type?.category}
                    </Badge>
                    {account.is_default && (
                      <Badge variant="outline" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className={cn(
                  "font-semibold",
                  account.account_type?.category === 'asset' 
                    ? "text-green-600" 
                    : "text-red-600"
                )}>
                  {formatCurrency(account.balance)}
                </p>
                {account.account_number && (
                  <p className="text-xs text-muted-foreground">
                    {account.account_number}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Accounts Button */}
        {accounts.length > maxAccounts && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/accounts')}
          >
            View All {accounts.length} Accounts
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {/* No Accounts State */}
        {accounts.length === 0 && (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">No accounts yet</p>
            <Button
              onClick={() => navigate('/accounts')}
              size="sm"
            >
              Add Your First Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountsBalanceWidget;