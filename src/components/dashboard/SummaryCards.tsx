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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white border-flow-blue-light">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-flow-blue-light">
              <Wallet className="h-6 w-6 text-flow-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {defaultAccount ? `${defaultAccount.name} Balance` : 'Account Balance'}
              </p>
              <h3 className={`text-2xl font-bold ${accountBalance >= 0 ? 'text-flow-blue' : 'text-flow-red'}`}>
                ₹{accountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {accounts.length > 1 && (
        <Card className="bg-white border-flow-neutral-light">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-flow-neutral-light">
                <CreditCard className="h-6 w-6 text-flow-neutral" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Balance</p>
                <h3 className={`text-2xl font-bold ${totalAccountsBalance >= 0 ? 'text-flow-blue' : 'text-flow-red'}`}>
                  ₹{totalAccountsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border-flow-green-light">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-flow-green-light">
              <ArrowUp className="h-6 w-6 text-flow-green" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <h3 className="text-2xl font-bold text-flow-green">
                ₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                ₹{expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;