
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TransactionForm from '@/components/transactions/TransactionForm';

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 relative">
      <h1 className="text-4xl font-bold mb-6">Welcome to MoneyFlow Diary</h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-8">
        Track your income and expenses, analyze your spending habits, and take control of your finances.
      </p>
      
      <Button 
        size="lg" 
        onClick={() => navigate('/dashboard')}
        className="gap-2"
      >
        Get Started <ArrowRight className="h-5 w-5" />
      </Button>

      {/* Add Transaction Button with Pulse Animation */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <p className="text-sm text-gray-600 animate-bounce">Click here to add a transaction</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg animate-pulse hover:animate-none"
            >
              <Plus className="h-6 w-6" />
              <span className="sr-only">Add Transaction</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
