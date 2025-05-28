import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { BookOpen } from 'lucide-react';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="pb-8">
        <Outlet />
      </main>
      <footer className="border-t bg-white/80 backdrop-blur-sm py-6">
        <div className="container px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-gray-900">MoneyDiary</span>
          </div>
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} MoneyDiary - Your Personal Finance Journal
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Track, Analyze, and Grow Your Wealth
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;