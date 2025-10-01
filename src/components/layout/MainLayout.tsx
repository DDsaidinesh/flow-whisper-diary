import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { BookOpen } from 'lucide-react';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>
      <footer className="border-t bg-card mt-12">
        <div className="container max-w-7xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">MoneyDiary</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MoneyDiary - Your Personal Finance Journal
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Track, Analyze, and Grow Your Wealth
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;