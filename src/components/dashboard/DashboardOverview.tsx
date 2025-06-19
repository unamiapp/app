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
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">{getRoleTitle()}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome{userProfile?.displayName ? `, ${userProfile.displayName}` : ''}! {getRoleDescription()}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="mb-6">
        <DashboardStats role={role} />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
            </div>
            <QuickActions role={role} />
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
            </div>
            <RecentActivity role={role} limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}