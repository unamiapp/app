'use client';

import { useState, useEffect } from 'react';
import { ChildProfile } from '@/types/child';
import Link from 'next/link';

export default function ChildrenPage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const childrenPerPage = 6;

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin-sdk/children');
        if (!response.ok) throw new Error('Failed to fetch children');
        const result = await response.json();
        setChildren(result.children || []);
      } catch (error: any) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  const totalPages = Math.ceil(children.length / childrenPerPage);
  const startIndex = (currentPage - 1) * childrenPerPage;
  const paginatedChildren = children.slice(startIndex, startIndex + childrenPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading children: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Children</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your children's profiles
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/parent/children/add"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Child
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {children.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No children</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a child profile.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/parent/children/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Child
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedChildren.map((child) => (
                <div key={child.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {child.photoURL ? (
                          <img className="h-16 w-16 rounded-full" src={child.photoURL} alt="" />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-700">
                              {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {child.firstName} {child.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {child.gender}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      {child.schoolName && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">School:</span> {child.schoolName}
                        </p>
                      )}
                      {child.address && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Address:</span> {child.address.city}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Link
                        href={`/dashboard/parent/children/edit/${child.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to remove this child profile?')) {
                            try {
                              const response = await fetch(`/api/admin-sdk/children?id=${child.id}`, {
                                method: 'DELETE'
                              });
                              if (response.ok) {
                                setChildren(prev => prev.filter(c => c.id !== child.id));
                              }
                            } catch (error) {
                              console.error('Error deleting child:', error);
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}