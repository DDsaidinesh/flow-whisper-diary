
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
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
    </div>
  );
};

export default Index;
