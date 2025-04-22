
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import TransactionForm from '@/components/transactions/TransactionForm';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply opacity-20 dark:bg-blue-700 dark:opacity-10 animate-blob"></div>
      <div className="absolute top-40 -right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply opacity-20 dark:bg-purple-700 dark:opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-30 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply opacity-20 dark:bg-green-700 dark:opacity-10 animate-blob animation-delay-4000"></div>

      {/* Logo and title with enhanced styling */}
      <div className="w-full max-w-md text-center z-10 mt-8 md:mt-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          MoneyFlow Diary
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 px-4">
          Track your income and expenses, analyze your spending habits, and take control of your finances.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-10 z-10">
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-md">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-4">
              <DollarSign className="h-6 w-6 text-blue-500 dark:text-blue-300" />
            </div>
            <h3 className="font-medium mb-2">Track Transactions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Record your daily expenses and income with ease</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-md">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mb-4">
              <BarChart3 className="h-6 w-6 text-purple-500 dark:text-purple-300" />
            </div>
            <h3 className="font-medium mb-2">View Reports</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get insights into your spending patterns</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-md">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-4">
              <PieChart className="h-6 w-6 text-green-500 dark:text-green-300" />
            </div>
            <h3 className="font-medium mb-2">Budget Better</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Make informed decisions for your financial future</p>
          </CardContent>
        </Card>
      </div>

      {/* Primary action button */}
      <Button 
        size="lg" 
        onClick={() => navigate('/dashboard')}
        className="relative px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full z-10 mb-28 md:mb-12"
      >
        Get Started <ArrowRight className="h-5 w-5 ml-2" />
      </Button>

      {/* Add Transaction floating button */}
      <div className="fixed bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20">
        <div className="animate-bounce bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-300">Add a transaction</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="h-16 w-16 rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 relative overflow-hidden group"
            >
              {/* Ripple effect on hover */}
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full opacity-30 group-hover:w-56 group-hover:h-56"></span>
              <Plus className="h-8 w-8 text-white relative z-10" />
              <span className="sr-only">Add Transaction</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <TransactionForm isDialog={true} onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
