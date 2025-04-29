
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, LogIn, UserPlus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userEmail, logout } = useAuth();

  const authenticatedNavItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Transactions', href: '/transactions' },
    { label: 'Analytics', href: '/analytics' },
  ];

  const unauthenticatedNavItems = [
    { label: 'Login', href: '/login', icon: <LogIn className="mr-2 h-4 w-4" /> },
    { label: 'Register', href: '/register', icon: <UserPlus className="mr-2 h-4 w-4" /> },
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-blue-500">
            <Link to="/">MoneyFlow</Link>
          </h1>
        </div>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {isAuthenticated ? (
                  <>
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="text-lg font-medium transition-colors hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Button 
                      variant="ghost" 
                      className="justify-start p-2 mt-4" 
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    {unauthenticatedNavItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-center text-lg font-medium transition-colors hover:text-primary"
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === item.href && "text-primary font-semibold"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-4">
                    {userEmail?.split('@')[0] || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  <UserPlus className="mr-2 h-4 w-4" /> Register
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
