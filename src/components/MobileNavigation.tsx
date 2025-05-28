import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CreditCard, BarChart3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/transactions', icon: CreditCard, label: 'Transactions' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-bottom">
      <div className="flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Button
            key={path}
            variant="ghost"
            size="sm"
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
              location.pathname === path
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-gray-600"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileNavigation;