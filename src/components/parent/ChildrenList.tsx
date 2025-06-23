'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/ui/Pagination';

export default function ChildrenList() {
  const { data: session, status } = useSession();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  const fetchChildren = async (page = 1) => {
    if (status === 'authenticated') {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/admin-sdk/children?page=${page}&limit=${itemsPerPage}`);
        const data = await response.json();
        if (data.success) {
          setChildren(data.children || []);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(page);
        } else {
          throw new Error(data.error || 'Failed to fetch children');
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch children');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [session, status]);

  const handleDeleteChild = async (childId: string, childName: string) => {
    if (!confirm(`Are you sure you want to remove ${childName}'s profile?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin-sdk/children?id=${childId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete child');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Child profile removed successfully');
        fetchChildren(currentPage); // Refresh the current page
      } else {
        throw new Error(result.message || 'Failed to delete child');
      }
    } catch (err) {
      console.error('Error deleting child:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete child');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading children: {error}</p>
        <button 
          onClick={() => fetchChildren(currentPage)}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No children registered</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding your first child's profile.</p>
        <div className="mt-6">
          <Link
            href="/dashboard/parent/children/add"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Child Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {children.map((child) => (
          <div key={child.id} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Child Photo */}
              <div className="flex justify-center mb-4">
                {child.photoURL ? (
                  <img 
                    className="h-20 w-20 rounded-full object-cover border-2 border-gray-200" 
                    src={child.photoURL} 
                    alt={`${child.firstName} ${child.lastName}`}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-200">
                    <span className="text-xl font-semibold text-white">
                      {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Child Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {child.firstName} {child.lastName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {child.gender}
                </p>
                {child.schoolName && (
                  <p className="text-sm text-gray-500">
                    School: {child.schoolName}
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Link
                  href={`/dashboard/parent/children/view/${child.id}`}
                  className="flex-1 bg-blue-50 text-blue-700 text-center py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  href={`/dashboard/parent/children/edit/${child.id}`}
                  className="flex-1 bg-gray-50 text-gray-700 text-center py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteChild(child.id, `${child.firstName} ${child.lastName}`)}
                  className="bg-red-50 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={fetchChildren}
        />
      )}
    </div>
  );
}