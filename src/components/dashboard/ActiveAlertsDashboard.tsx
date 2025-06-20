'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { normalizeAlerts } from '@/lib/utils/alertUtils';

export default function ActiveAlertsDashboard({ role, limit = 5 }: { role: string, limit?: number }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Use the debug API for alerts
        const response = await fetch('/api/debug/alerts');
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        
        const data = await response.json();
        console.log(`ActiveAlertsDashboard: Fetched ${data.alerts?.length || 0} total alerts`);
        
        // Filter active alerts (case insensitive) and limit the number shown
        const activeAlerts = (data.alerts || []).filter((alert: any) => 
          (alert.status?.toLowerCase() === 'active') || !alert.status
        );
        
        console.log(`ActiveAlertsDashboard: Found ${activeAlerts.length} active alerts`);
        
        // Normalize and set the alerts
        const normalizedAlerts = normalizeAlerts(activeAlerts.slice(0, limit));
        console.log(`ActiveAlertsDashboard: Setting ${normalizedAlerts.length} normalized alerts`);
        setAlerts(normalizedAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [limit]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Active Alerts</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {alerts.length} active {alerts.length === 1 ? 'alert' : 'alerts'}
          </p>
        </div>
        <Link
          href={`/dashboard/${role}/alerts`}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          View All
        </Link>
      </div>
      
      {alerts.length === 0 ? (
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
          <p className="mt-1 text-sm text-gray-500">There are no active alerts at this time.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <li key={alert.id} className="px-4 py-3 hover:bg-gray-50">
              <Link href={`/dashboard/${role}/alerts/${alert.id}`} className="block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {alert.alertType || alert.type || 'Alert'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.childName || 'Child'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {alert.lastSeen?.location || alert.lastSeenLocation || 'Location not specified'}
                        {alert.lastSeen?.date && (
                          <span className="ml-1">({alert.lastSeen.date})</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}