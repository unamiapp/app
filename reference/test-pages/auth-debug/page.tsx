'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Check for environment variables
    const checkEnvVars = async () => {
      try {
        const response = await fetch('/api/debug/env');
        const data = await response.json();
        setEnvVars(data.env || {});
      } catch (error) {
        console.error('Error checking env vars:', error);
      }
    };
    
    checkEnvVars();
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Session Status</h2>
        <p><strong>Status:</strong> {status}</p>
        {status === 'loading' && <p>Loading session...</p>}
        {status === 'authenticated' && (
          <div>
            <p className="text-green-600 font-semibold">Authenticated!</p>
            <pre className="bg-gray-800 text-white p-4 rounded mt-2 overflow-auto max-h-60">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}
        {status === 'unauthenticated' && (
          <p className="text-red-600">Not authenticated</p>
        )}
      </div>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <p><strong>NEXTAUTH_SECRET:</strong> {envVars.NEXTAUTH_SECRET ? 'Set' : 'Not set'}</p>
        <p><strong>NEXTAUTH_URL:</strong> {envVars.NEXTAUTH_URL || 'Not set'}</p>
        <p><strong>FIREBASE_SERVICE_ACCOUNT_PROJECT_ID:</strong> {envVars.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID ? 'Set' : 'Not set'}</p>
      </div>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Login
          </Link>
          <Link href="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Go to Home
          </Link>
          <Link href="/api/auth/signin" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            NextAuth Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}