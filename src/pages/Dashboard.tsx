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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's your financial overview.</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading your financial data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
      </div>
      
      {/* Summary Cards Section */}
      <section>
        <SummaryCards />
      </section>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Transaction Form & Account Selector */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TransactionForm />
            {accounts.length > 0 && <AccountSelector />}
          </section>
          
          {/* Spending Chart */}
          <section>
            <SpendingChart />
          </section>
        </div>
        
        {/* Right Column - Transaction List */}
        <div className="lg:col-span-1">
          <section className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-hidden">
            <TransactionList />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;