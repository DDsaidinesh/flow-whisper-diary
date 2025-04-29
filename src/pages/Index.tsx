
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Database, BarChart3, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { migrateLocalData } = useMoneyFlow();
  const { toast } = useToast();

  const handleMigration = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in first to migrate your data',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      await migrateLocalData();
    } catch (error: any) {
      toast({
        title: 'Migration failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 md:py-24">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Take Control of Your Finances
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto">
              MoneyFlow helps you track expenses, understand your spending habits, and achieve your financial goals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')} 
                size="lg" 
                className="text-lg"
              >
                Get Started
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              {isAuthenticated ? (
                <Button
                  onClick={handleMigration}
                  variant="outline" 
                  size="lg" 
                  className="text-lg bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Database className="mr-2 h-5 w-5" />
                  Migrate Local Data to Supabase
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/login')} 
                  variant="outline" 
                  size="lg" 
                  className="text-lg bg-white text-blue-600 hover:bg-gray-100"
                >
                  Already have an account? Log in
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Expense Tracking</h3>
                <p className="text-gray-600">
                  Easily log your transactions and categorize your spending to stay on top of where your money is going.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center p-4 bg-purple-100 rounded-full mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Visual Analytics</h3>
                <p className="text-gray-600">
                  Interactive charts and reports give you insights into your spending patterns and financial habits.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
                  <Database className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure Cloud Storage</h3>
                <p className="text-gray-600">
                  All your financial data is securely stored in the cloud, allowing you to access it from any device, anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
