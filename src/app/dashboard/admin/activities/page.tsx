'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  timestamp: string;
  status?: string;
}

export default function AdminActivitiesPage() {
  const { userProfile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // In a real implementation, this would be an API call
        // For now, we'll generate mock data
        const mockActivities: Activity[] = [];
        
        // Generate 20 mock activities
        for (let i = 0; i < 20; i++) {
          const types = ['user', 'alert', 'system', 'login', 'profile'];
          const type = types[Math.floor(Math.random() * types.length)];
          const statuses = ['success', 'info', 'warning'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          let title = '';
          let description = '';
          
          switch (type) {
            case 'user':
              title = 'User Management';
              description = ['New user created', 'User profile updated', 'User role changed'][Math.floor(Math.random() * 3)];
              break;
            case 'alert':
              title = 'Alert System';
              description = ['New alert created', 'Alert status updated', 'Alert resolved'][Math.floor(Math.random() * 3)];
              break;
            case 'system':
              title = 'System Update';
              description = ['System maintenance completed', 'Security update applied', 'Database optimized'][Math.floor(Math.random() * 3)];
              break;
            case 'login':
              title = 'Authentication';
              description = ['User login detected', 'Password reset requested', 'Failed login attempt'][Math.floor(Math.random() * 3)];
              break;
            case 'profile':
              title = 'Profile Management';
              description = ['Profile photo updated', 'Contact information changed', 'Settings updated'][Math.floor(Math.random() * 3)];
              break;
          }
          
          // Random time in the past (up to 7 days ago)
          const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString();
          
          mockActivities.push({
            id: `activity-${i}`,
            title,
            description,
            type,
            timestamp,
            status
          });
        }
        
        // Sort by timestamp (newest first)
        mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Apply filter if needed
        const filteredActivities = filter 
          ? mockActivities.filter(activity => activity.type === filter)
          : mockActivities;
        
        setActivities(filteredActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [filter]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'alert':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      case 'login':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      case 'profile':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Success
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Warning
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Info
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Recent Activities</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all recent activities and system events.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="inline-flex rounded-md shadow-sm mb-6">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-l-md ${!filter ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('user')}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium ${filter === 'user' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          >
            Users
          </button>
          <button
            type="button"
            onClick={() => setFilter('alert')}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium ${filter === 'alert' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          >
            Alerts
          </button>
          <button
            type="button"
            onClick={() => setFilter('system')}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium ${filter === 'system' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          >
            System
          </button>
          <button
            type="button"
            onClick={() => setFilter('login')}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md ${filter === 'login' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          >
            Login
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <li key={activity.id} className="px-6 py-4">
              <div className="flex items-center">
                {getActivityIcon(activity.type)}
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                    {getStatusBadge(activity.status)}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">{activity.description}</div>
                  <div className="mt-1 text-xs text-gray-500">{formatDate(activity.timestamp)}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}