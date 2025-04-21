
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container py-8">
        <Outlet />
      </main>
      <footer className="border-t py-4 bg-white">
        <div className="container text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MoneyFlow Diary
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
