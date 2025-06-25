'use client';

import { useAuth } from '@/hooks/useAuth';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import { UserRole } from '@/types/user';

interface DashboardOverviewProps {
  role: UserRole;
}

export default function DashboardOverview({ role }: DashboardOverviewProps) {
  const { userProfile } = useAuth();
  
  const getRoleTitle = () => {
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
  
  const getRoleDescription = () => {
    switch (role) {
      case 'parent':
        return "Manage your children's profiles and access important features.";
      case 'admin':
        return 'Manage users, view alerts, and access system settings.';
      case 'authority':
        return 'View alerts, search for children, and manage reports.';
      case 'school':
        return 'Manage student profiles and view alerts.';
      case 'community':
        return 'Access community resources and view alerts.';
      default:
        return 'Welcome to your dashboard.';
    }
  };

  return (
    <div className="px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 mb-5 sm:mb-6 transition-all duration-200 hover:shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-auto">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 animate-fade-in">{getRoleTitle()}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome{userProfile?.displayName ? `, ${userProfile.displayName}` : ''}! {getRoleDescription()}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 flex-none">
            <a
              href={`/dashboard/${role}/profile`}
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </a>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="mb-5 sm:mb-6 animate-fade-in">
        <DashboardStats role={role} />
      </div>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 h-full transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
              <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center">
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <QuickActions role={role} />
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 h-full transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
              </h2>
              <a href={`/dashboard/${role}/activities`} className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center">
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <RecentActivity role={role} limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}