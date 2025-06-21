'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ChildrenPage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/debug/children');
        
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  const handleDeleteChild = async (childId) => {
    if (!confirm('Are you sure you want to remove this child profile?')) {
      return;
    }
    
    try {
      // Use the debug API for reliable data access
      const response = await fetch(`/api/debug/children?id=${childId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete child');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Child deleted successfully');
        // Refresh the children list
        const updatedResponse = await fetch('/api/debug/children');
        const updatedData = await updatedResponse.json();
        setChildren(updatedData.children || []);
      } else {
        throw new Error(result.message || 'Failed to delete child');
      }
    } catch (err) {
      console.error('Error deleting child:', err);
      toast.error(err.message || 'Failed to delete child');
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
            <p className="text-gray-500">No children found</p>
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