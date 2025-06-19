'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // Redirect will be handled by the logout function
      } catch (error) {
        console.error('Error during logout:', error);
        // If there's an error, redirect to login page anyway
        router.push('/auth/login');
      }
    };
    
    performLogout();
  }, [logout, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Logging out...</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we log you out.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
}