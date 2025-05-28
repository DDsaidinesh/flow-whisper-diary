import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, LogIn, UserPlus, LogOut, BookOpen, Home, CreditCard, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userEmail, logout } = useAuth();

  const authenticatedNavItems = [
    { 
      label: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      description: 'Your financial overview'
    },
    { 
      label: 'Transactions', 
      href: '/transactions', 
      icon: CreditCard,
      description: 'Manage diary entries'
    },
    { 
      label: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
      description: 'Financial insights'
    },
  ];

  const getUserInitials = () => {
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MoneyDiary
            </h1>
            <p className="text-xs text-gray-500 -mt-1">Personal Finance Tracker</p>
          </div>
          <h1 className="sm:hidden text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MoneyDiary
          </h1>
        </Link>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader className="text-left pb-6">
                <SheetTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  MoneyDiary
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {userEmail?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    {authenticatedNavItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                            location.pathname === item.href
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                              : "hover:bg-gray-100 text-gray-700"
                          )}
                        >
                          <IconComponent className="h-4 w-4" />
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className={cn(
                              "text-sm",
                              location.pathname === item.href ? "text-blue-100" : "text-gray-500"
                            )}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}

                    <div className="border-t pt-4 mt-4">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 p-3 text-red-600 hover:text-red-700 hover:bg-red-50" 
                        onClick={logout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      <span className="font-medium">Login</span>
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span className="font-medium">Register</span>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-6">
            {/* Desktop Navigation */}
            <nav className="flex items-center gap-1">
              {isAuthenticated && authenticatedNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      location.pathname === item.href
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-700">
                      {userEmail?.split('@')[0] || 'Account'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{userEmail?.split('@')[0] || 'User'}</span>
                      <span className="text-xs font-normal text-gray-500">{userEmail}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="gap-2">
                    <Home className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="gap-2 text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;