'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function AuthorityReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportTypes, setReportTypes] = useState([
    { id: 'jurisdiction', name: 'Jurisdiction Summary', description: 'Overview of children in your jurisdiction' },
    { id: 'alerts', name: 'Alerts Analysis', description: 'Analysis of alerts in your jurisdiction' },
    { id: 'cases', name: 'Case Management', description: 'Status of active and resolved cases' },
    { id: 'schools', name: 'School Participation', description: 'School engagement metrics in your jurisdiction' }
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateReport = (reportType: string) => {
    toast.success(`Generating ${reportType} report...`);
    // In a real implementation, this would call an API to generate the report
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
          <h1 className="text-2xl font-semibold text-gray-900">Authority Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            Generate and download reports for your jurisdiction.
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
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500 italic">No recent reports found.</p>
          <p className="mt-2 text-sm text-gray-500">
            Generated reports will appear here. You can download or share them from this section.
          </p>
        </div>
      </div>
    </div>
  );
}