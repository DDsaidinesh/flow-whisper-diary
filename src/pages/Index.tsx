
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LineChart, PiggyBank, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="space-y-12 py-8">
      {/* Hero section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Track Your <span className="text-blue-500">Money Flow</span> With Ease
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A simple, intuitive app to track your income, expenses, and analyze your spending habits.
        </p>
        <div className="flex justify-center gap-4">
          {isAuthenticated ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">
                Go to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link to="/register">
                  Get Started <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features section */}
      <section className="py-8">
        <h2 className="text-3xl font-bold text-center mb-10">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Wallet className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Transactions</h3>
              <p className="text-gray-600">
                Easily record your income and expenses with just a few clicks.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <LineChart className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Analyze Spending</h3>
              <p className="text-gray-600">
                Visualize your spending patterns with intuitive charts and graphs.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <PiggyBank className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Financial Insights</h3>
              <p className="text-gray-600">
                Get insights into your financial habits and make informed decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-blue-50 py-12 px-4 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to take control of your finances?</h2>
        <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of users who have improved their financial habits with MoneyFlow.
        </p>
        {isAuthenticated ? (
          <Button size="lg" asChild>
            <Link to="/dashboard">
              Go to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button size="lg" asChild>
            <Link to="/register">
              Create Free Account <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </section>
    </div>
  );
};

export default Index;
