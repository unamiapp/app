'use client';

import { useState, useEffect } from 'react';

interface ActiveAlertsStatsProps {
  role: string;
}

export default function ActiveAlertsStats({ role }: ActiveAlertsStatsProps) {
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Use the debug API for consistent results
        const response = await fetch('/api/debug/alerts');
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        
        const data = await response.json();
        // Count alerts with status 'active' (case insensitive)
        const activeAlerts = (data.alerts || []).filter((alert: any) => 
          alert.status?.toLowerCase() === 'active' || !alert.status
        );
        
        console.log(`ActiveAlertsStats: Found ${activeAlerts.length} active alerts out of ${(data.alerts || []).length} total`);
        setAlertCount(activeAlerts.length);
      } catch (error) {
        console.error('Error fetching alerts for stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return {
    name: 'Active Alerts',
    value: alertCount,
    change: '',
    changeType: 'neutral' as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };
}