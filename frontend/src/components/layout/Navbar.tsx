'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, LogOut, Keyboard, Menu, X, LayoutDashboard, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useCartStore } from '@/store';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCartStore();

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
  ];

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') return { href: '/admin/dashboard', label: 'Admin Dashboard' };
    if (user.role === 'SELLER') return { href: '/seller/dashboard', label: 'Seller Dashboard' };
    return null;
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Keyboard className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">KeyboardHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  pathname === link.href ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {dashboardLink && (
              <Link
                href={dashboardLink.href}
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary-600 ${
                  pathname.startsWith(dashboardLink.href) ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/cart" className="relative">
                  <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-primary-600" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {cartItemCount}
                    </Badge>
                  )}
                </Link>
                
                <Link href="/orders">
                  <Package className="h-6 w-6 text-gray-600 hover:text-primary-600" />
                </Link>
                
                <div className="hidden md:flex md:items-center md:gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user?.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {user?.role}
                  </Badge>
                </div>
                
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-200 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium ${
                    pathname === link.href ? 'text-primary-600' : 'text-gray-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {dashboardLink && (
                <Link
                  href={dashboardLink.href}
                  className="text-sm font-medium text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {dashboardLink.label}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
