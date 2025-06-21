'use client';

import { useSession } from 'next-auth/react';

export default function AuthorityDashboard() {
  const { data: session } = useSession();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authority Dashboard</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Welcome to the Authority Dashboard</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            This dashboard is for authority users to manage alerts and monitor children within your jurisdiction.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <p>You are logged in as: <strong>{session?.user?.name}</strong></p>
          <p>Role: <strong>{(session?.user as any)?.role}</strong></p>
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800">What is a Jurisdiction?</h3>
            <p className="mt-2 text-sm text-blue-700">
              Your jurisdiction represents the geographical area under your authority's responsibility. 
              This includes all registered children, schools, and alerts within your designated region.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-blue-700">
              <li>View and respond to alerts within your jurisdiction</li>
              <li>Access statistics on children and schools in your area</li>
              <li>Generate reports specific to your jurisdiction</li>
              <li>Coordinate with schools and parents in your region</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Alerts</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Recent alerts in your jurisdiction.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <p className="text-gray-500 italic">No alerts found.</p>
            <div className="mt-4">
              <a href="/dashboard/authority/alerts" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Alerts →
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Statistics</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Overview of children in your jurisdiction.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <p className="text-gray-500 italic">No statistics available.</p>
            <div className="mt-4">
              <a href="/dashboard/authority/reports" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Reports →
              </a>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
}