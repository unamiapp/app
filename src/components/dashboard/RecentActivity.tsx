'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@/types/user';

interface RecentActivityProps {
  role: UserRole;
  limit?: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  timestamp: string;
  status?: string;
}

export default function RecentActivity({ role, limit = 5 }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use a direct API call to fetch real activities
    const fetchActivities = async () => {
      try {
        // Use the debug API for reliable data access
        const response = await fetch(`/api/debug/activities?role=${role}&limit=${limit}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.activities) {
            setActivities(data.activities);
            console.log(`RecentActivity: Loaded ${data.activities.length} activities for ${role} role`);
          } else {
            // Fallback to mock data if API returns no activities
            const mockData = generateMockActivities(role, limit);
            setActivities(mockData);
            console.log(`RecentActivity: Using mock data (${mockData.length} activities)`);
          }
        } else {
          // Fallback to mock data if API fails
          const mockData = generateMockActivities(role, limit);
          setActivities(mockData);
          console.log(`RecentActivity: API failed, using mock data (${mockData.length} activities)`);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Fallback to mock data on error
        const mockData = generateMockActivities(role, limit);
        setActivities(mockData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
    
    // Set up a polling interval for real-time updates
    const intervalId = setInterval(() => {
      fetchActivities();
    }, 10000); // Refresh every 10 seconds for more responsive updates
    
    return () => {
      clearInterval(intervalId);
    };
  }, [role, limit]);
  
  // Generate role-specific mock activities
  const generateMockActivities = (role: UserRole, limit: number): Activity[] => {
    const baseActivities: Activity[] = [
      {
        id: '1',
        title: 'Profile Updated',
        description: 'Child profile information was updated',
        type: 'profile',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'success'
      },
      {
        id: '2',
        title: 'Login Activity',
        description: 'Successful login from new device',
        type: 'login',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: 'info'
      }
    ];
    
    // Add role-specific activities
    switch (role) {
      case 'admin':
        baseActivities.push(
          {
            id: '3',
            title: 'New User Created',
            description: 'A new school administrator account was created',
            type: 'user',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            status: 'success'
          },
          {
            id: '4',
            title: 'Alert Resolved',
            description: 'Missing child alert was resolved successfully',
            type: 'alert',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            status: 'success'
          },
          {
            id: '5',
            title: 'System Update',
            description: 'System maintenance completed',
            type: 'system',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            status: 'success'
          }
        );
        break;
      case 'parent':
        baseActivities.push(
          {
            id: '3',
            title: 'Child Profile Added',
            description: 'New child profile was created successfully',
            type: 'profile',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            status: 'success'
          },
          {
            id: '4',
            title: 'School Update',
            description: 'School information was updated for your child',
            type: 'school',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            status: 'info'
          }
        );
        break;
      case 'authority':
        baseActivities.push(
          {
            id: '3',
            title: 'New Alert',
            description: 'New missing child alert in your jurisdiction',
            type: 'alert',
            timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
            status: 'warning'
          },
          {
            id: '4',
            title: 'Case Updated',
            description: 'Case #2458 status changed to In Progress',
            type: 'case',
            timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
            status: 'info'
          }
        );
        break;
      case 'school':
        baseActivities.push(
          {
            id: '3',
            title: 'Attendance Updated',
            description: 'Daily attendance records were submitted',
            type: 'attendance',
            timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
            status: 'success'
          },
          {
            id: '4',
            title: 'Student Registered',
            description: 'New student registration was completed',
            type: 'student',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
            status: 'success'
          }
        );
        break;
      default:
        // Add generic activities for other roles
        baseActivities.push(
          {
            id: '3',
            title: 'System Update',
            description: 'System maintenance completed',
            type: 'system',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            status: 'success'
          }
        );
    }
    
    // Sort by timestamp (newest first) and limit
    return baseActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };
  
  // Generate a random activity for real-time updates
  const generateRandomActivity = (role: UserRole): Activity => {
    const activityTypes = {
      admin: ['user', 'alert', 'system', 'login'],
      parent: ['profile', 'school', 'login'],
      authority: ['alert', 'case', 'login'],
      school: ['attendance', 'student', 'login'],
      community: ['alert', 'resource', 'login']
    };
    
    const randomType = activityTypes[role]?.[Math.floor(Math.random() * activityTypes[role].length)] || 'system';
    
    const activityTitles: {[key: string]: string[]} = {
      user: ['New User Created', 'User Updated', 'Role Changed'],
      alert: ['New Alert', 'Alert Updated', 'Alert Resolved'],
      system: ['System Update', 'Maintenance Scheduled', 'Security Update'],
      login: ['Login Activity', 'Password Changed', 'Security Check'],
      profile: ['Profile Updated', 'Photo Updated', 'Information Changed'],
      school: ['School Update', 'Teacher Message', 'Schedule Change'],
      case: ['Case Updated', 'New Evidence', 'Status Changed'],
      attendance: ['Attendance Updated', 'Absence Reported', 'Late Arrival'],
      student: ['Student Registered', 'Student Information Updated', 'Grade Updated'],
      resource: ['Resource Added', 'Document Updated', 'New Information']
    };
    
    const randomTitle = activityTitles[randomType]?.[Math.floor(Math.random() * activityTitles[randomType].length)] || 'System Update';
    
    return {
      id: `new-${Date.now()}`,
      title: randomTitle,
      description: `${randomTitle.toLowerCase()} at ${new Date().toLocaleTimeString()}`,
      type: randomType,
      timestamp: new Date().toISOString(),
      status: Math.random() > 0.7 ? 'warning' : 'info'
    };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'profile':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'login':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      case 'alert':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'user':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      case 'school':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      case 'case':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'attendance':
      case 'student':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'resource':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-3">
            <div className="rounded-full bg-gray-200 h-8 w-8"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-2 text-gray-500 text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex space-x-3">
          {getActivityIcon(activity.type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
            <p className="text-sm text-gray-500">{activity.description}</p>
            <p className="text-xs text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}