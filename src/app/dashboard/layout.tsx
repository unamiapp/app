'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import RoleSwitcher from '@/components/RoleSwitcher';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Set a timeout to prevent immediate rendering which causes flickering
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get role title for header
  const getRoleTitle = (role: string): string => {
    switch (role) {
      case 'parent':
        return 'Parent Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      case 'authority':
        return 'Authority Dashboard';
      case 'school':
        return 'School Dashboard';
      case 'community':
        return 'Community Dashboard';
      default:
        return 'Dashboard';
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <div className="w-64 bg-white border-r border-slate-200 hidden md:block">
          <div className="h-16 border-b border-slate-200 flex items-center px-6">
            <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="p-4 flex-grow">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 mb-2 bg-slate-100 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-20 mb-1 animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6">
            <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="h-8 bg-slate-200 rounded w-64 mb-4 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-full max-w-2xl mb-8 animate-pulse"></div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
                <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Get user role from profile
  const userRole = userProfile?.role || 'guest';
  
  // Define navigation based on user role
  const getNavigation = () => {
    switch (userRole) {
      case 'parent':
        return [
          { name: 'Dashboard', href: '/dashboard/parent' },
          { name: 'Children', href: '/dashboard/parent/children' },
          { name: 'Alerts', href: '/dashboard/parent/alerts' },
          { name: 'Report', href: '/dashboard/parent/report' },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', href: '/dashboard/admin' },
          { name: 'Users', href: '/dashboard/admin/users' },
          { name: 'Alerts', href: '/dashboard/admin/alerts' },
          { name: 'Reports', href: '/dashboard/admin/reports' },
          { name: 'Settings', href: '/dashboard/admin/settings' },
        ];
      case 'authority':
        return [
          { name: 'Dashboard', href: '/dashboard/authority' },
          { name: 'Alerts', href: '/dashboard/authority/alerts' },
          { name: 'Search', href: '/dashboard/authority/search' },
          { name: 'Reports', href: '/dashboard/authority/reports' },
        ];
      case 'school':
        return [
          { name: 'Dashboard', href: '/dashboard/school' },
          { name: 'Students', href: '/dashboard/school/students' },
          { name: 'Alerts', href: '/dashboard/school/alerts' },
        ];
      case 'community':
        return [
          { name: 'Dashboard', href: '/dashboard/community' },
          { name: 'Alerts', href: '/dashboard/community/alerts' },
          { name: 'Resources', href: '/dashboard/community/resources' },
        ];
      default:
        return [];
    }
  };
  
  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-slate-50 flex prevent-flicker">
      {/* Sidebar for desktop */}
      <div className="w-64 bg-white border-r border-slate-200 hidden md:flex md:flex-col">
        <div className="h-16 border-b border-slate-200 flex items-center px-6">
          <Link href="/" className="text-xl font-semibold text-indigo-600">UNCIP App</Link>
        </div>
        <nav className="p-4 flex-grow">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-4 py-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-indigo-600 mb-1"
            >
              {item.name}
            </Link>
          ))}
          
          {/* Role Switcher */}
          <div className="mt-6 border-t border-slate-200 pt-4">
            <RoleSwitcher />
          </div>
        </nav>
        
        {/* User profile at the bottom of sidebar */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              {userProfile?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {userProfile?.displayName || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {userProfile?.role || 'Guest'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-slate-700 mr-4"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-medium text-slate-600">
              {getRoleTitle(userProfile?.role || 'guest')}
            </span>
          </div>
          
          {/* Logout button for mobile */}
          <div className="md:hidden">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <nav className="px-4 py-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-indigo-600 mb-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Role Switcher in mobile menu */}
              <div className="mt-4 border-t border-slate-200 pt-4 px-4">
                <RoleSwitcher />
              </div>
              
              {/* User info in mobile menu */}
              <div className="mt-4 border-t border-slate-200 pt-4 px-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    {userProfile?.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {userProfile?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {userProfile?.role || 'Guest'}
                    </p>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}
        
        <div className="p-6 flex-1">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}