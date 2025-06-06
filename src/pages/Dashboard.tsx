import React from 'react';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SpendingChart from '@/components/analytics/SpendingChart';
import AccountSelector from '@/components/dashboard/AccountSelector';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isLoading, accounts } = useMoneyFlow();

  if (isLoading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading your financial data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
      
      <SummaryCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column - Forms and Charts */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TransactionForm />
            {accounts.length > 0 && <AccountSelector />}
          </div>
          <SpendingChart />
        </div>
        
        {/* Right Column - Transaction List */}
        <div className="lg:col-span-4">
          <TransactionList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;