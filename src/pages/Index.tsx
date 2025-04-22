
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply opacity-20 dark:bg-blue-700 dark:opacity-10 animate-blob"></div>
      <div className="absolute top-1/2 -right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply opacity-20 dark:bg-purple-700 dark:opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply opacity-20 dark:bg-green-700 dark:opacity-10 animate-blob animation-delay-4000"></div>

      {/* Main content container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8 md:gap-12 z-10">
        {/* Hero section */}
        <div className="text-center space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 leading-tight">
            MoneyFlow Diary
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mx-auto max-w-xl">
            Track your income and expenses, analyze your spending habits, and take control of your finances.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="flex flex-col items-center p-6 text-center h-full">
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
                <DollarSign className="h-6 w-6 text-blue-500 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Transactions</h3>
              <p className="text-gray-500 dark:text-gray-400">Record your daily expenses and income with ease</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="flex flex-col items-center p-6 text-center h-full">
              <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full mb-4">
                <BarChart3 className="h-6 w-6 text-purple-500 dark:text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">View Reports</h3>
              <p className="text-gray-500 dark:text-gray-400">Get insights into your spending patterns</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:shadow-xl sm:col-span-2 lg:col-span-1">
            <CardContent className="flex flex-col items-center p-6 text-center h-full">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-4">
                <PieChart className="h-6 w-6 text-green-500 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Budget Better</h3>
              <p className="text-gray-500 dark:text-gray-400">Make informed decisions for your financial future</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <Button 
          size="lg" 
          onClick={() => navigate('/dashboard')}
          className="relative px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
        >
          Get Started <ArrowRight className="h-5 w-5 ml-2" />
        </Button>

        {/* Add Transaction floating button */}
        <div className="fixed bottom-8 right-8 z-20">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button 
              size="lg"
              onClick={() => setIsDialogOpen(true)}
              className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-6 w-6 text-white" />
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

        {/* Footer */}
        <footer className="text-sm text-gray-500 dark:text-gray-400 mt-auto">
          © {new Date().getFullYear()} MoneyFlow Diary
        </footer>
      </div>
    </div>
  );
};

export default Index;
