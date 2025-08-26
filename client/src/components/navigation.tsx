import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plane, Menu, X, User, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', show: true },
    { href: '/booking', label: 'Book Flight', show: isAuthenticated && user?.role === 'customer' },
    { href: '/tickets', label: 'My Tickets', show: isAuthenticated && user?.role === 'customer' },
    { href: '/transactions', label: 'Transactions', show: isAuthenticated && user?.role === 'customer' },
    { href: '/dashboard', label: 'Employee Dashboard', show: isAuthenticated && user?.role === 'employee' },
  ];

  const visibleNavItems = navItems.filter(item => item.show);

  const NavLinks = ({ mobile = false, onItemClick }: { mobile?: boolean; onItemClick?: () => void }) => (
    <>
      {visibleNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          className={`${
            location === item.href
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
          } ${
            mobile
              ? 'block px-3 py-2 rounded-md text-base font-medium'
              : 'px-3 py-2 rounded-md text-sm font-medium transition-colors'
          }`}
          data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary" data-testid="logo">
              MACAirlines
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center space-x-2 text-red-600"
                    onClick={logout}
                    data-testid="logout-button"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="ghost" data-testid="signin-button">Sign In</Button>
                </Link>
                <Link href="/auth">
                  <Button data-testid="signup-button">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu-button">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile onItemClick={() => setIsMobileMenuOpen(false)} />

                  {!isAuthenticated && (
                    <div className="pt-4 border-t">
                      <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full mb-2">Sign In / Sign Up</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}