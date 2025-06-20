'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ChildrenTestPage() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('ChildrenTestPage: Fetching data');
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      
      // Fetch from debug API
      fetch('/api/debug/children')
        .then(response => {
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Debug API data:', data);
          setChildren(data.children || []);
        })
        .catch(err => {
          console.error('Error fetching children:', err);
          setError(err.message);
        });
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading children: {error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Children Test Page</h1>
          <p className="mt-2 text-sm text-gray-700">
            Simple test page to display children
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/parent/children"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Go to Regular Children Page
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Debug Information</h2>
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
          <p>Children count: {children.length}</p>
        </div>
      </div>

      <div className="mt-8">
        {children.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No children found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <div key={child.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {child.photoURL ? (
                        <img className="h-16 w-16 rounded-full" src={child.photoURL} alt="" />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-700">
                            {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {child.firstName} {child.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {child.gender}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}