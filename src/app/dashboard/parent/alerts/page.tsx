'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { ChildAlert } from '@/types/child';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/alerts/StatusBadge';
import AlertTypeBadge from '@/components/alerts/AlertTypeBadge';

export default function ParentAlertsPage() {
  const { userProfile } = useAuth();
  const [alerts, setAlerts] = useState<ChildAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [childrenData, setChildrenData] = useState<{[key: string]: any}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const itemsPerPage = 5;

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Fetch alerts from the debug API
        const response = await fetch('/api/debug/alerts');
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        const data = await response.json();
        let allAlerts = data.alerts || [];
        
        // Apply status filter client-side if needed
        if (statusFilter) {
          allAlerts = allAlerts.filter((alert: any) => alert.status === statusFilter);
        }
        
        // Apply type filter client-side if needed
        if (typeFilter) {
          allAlerts = allAlerts.filter((alert: any) => 
            (alert.alertType && alert.alertType.toLowerCase() === typeFilter.toLowerCase()) || 
            (alert.type && alert.type.toLowerCase() === typeFilter.toLowerCase())
          );
        }
        
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
  }, [currentPage, itemsPerPage, statusFilter, typeFilter]);

  const handleStatusFilterChange = (filter: string | null) => {
    setStatusFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
    setLoading(true);
  };
  
  const handleTypeFilterChange = (filter: string | null) => {
    setTypeFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
    setLoading(true);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
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

      <div className="mt-6">
        {/* Status filters */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Status:</h3>
          <div className="inline-flex rounded-md shadow-sm mb-4">
            <button
              type="button"
              onClick={() => handleStatusFilterChange(null)}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-l-md ${!statusFilter ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              All Statuses
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange('active')}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium ${statusFilter === 'active' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange('resolved')}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md ${statusFilter === 'resolved' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              Resolved
            </button>
          </div>
        </div>
        
        {/* Type filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Type:</h3>
          <div className="inline-flex rounded-md shadow-sm mb-6">
            <button
              type="button"
              onClick={() => handleTypeFilterChange(null)}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-l-md ${!typeFilter ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => handleTypeFilterChange('missing')}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium ${typeFilter === 'missing' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              Missing
            </button>
            <button
              type="button"
              onClick={() => handleTypeFilterChange('emergency')}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium ${typeFilter === 'emergency' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              Emergency
            </button>
            <button
              type="button"
              onClick={() => handleTypeFilterChange('medical')}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium ${typeFilter === 'medical' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              Medical
            </button>
            <button
              type="button"
              onClick={() => handleTypeFilterChange('school')}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md ${typeFilter === 'school' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              School
            </button>
          </div>
        </div>
      
        <div className="mt-8">
          {alerts.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter || typeFilter ? 
                  "No alerts found matching the selected filters." : 
                  "You don't have any active alerts at the moment."}
              </p>
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
                              <StatusBadge status={alert.status} />
                              <AlertTypeBadge alertType={alert.alertType || alert.type} className="ml-2" />
                              <div className="ml-2 text-sm text-gray-500">
                                {alert.lastSeen?.location || alert.lastSeenLocation || 'Location not specified'}
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
    </div>
  );
}