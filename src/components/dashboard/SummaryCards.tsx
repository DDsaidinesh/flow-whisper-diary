import React from 'react';
import { ArrowUp, ArrowDown, Wallet, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';

const SummaryCards: React.FC = () => {
  const { getBalance, getIncome, getExpenses, defaultAccount, accounts } = useMoneyFlow();
  
  // Use account balance for the main balance display
  const accountBalance = defaultAccount?.balance || 0;
  const income = getIncome();
  const expenses = getExpenses();
  
  // Calculate total balance across all accounts
  const totalAccountsBalance = accounts.reduce((total, account) => total + (account.balance || 0), 0);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card className="border-primary/20 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {defaultAccount ? `${defaultAccount.name}` : 'Account Balance'}
              </p>
              <h3 className={`text-2xl font-bold tracking-tight ${accountBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                ₹{accountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {accounts.length > 1 && (
        <Card className="border-flow-neutral/20 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Balance</p>
                <h3 className={`text-2xl font-bold tracking-tight ${totalAccountsBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  ₹{totalAccountsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-flow-neutral-light">
                <CreditCard className="h-5 w-5 text-flow-neutral" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-flow-income/20 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Income</p>
              <h3 className="text-2xl font-bold tracking-tight text-flow-income">
                ₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-flow-income-light">
              <ArrowUp className="h-5 w-5 text-flow-income" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-flow-expense/20 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold tracking-tight text-flow-expense">
                ₹{expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-flow-expense-light">
              <ArrowDown className="h-5 w-5 text-flow-expense" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;