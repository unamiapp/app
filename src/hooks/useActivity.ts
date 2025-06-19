'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';

export interface Activity {
  id: string;
  type: 'alert' | 'profile' | 'login' | 'system' | 'resource';
  title: string;
  description: string;
  userId: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  metadata?: Record<string, any>;
}

export const useActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { userProfile } = useAuth();
  const { 
    addDocument, 
    queryDocuments, 
    whereEqual, 
    orderByDesc,
    subscribeToCollection
  } = useFirestore();

  const fetchActivities = useCallback(async (limit: number = 10) => {
    if (!userProfile) {
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      let fetchedActivities: Activity[] = [];
      
      // Different queries based on user role
      if (userProfile.role === 'admin') {
        // Admins can see all activities
        fetchedActivities = await queryDocuments<Activity>('activities', [
          orderByDesc('timestamp')
        ]);
      } else if (userProfile.role === 'authority') {
        // Authorities can see alerts and their own activities
        fetchedActivities = await queryDocuments<Activity>('activities', [
          whereEqual('type', 'alert'),
          orderByDesc('timestamp')
        ]);
      } else {
        // Regular users can only see their own activities
        fetchedActivities = await queryDocuments<Activity>('activities', [
          whereEqual('userId', userProfile.id),
          orderByDesc('timestamp')
        ]);
      }
      
      // Limit the results
      const limitedActivities = fetchedActivities.slice(0, limit);
      
      // If no activities found and we're in development, use mock data
      if (limitedActivities.length === 0 && process.env.NODE_ENV === 'development') {
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'alert',
            title: 'Alert Created',
            description: 'A new alert was created for John Doe',
            userId: userProfile.id,
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            status: 'warning'
          },
          {
            id: '2',
            type: 'profile',
            title: 'Profile Updated',
            description: 'Child profile information was updated',
            userId: userProfile.id,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            status: 'success'
          },
          {
            id: '3',
            type: 'login',
            title: 'Login Detected',
            description: 'New login from Chrome on Windows',
            userId: userProfile.id,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            status: 'info'
          },
          {
            id: '4',
            type: 'system',
            title: 'System Maintenance',
            description: 'Scheduled system maintenance completed',
            userId: 'system',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            status: 'info'
          },
          {
            id: '5',
            type: 'alert',
            title: 'Alert Resolved',
            description: 'Alert for Jane Doe has been resolved',
            userId: userProfile.id,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
            status: 'success'
          }
        ];
        setActivities(mockActivities.slice(0, limit));
      } else {
        setActivities(limitedActivities);
      }
      
      return limitedActivities;
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err as Error);
      setActivities([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userProfile, queryDocuments, whereEqual, orderByDesc]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const subscribeToUserActivities = useCallback((limit: number = 10) => {
    if (!userProfile) return () => {};
    
    let constraints = [];
    
    // Different queries based on user role
    if (userProfile.role === 'admin') {
      // Admins can see all activities
      constraints = [orderByDesc('timestamp')];
    } else if (userProfile.role === 'authority') {
      // Authorities can see alerts and their own activities
      constraints = [whereEqual('type', 'alert'), orderByDesc('timestamp')];
    } else {
      // Regular users can only see their own activities
      constraints = [whereEqual('userId', userProfile.id), orderByDesc('timestamp')];
    }
    
    return subscribeToCollection<Activity>('activities', constraints, (updatedActivities) => {
      setActivities(updatedActivities.slice(0, limit));
      setLoading(false);
    });
  }, [userProfile, subscribeToCollection, whereEqual, orderByDesc]);

  const logActivity = async (activity: Omit<Activity, 'id' | 'userId' | 'timestamp'>): Promise<Activity> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      const newActivity = {
        ...activity,
        userId: userProfile.id,
        timestamp: new Date().toISOString()
      };
      
      const createdActivity = await addDocument<Activity>('activities', newActivity);
      
      // Update local state
      setActivities(prev => [createdActivity, ...prev].slice(0, 10));
      
      return createdActivity;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  };

  return {
    activities,
    loading,
    error,
    fetchActivities,
    subscribeToUserActivities,
    logActivity
  };
};