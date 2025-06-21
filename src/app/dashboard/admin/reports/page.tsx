'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([
    {
      id: 'report-default-1',
      name: 'Monthly User Activity',
      type: 'users',
      format: 'PDF',
      size: '1.4 MB',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      url: '#'
    },
    {
      id: 'report-default-2',
      name: 'Children Registry',
      type: 'children',
      format: 'CSV',
      size: '0.8 MB',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      url: '#'
    }
  ]);
  const [reportTypes, setReportTypes] = useState([
    { id: 'alerts', name: 'Alerts Summary', description: 'Summary of all alerts in the system' },
    { id: 'users', name: 'User Activity', description: 'User login and activity statistics' },
    { id: 'children', name: 'Children Registry', description: 'Statistics on registered children' },
    { id: 'schools', name: 'School Participation', description: 'School registration and activity metrics' }
  ]);

  useEffect(() => {
    // Simulate loading and fetch recent reports
    const fetchReports = async () => {
      try {
        // In a real implementation, this would be an API call
        // For now, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const handleGenerateReport = (reportType: string) => {
    setGeneratingReport(true);
    toast.success(`Generating ${reportType} report...`);
    
    // Simulate report generation with a delay
    setTimeout(() => {
      const newReport = {
        id: `report-${Date.now()}`,
        name: reportType,
        type: reportType.toLowerCase().includes('alert') ? 'alerts' : 
              reportType.toLowerCase().includes('user') ? 'users' : 
              reportType.toLowerCase().includes('child') ? 'children' : 'schools',
        format: 'PDF',
        size: '1.2 MB',
        createdAt: new Date().toISOString(),
        url: '#'
      };
      
      setRecentReports(prev => [newReport, ...prev]);
      setGeneratingReport(false);
      toast.success(`${reportType} report generated successfully!`);
    }, 2000);
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
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            Generate and download reports for system data and analytics.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {reportTypes.map((report) => (
            <li key={report.id}>
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleGenerateReport(report.name)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Reports</h3>
        </div>
        {generatingReport && (
          <div className="px-6 py-5 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-600">Generating report...</p>
          </div>
        )}
        {!generatingReport && recentReports.length === 0 ? (
          <div className="px-6 py-5">
            <p className="text-sm text-gray-500 italic">No recent reports found.</p>
            <p className="mt-2 text-sm text-gray-500">
              Generated reports will appear here. You can download or share them from this section.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recentReports.map((report) => (
              <li key={report.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {report.type === 'alerts' && (
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                      )}
                      {report.type === 'users' && (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      )}
                      {report.type === 'children' && (
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      )}
                      {report.type === 'schools' && (
                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      <div className="text-xs text-gray-500">
                        Generated on {new Date(report.createdAt).toLocaleString()} • {report.format} • {report.size}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={report.url}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      download
                    >
                      Download
                    </a>
                    <button
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      onClick={() => {
                        navigator.clipboard.writeText(report.url);
                        toast.success('Report link copied to clipboard!');
                      }}
                    >
                      Share
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}