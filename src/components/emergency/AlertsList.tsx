'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { MissingChildAlert, ChildAlert } from '@/types/child';
import { ChildProfile } from '@/types/child';
import { toast } from 'react-hot-toast';
import { Unsubscribe } from 'firebase/firestore';

interface AlertsListProps {
  role: 'parent' | 'school' | 'authority' | 'community' | 'admin';
  limit?: number;
}

export default function AlertsList({ role, limit }: AlertsListProps) {
  const [alerts, setAlerts] = useState<(ChildAlert & { child?: ChildProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, userProfile } = useAuth();
  const { 
    subscribeToCollection, 
    queryDocuments, 
    getDocument, 
    whereEqual, 
    whereArrayContains,
    whereIn,
    orderByDesc,
    limitTo
  } = useFirestore();
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    const setupAlertsSubscription = async () => {
      if (!user || !userProfile) return;
      
      try {
        setLoading(true);
        
        // Clean up any existing subscription
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        
        // Build query constraints based on role
        let constraints = [];
        
        if (role === 'parent') {
          // For parents, first get their children
          const childrenData = await queryDocuments<ChildProfile>(
            'children',
            [whereArrayContains('guardians', userProfile.id)]
          );
          
          const childIds = childrenData.map(child => child.id);
          
          if (childIds.length === 0) {
            setAlerts([]);
            setLoading(false);
            return;
          }
          
          constraints = [whereIn('childId', childIds), orderByDesc('createdAt')];
        } else if (role === 'school' && userProfile.schoolId) {
          // For schools, get children in their school
          const childrenData = await queryDocuments<ChildProfile>(
            'children',
            [whereEqual('schoolId', userProfile.schoolId)]
          );
          
          const childIds = childrenData.map(child => child.id);
          
          if (childIds.length === 0) {
            setAlerts([]);
            setLoading(false);
            return;
          }
          
          constraints = [whereIn('childId', childIds), orderByDesc('createdAt')];
        } else {
          // Authorities, community leaders, and admins see all alerts
          constraints = [orderByDesc('createdAt')];
        }
        
        // Add limit if specified
        if (limit) {
          constraints.push(limitTo(limit));
        }
        
        // Set up real-time listener for alerts
        unsubscribeRef.current = subscribeToCollection<ChildAlert>(
          'alerts',
          constraints,
          async (alertsData) => {
            try {
              // Fetch child details for each alert
              const alertsWithChildren = await Promise.all(
                alertsData.map(async (alert) => {
                  try {
                    const child = await getDocument<ChildProfile>('children', alert.childId);
                    return { ...alert, child };
                  } catch (error) {
                    console.error(`Error fetching child ${alert.childId}:`, error);
                    return alert;
                  }
                })
              );
              
              setAlerts(alertsWithChildren);
            } catch (error) {
              console.error('Error processing alerts data:', error);
              toast.error('Failed to process alerts data');
            } finally {
              setLoading(false);
            }
          }
        );
      } catch (error) {
        console.error('Error setting up alerts subscription:', error);
        toast.error('Failed to load alerts');
        setLoading(false);
      }
    };
    
    setupAlertsSubscription();
    
    // Clean up subscription when component unmounts or dependencies change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [
    user, 
    userProfile, 
    role, 
    limit, 
    subscribeToCollection, 
    queryDocuments, 
    getDocument, 
    whereEqual, 
    whereArrayContains,
    whereIn,
    orderByDesc,
    limitTo
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Active
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Resolved
          </span>
        );
      case 'false':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            False Alert
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-sm text-gray-500">Loading alerts...</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-10 bg-white shadow sm:rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {role === 'parent' 
            ? "You haven't reported any missing children." 
            : "There are no active alerts at this time."}
        </p>
        {role === 'parent' && (
          <div className="mt-6">
            <Link
              href="/dashboard/parent/report"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Report Missing Child
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                    {alert.child?.photoURL ? (
                      <img
                        src={alert.child.photoURL}
                        alt={`${alert.child.firstName} ${alert.child.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-red-100 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {alert.child 
                        ? `${alert.child.firstName} ${alert.child.lastName}` 
                        : 'Unknown Child'}
                    </h4>
                    <div className="mt-1 flex items-center">
                      {getStatusBadge(alert.status)}
                      <span className="ml-2 text-sm text-gray-500">
                        Reported {formatDate(alert.dateReported)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Link
                    href={`/dashboard/${role}/alerts/${alert.id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Last seen:</span> {alert.lastSeenLocation?.address || 'Location not specified'}
                </div>
                {alert.lastSeenWearing && (
                  <div className="mt-1 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Wearing:</span> {alert.lastSeenWearing}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}