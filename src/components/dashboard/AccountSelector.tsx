import React, { useState } from 'react';
import { Plus, Wallet, CreditCard, PiggyBank, Landmark, TrendingUp } from 'lucide-react';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const AccountSelector: React.FC = () => {
  const { accounts, defaultAccount } = useMoneyFlow();
  const [selectedAccount, setSelectedAccount] = useState(defaultAccount?.id || '');

  const getAccountIcon = (accountName: string) => {
    const name = accountName.toLowerCase();
    if (name.includes('cash') || name.includes('wallet')) {
      return <Wallet className="h-5 w-5" />;
    } else if (name.includes('credit') || name.includes('card')) {
      return <CreditCard className="h-5 w-5" />;
    } else if (name.includes('saving') || name.includes('bank')) {
      return <Landmark className="h-5 w-5" />;
    } else if (name.includes('investment')) {
      return <TrendingUp className="h-5 w-5" />;
    } else {
      return <PiggyBank className="h-5 w-5" />;
    }
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No accounts found</p>
            <p className="text-sm text-muted-foreground mb-4">
              You need at least one account to manage your finances
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const activeAccounts = accounts.filter(acc => acc.is_active);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Your Accounts</span>
          <Badge variant="outline" className="text-xs">
            {activeAccounts.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick Stats */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-flow-income/10 rounded-lg border border-primary/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className={cn(
                "text-2xl font-bold",
                totalBalance >= 0 ? "text-flow-income" : "text-flow-expense"
              )}>
                ₹{formatBalance(totalBalance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Accounts</p>
              <p className="text-lg font-semibold text-foreground">{activeAccounts.length}</p>
            </div>
          </div>
        </div>

        {/* Account List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activeAccounts.map((account) => (
            <div
              key={account.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200",
                account.id === selectedAccount 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-border hover:border-primary/30 hover:shadow-sm"
              )}
              onClick={() => setSelectedAccount(account.id)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div 
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    account.id === selectedAccount 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {getAccountIcon(account.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{account.name}</span>
                    {account.is_default && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Default
                      </Badge>
                    )}
                  </div>
                  {account.description && (
                    <p className="text-sm text-gray-500 truncate">{account.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={cn(
                  "font-semibold",
                  (account.balance || 0) >= 0 ? "text-flow-income" : "text-flow-expense"
                )}>
                  ₹{formatBalance(account.balance || 0)}
                </div>
                <div className="text-xs text-muted-foreground uppercase">
                  {account.currency}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Account Button */}
        <Button variant="outline" className="w-full mt-4" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Account
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountSelector;