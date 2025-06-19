'use client';

import { useSession } from 'next-auth/react';

export default function SchoolDashboard() {
  const { data: session } = useSession();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">School Dashboard</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Welcome to the School Dashboard</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            This dashboard is for school users to manage students and track attendance.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <p>You are logged in as: <strong>{session?.user?.name}</strong></p>
          <p>Role: <strong>{(session?.user as any)?.role}</strong></p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Students</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Students enrolled in your school.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <p className="text-gray-500 italic">No students found.</p>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Attendance</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Recent attendance records.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <p className="text-gray-500 italic">No attendance records available.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <a 
          href="/auth-debug" 
          className="text-blue-600 hover:underline"
        >
          Back to Debug Page
        </a>
      </div>
    </div>
  );
}