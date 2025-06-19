'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChildren } from '@/hooks/useAdminSdk';
import { ChildProfile } from '@/types/child';
import ChildProfileForm from '@/components/forms/ChildProfileForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EditChildPage() {
  const params = useParams();
  const router = useRouter();
  const { getChildren } = useChildren();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChild = async () => {
      if (!params.id) return;
      
      try {
        // For now, get all children and find the one we need
        const children = await getChildren();
        const foundChild = children.find(c => c.id === params.id);
        
        if (!foundChild) {
          setError('Child not found');
        } else {
          setChild(foundChild);
        }
      } catch (err) {
        console.error('Error fetching child:', err);
        setError('Failed to load child profile');
      } finally {
        setLoading(false);
      }
    };

    fetchChild();
  }, [params.id, getChildren]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error || 'Child not found'}</p>
        <button
          onClick={() => router.push('/dashboard/parent/children')}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Back to Children
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit {child.firstName} {child.lastName}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your child's profile information
        </p>
      </div>

      <ChildProfileForm
        initialData={child}
        isEditing={true}
      />
    </div>
  );
}