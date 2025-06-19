'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [responseDetails, setResponseDetails] = useState<any>(null);

  useEffect(() => {
    // Fetch the JWT token
    const getToken = async () => {
      try {
        const response = await fetch('/api/auth/token');
        if (response.ok) {
          const data = await response.json();
          setToken(data);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    if (status === 'authenticated') {
      getToken();
    }
  }, [status]);

  const testUserCreation = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      setApiResponse(null);
      setRequestDetails(null);
      setResponseDetails(null);
      
      const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'Password123!',
        displayName: 'Test User',
        role: 'parent',
        phoneNumber: '1234567890'
      };
      
      setRequestDetails({
        url: '/api/admin-sdk/users',
        method: 'POST',
        body: testUser
      });
      
      const response = await fetch('/api/admin-sdk/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser),
      });
      
      const data = await response.json();
      
      setResponseDetails({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });
      
      if (!response.ok) {
        setApiError(`Error ${response.status}: ${data.error || data.message || 'Unknown error'}`);
      } else {
        setApiResponse(data);
      }
    } catch (error: any) {
      setApiError(`Exception: ${error.message}`);
      setResponseDetails({ error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  const testChildCreation = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      setApiResponse(null);
      setRequestDetails(null);
      setResponseDetails(null);
      
      const testChild = {
        firstName: `TestChild-${Date.now()}`,
        lastName: 'TestLastName',
        dateOfBirth: '2020-01-01',
        gender: 'male',
        guardians: (session?.user as any)?.id ? [(session?.user as any).id] : []
      };
      
      setRequestDetails({
        url: '/api/admin-sdk/children',
        method: 'POST',
        body: testChild
      });
      
      const response = await fetch('/api/admin-sdk/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testChild),
      });
      
      const data = await response.json();
      
      setResponseDetails({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });
      
      if (!response.ok) {
        setApiError(`Error ${response.status}: ${data.error || data.message || 'Unknown error'}`);
      } else {
        setApiResponse(data);
      }
    } catch (error: any) {
      setApiError(`Exception: ${error.message}`);
      setResponseDetails({ error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Status:</strong> {status}</p>
          
          {status === 'unauthenticated' && (
            <button 
              onClick={() => signIn('credentials', { 
                email: 'info@unamifoundation.org',
                password: 'admin123',
                role: 'admin',
                callbackUrl: '/auth-debug'
              })}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign in as Admin
            </button>
          )}
          
          {status === 'authenticated' && (
            <button 
              onClick={() => signOut({ callbackUrl: '/auth-debug' })}
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
      
      {session && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Session Data</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {token && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">JWT Token</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <pre>{JSON.stringify(token, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test API Endpoints</h2>
        <div className="flex space-x-4">
          <button 
            onClick={testUserCreation}
            disabled={isLoading || status !== 'authenticated'}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Create Test User'}
          </button>
          
          <button 
            onClick={testChildCreation}
            disabled={isLoading || status !== 'authenticated'}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Create Test Child'}
          </button>
        </div>
        
        {status !== 'authenticated' && (
          <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">Authentication Required</p>
            <p>You need to sign in before testing the API endpoints.</p>
          </div>
        )}
        
        {requestDetails && (
          <div className="mt-4">
            <h3 className="font-semibold">Request Details:</h3>
            <div className="bg-gray-100 p-4 rounded overflow-auto mt-2">
              <pre>{JSON.stringify(requestDetails, null, 2)}</pre>
            </div>
          </div>
        )}
        
        {responseDetails && (
          <div className="mt-4">
            <h3 className="font-semibold">Response Details:</h3>
            <div className="bg-gray-100 p-4 rounded overflow-auto mt-2">
              <pre>{JSON.stringify(responseDetails, null, 2)}</pre>
            </div>
          </div>
        )}
        
        {apiError && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{apiError}</p>
          </div>
        )}
        
        {apiResponse && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold">Success</p>
            <pre className="overflow-auto">{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Dashboard Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a 
            href="/dashboard/admin" 
            className="block p-4 bg-blue-100 hover:bg-blue-200 rounded text-center"
          >
            Admin Dashboard
          </a>
          <a 
            href="/dashboard/parent" 
            className="block p-4 bg-green-100 hover:bg-green-200 rounded text-center"
          >
            Parent Dashboard
          </a>
          <a 
            href="/dashboard/school" 
            className="block p-4 bg-yellow-100 hover:bg-yellow-200 rounded text-center"
          >
            School Dashboard
          </a>
          <a 
            href="/dashboard/authority" 
            className="block p-4 bg-purple-100 hover:bg-purple-200 rounded text-center"
          >
            Authority Dashboard
          </a>
          <a 
            href="/dashboard/community" 
            className="block p-4 bg-pink-100 hover:bg-pink-200 rounded text-center"
          >
            Community Dashboard
          </a>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Other Links</h2>
        <ul className="list-disc pl-5">
          <li><a href="/" className="text-blue-600 hover:underline">Home</a></li>
          <li><a href="/auth/login" className="text-blue-600 hover:underline">Login</a></li>
        </ul>
      </div>
    </div>
  );
}