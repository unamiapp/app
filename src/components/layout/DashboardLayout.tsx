'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const role = userProfile?.role || 'parent';
    
    const commonItems = [
      { name: 'Dashboard', href: `/dashboard/${role}`, icon: 'home' },
    ];
    
    const roleSpecificItems = {
      parent: [
        { name: 'My Children', href: '/dashboard/parent/children', icon: 'users' },
        { name: 'Report Missing', href: '/dashboard/parent/report', icon: 'alert-triangle' },
        { name: 'Resources', href: '/dashboard/parent/resources', icon: 'book' },
        { name: 'Alerts', href: '/dashboard/parent/alerts', icon: 'bell' },
        { name: 'Settings', href: '/dashboard/parent/settings', icon: 'settings' },
      ],
      school: [
        { name: 'Students', href: '/dashboard/school/students', icon: 'users' },
        { name: 'Alerts', href: '/dashboard/school/alerts', icon: 'bell' },
        { name: 'Reports', href: '/dashboard/school/reports', icon: 'file-text' },
        { name: 'Settings', href: '/dashboard/school/settings', icon: 'settings' },
      ],
      authority: [
        { name: 'Alerts', href: '/dashboard/authority/alerts', icon: 'alert-triangle' },
        { name: 'Search', href: '/dashboard/authority/search', icon: 'search' },
        { name: 'Reports', href: '/dashboard/authority/reports', icon: 'file-text' },
        { name: 'Settings', href: '/dashboard/authority/settings', icon: 'settings' },
      ],
      community: [
        { name: 'Community Alerts', href: '/dashboard/community/alerts', icon: 'alert-triangle' },
        { name: 'Resources', href: '/dashboard/community/resources', icon: 'book' },
        { name: 'Reports', href: '/dashboard/community/reports', icon: 'file-text' },
        { name: 'Settings', href: '/dashboard/community/settings', icon: 'settings' },
      ],
      admin: [
        { name: 'Users', href: '/dashboard/admin/users', icon: 'users' },
        { name: 'Alerts', href: '/dashboard/admin/alerts', icon: 'alert-triangle' },
        { name: 'Reports', href: '/dashboard/admin/reports', icon: 'file-text' },
        { name: 'Settings', href: '/dashboard/admin/settings', icon: 'settings' },
      ],
    };
    
    return [...commonItems, ...(roleSpecificItems[role] || [])];
  };

  const navigationItems = getNavigationItems();

  // Icon component based on name
  const Icon = ({ name }: { name: string }) => {
    const icons: Record<string, JSX.Element> = {
      home: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      users: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bell: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      'alert-triangle': (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      search: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      book: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      'file-text': (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      settings: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };
    
    return icons[name] || null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setIsMobileMenuOpen(false)}></div>
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-700">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4 py-5 border-b border-indigo-800">
            <h1 className="text-2xl font-bold text-white">UNCIP</h1>
          </div>
          
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${ 
                    pathname === item.href
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  <div className="mr-4 flex-shrink-0 text-indigo-300 group-hover:text-indigo-100">{Icon({ name: item.icon })}</div>
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* User profile fixed at bottom */}
            <div className="mt-auto flex-shrink-0 flex border-t border-indigo-800 p-4 sticky bottom-0 bg-indigo-700">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    {userProfile?.displayName?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-base font-medium text-white truncate">
                    {userProfile?.displayName || 'User'}
                  </p>
                  <p className="text-sm font-medium text-indigo-200 truncate">
                    {userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1) || 'User'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto flex-shrink-0 bg-indigo-700 p-1 rounded-full text-indigo-200 hover:text-white"
                  title="Logout"
                >
                  <span className="sr-only">Logout</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-700">
          <div className="flex items-center flex-shrink-0 px-4 py-5 border-b border-indigo-800">
            <h1 className="text-2xl font-bold text-white">UNCIP</h1>
          </div>
          
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  <div className="mr-3 flex-shrink-0 text-indigo-300 group-hover:text-indigo-100">{Icon({ name: item.icon })}</div>
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* User profile fixed at bottom */}
            <div className="mt-auto flex-shrink-0 flex border-t border-indigo-800 p-4 sticky bottom-0 bg-indigo-700">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    {userProfile?.displayName?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {userProfile?.displayName || 'User'}
                  </p>
                  <p className="text-xs font-medium text-indigo-200 truncate">
                    {userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1) || 'User'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto flex-shrink-0 bg-indigo-700 p-1 rounded-full text-indigo-200 hover:text-white"
                  title="Logout"
                >
                  <span className="sr-only">Logout</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white shadow-sm border-b border-gray-200">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-4 inline-flex items-center">
            <h1 className="text-lg font-bold text-indigo-600">UNCIP</h1>
          </div>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}