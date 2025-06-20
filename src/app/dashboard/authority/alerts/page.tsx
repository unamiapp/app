'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ChildAlert } from '@/types/child';

export default function AuthorityAlertsPage() {
  const [alerts, setAlerts] = useState<ChildAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [childrenData, setChildrenData] = useState<{[key: string]: any}>({});

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Use the debug API for alerts
        const response = await fetch('/api/debug/alerts');
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        
        const data = await response.json();
        let filteredAlerts = data.alerts || [];
        
        // Apply filter client-side if needed
        if (activeFilter) {
          filteredAlerts = filteredAlerts.filter((alert: any) => alert.status === activeFilter);
        }
        
        setAlerts(filteredAlerts);
        
        // Fetch children data for each alert
        if (filteredAlerts.length > 0) {
          const childIds = [...new Set(filteredAlerts.map((alert: ChildAlert) => alert.childId))];
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
  }, [activeFilter]);

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
    setLoading(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter alerts client-side based on search query
    // In a real app, this would likely be a server-side search
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

  // Filter alerts based on search query
  const filteredAlerts = searchQuery
    ? alerts.filter(alert => {
        const childData = childrenData[alert.childId] || {};
        const childName = `${childData.firstName || ''} ${childData.lastName || ''}`.toLowerCase();
        const location = (alert.lastSeen?.location || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        
        return childName.includes(query) || location.includes(query);
      })
    : alerts;

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
          <h1 className="text-2xl font-semibold text-gray-900">Active Alerts</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage all active missing child alerts in your jurisdiction.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => handleFilterChange(null)}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-l-md ${!activeFilter ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              All Alerts
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('active')}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium ${activeFilter === 'active' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('resolved')}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md ${activeFilter === 'resolved' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              Resolved
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="bg-white shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Search Alerts
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Search for specific alerts by name, location, or other details.</p>
            </div>
            <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSearch}>
              <div className="w-full sm:max-w-xs">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search alerts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>
        
        {filteredAlerts.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'No alerts match your search criteria.' : activeFilter ? `No ${activeFilter} alerts found.` : 'No alerts in the system at the moment.'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredAlerts.map((alert) => {
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
                          href={`/dashboard/authority/alerts/${alert.id}`}
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
      </div>
    </div>
  );
}