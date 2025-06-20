'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { ChildAlert } from '@/types/child';
import Pagination from '@/components/ui/Pagination';

export default function ParentAlertsPage() {
  const { userProfile } = useAuth();
  const [alerts, setAlerts] = useState<ChildAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [childrenData, setChildrenData] = useState<{[key: string]: any}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Fetch alerts from the debug API
        const response = await fetch('/api/debug/alerts');
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        const data = await response.json();
        const allAlerts = data.alerts || [];
        
        // Calculate pagination
        const total = allAlerts.length;
        const pages = Math.ceil(total / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedAlerts = allAlerts.slice(startIndex, endIndex);
        
        setTotalAlerts(total);
        setTotalPages(Math.max(1, pages));
        setAlerts(paginatedAlerts);
        
        // Fetch children data for each alert
        if (data.alerts && data.alerts.length > 0) {
          const childIds = [...new Set(data.alerts.map((alert: ChildAlert) => alert.childId))];
          const childrenDetails: {[key: string]: any} = {};
          
          // Get all children at once using the debug API
          const childrenResponse = await fetch('/api/debug/children');
          if (childrenResponse.ok) {
            const childrenData = await childrenResponse.json();
            const children = childrenData.children || [];
            
            // Create a map of child IDs to child data
            children.forEach((child: any) => {
              if (child.id) {
                childrenDetails[child.id] = child;
              }
            });
            
            setChildrenData(childrenDetails);
          }
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
        toast.error('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
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
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
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
          <h1 className="text-2xl font-semibold text-gray-900">Alerts</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage alerts for your children.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/parent/report"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Report Missing Child
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {alerts.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any active alerts at the moment.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {alerts.map((alert) => {
                const childData = childrenData[alert.childId] || {};
                return (
                  <li key={alert.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                          {childData.photoURL ? (
                            <img
                              src={childData.photoURL}
                              alt={`${childData.firstName} ${childData.lastName}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {childData.firstName ? `${childData.firstName} ${childData.lastName}` : 'Child'}
                          </div>
                          <div className="flex items-center mt-1">
                            {getStatusBadge(alert.status)}
                            <div className="ml-2 text-sm text-gray-500">
                              {alert.lastSeen?.location || 'Location not specified'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Link
                          href={`/dashboard/parent/alerts/${alert.id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}