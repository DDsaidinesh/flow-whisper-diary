
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply opacity-20 dark:bg-blue-700 dark:opacity-10 animate-blob"></div>
      <div className="absolute top-40 -right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply opacity-20 dark:bg-purple-700 dark:opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-30 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply opacity-20 dark:bg-green-700 dark:opacity-10 animate-blob animation-delay-4000"></div>

      {/* Logo and title with enhanced styling */}
      <div className="w-full max-w-md text-center z-10 mt-4 md:mt-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          MoneyFlow Diary
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-8 px-2 md:px-4">
          Track your income and expenses, analyze your spending habits, and take control of your finances.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full max-w-4xl mb-8 z-10 px-2">
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-md">
          <CardContent className="flex flex-col items-center p-4 sm:p-6 text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-3">
              <DollarSign className="h-5 w-5 text-blue-500 dark:text-blue-300" />
            </div>
            <h3 className="font-medium mb-1">Track Transactions</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Record your daily expenses and income with ease</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-md">
          <CardContent className="flex flex-col items-center p-4 sm:p-6 text-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mb-3">
              <BarChart3 className="h-5 w-5 text-purple-500 dark:text-purple-300" />
            </div>
            <h3 className="font-medium mb-1">View Reports</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Get insights into your spending patterns</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-md sm:col-span-2 lg:col-span-1">
          <CardContent className="flex flex-col items-center p-4 sm:p-6 text-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-3">
              <PieChart className="h-5 w-5 text-green-500 dark:text-green-300" />
            </div>
            <h3 className="font-medium mb-1">Budget Better</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Make informed decisions for your financial future</p>
          </CardContent>
        </Card>
      </div>

      {/* Primary action button */}
      <Button 
        size="lg" 
        onClick={() => navigate('/dashboard')}
        className="relative px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full z-10 mb-16 md:mb-10"
      >
        Get Started <ArrowRight className="h-4 w-4 ml-2" />
      </Button>

      {/* Add Transaction floating button */}
      <div className="fixed bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 z-20">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button 
            size="lg"
            onClick={() => setIsDialogOpen(true)}
            className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 relative overflow-hidden group"
          >
            {/* Ripple effect on hover */}
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full opacity-30 group-hover:w-56 group-hover:h-56"></span>
            <Plus className="h-7 w-7 text-white relative z-10" />
            <span className="sr-only">Add Transaction</span>
          </Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogDescription className="sr-only">
              Add a new transaction
            </DialogDescription>
            <TransactionForm isDialog={true} onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
