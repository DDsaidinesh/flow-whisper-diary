
import React from 'react';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SpendingChart from '@/components/analytics/SpendingChart';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
      
      <SummaryCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-6 md:space-y-8">
          <TransactionForm isDialog={false} />
          <SpendingChart />
        </div>
        <TransactionList />
      </div>
    </div>
  );
};

export default Dashboard;
