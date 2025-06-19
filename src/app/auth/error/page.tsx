'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('An authentication error occurred');
  
  useEffect(() => {
    const error = searchParams.get('error');
    const provider = searchParams.get('provider');
    
    if (error === 'CredentialsSignin') {
      setErrorMessage('Invalid email or password. Please try again.');
    } else if (error === 'OAuthAccountNotLinked') {
      setErrorMessage('This email is already associated with another account. Please sign in using a different method.');
    } else if (error === 'OAuthSignin') {
      setErrorMessage('Error signing in with social provider. Please try again.');
    } else if (error === 'AccessDenied') {
      setErrorMessage('Access denied. You do not have permission to access this resource.');
    } else if (error === 'Configuration') {
      setErrorMessage('Authentication service configuration error. Please contact support.');
    } else if (error) {
      setErrorMessage(`Authentication error: ${error}`);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Authentication Error</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {errorMessage}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/auth/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Login
            </Link>
            
            <Link 
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}