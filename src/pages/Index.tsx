
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, UserPlus, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply opacity-20 dark:bg-blue-700 dark:opacity-10 animate-blob"></div>
      <div className="absolute top-1/2 -right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply opacity-20 dark:bg-purple-700 dark:opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply opacity-20 dark:bg-green-700 dark:opacity-10 animate-blob animation-delay-4000"></div>

      {/* Main content container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8 md:gap-12 z-10">
        {/* Hero section */}
        <div className="text-center space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 leading-tight">
            MoneyFlow Diary
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mx-auto max-w-xl">
            Track your income and expenses, analyze your spending habits, and take control of your finances.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
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
          
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="flex flex-col items-center p-6 text-center h-full">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-4">
                <PieChart className="h-6 w-6 text-green-500 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Budget Better</h3>
              <p className="text-gray-500 dark:text-gray-400">Make informed decisions for your financial future</p>
            </CardContent>
          </Card>
        </div>

        {/* Auth buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          {isAuthenticated ? (
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
            >
              Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <>
              <Button 
                size="lg" 
                onClick={() => navigate('/login')}
                className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
              >
                Login <LogIn className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/register')}
                className="px-8 py-6 text-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
              >
                Register <UserPlus className="ml-2 h-5 w-5" />
              </Button>
            </>
          )}
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
