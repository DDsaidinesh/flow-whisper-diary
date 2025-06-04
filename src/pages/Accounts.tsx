import React from 'react';
import AccountsManagement from '@/components/accounts/AccountsManagement';

const Accounts: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <p className="text-muted-foreground">
          Manage your financial accounts, track balances, and organize your money across different account types.
        </p>
      </div>
      
      <AccountsManagement />
    </div>
  );
};

export default Accounts;