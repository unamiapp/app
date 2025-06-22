'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ChildrenPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      if (authLoading) {
        return;
      }
      
      if (!userProfile?.id) {
        setLoading(false);
        setError('User not authenticated');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/debug/children?parentId=${userProfile.id}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setChildren(data.children || []);
        } else {
          throw new Error(data.error || 'Failed to fetch children');
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch children');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [userProfile?.id, authLoading]);

  const handleDeleteChild = async (childId: string) => {
    if (!confirm('Are you sure you want to remove this child profile?')) {
      return;
    }
    
    if (!userProfile?.id) {
      toast.error('User not authenticated');
      return;
    }
    
    try {
      const response = await fetch(`/api/debug/children?id=${childId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete child');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Child deleted successfully');
        const updatedResponse = await fetch(`/api/debug/children?parentId=${userProfile.id}`);
        const updatedData = await updatedResponse.json();
        setChildren(updatedData.children || []);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading children: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Children</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your children's profiles ({children.length} children)
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
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No children</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first child.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/parent/children/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Child
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <div key={child.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex justify-end mb-2">
                    <Link
                      href={`/dashboard/parent/children/edit/${child.id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium mr-2"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {child.photoURL ? (
                        <img className="h-16 w-16 rounded-full object-cover" src={child.photoURL} alt="" />
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}