'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TestAuth() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    fetch('/api/debug/session')
      .then(res => res.json())
      .then(data => setDebugInfo(data))
      .catch(err => console.error('Debug fetch error:', err));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Client Session</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</p>
            {session?.user && (
              <>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Name:</strong> {session.user.name}</p>
                <p><strong>Role:</strong> {(session.user as any)?.role}</p>
                <p><strong>ID:</strong> {(session.user as any)?.id}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Server Session</h2>
          {debugInfo ? (
            <div className="space-y-2">
              <p><strong>Success:</strong> {debugInfo.success ? 'Yes' : 'No'}</p>
              <p><strong>Has Session:</strong> {debugInfo.hasSession ? 'Yes' : 'No'}</p>
              {debugInfo.user && (
                <>
                  <p><strong>Email:</strong> {debugInfo.user.email}</p>
                  <p><strong>Name:</strong> {debugInfo.user.name}</p>
                  <p><strong>Role:</strong> {debugInfo.user.role}</p>
                  <p><strong>ID:</strong> {debugInfo.user.id}</p>
                </>
              )}
              {debugInfo.error && (
                <p className="text-red-600"><strong>Error:</strong> {debugInfo.error}</p>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}