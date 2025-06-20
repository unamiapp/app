'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import { ChildProfile } from '@/types/child';

export interface CreateChildData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  schoolName?: string;
  schoolId?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  guardians?: string[];
  photoURL?: string;
  identificationNumber?: string;
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
}

export const useChildren = () => {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { userProfile } = useAuth();

  // Fetch children based on role
  const fetchChildren = useCallback(async () => {
    if (!userProfile) {
      console.log('fetchChildren: No user profile, skipping fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching children for user:', userProfile.id, 'with role:', userProfile.role);
      
      // Try the debug endpoint first to see if we can get any children
      try {
        const debugResponse = await fetch('/api/debug/children');
        const debugData = await debugResponse.json();
        console.log('Debug API response:', debugData);
      } catch (debugError) {
        console.error('Debug API error:', debugError);
      }
      
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin-sdk/children?_t=${timestamp}`);
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          errorText = await response.text();
        }
        
        console.error('API error response:', errorText);
        throw new Error(`Failed to fetch children: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Children fetched:', result.children?.length || 0);
      setChildren(result.children || []);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError(err as Error);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Fetch children on mount
  useEffect(() => {
    console.log('useChildren hook: Fetching children on mount');
    fetchChildren().catch(err => {
      console.error('Error in fetchChildren effect:', err);
    });
  }, [fetchChildren]);

  // Create a new child
  const createChild = async (childData: CreateChildData): Promise<ChildProfile> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      // Ensure guardians includes current user if parent
      if (userProfile.role === 'parent' && (!childData.guardians || !childData.guardians.includes(userProfile.id))) {
        childData.guardians = [...(childData.guardians || []), userProfile.id];
      }
      
      console.log('Creating child with data:', {
        firstName: childData.firstName,
        lastName: childData.lastName,
        guardians: childData.guardians
      });
      
      const response = await fetch('/api/admin-sdk/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData),
      });
      
      if (!response.ok) {
        const responseText = await response.text();
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Failed to create child profile');
        } catch (parseError) {
          throw new Error(`Server error (${response.status}): ${responseText.substring(0, 200)}...`);
        }
      }
      
      const result = await response.json();
      
      toast.success('Child profile created successfully');
      fetchChildren(); // Refresh list
      return result as ChildProfile;
    } catch (error) {
      console.error('Error creating child profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create child profile');
      throw error;
    }
  };

  // Update child
  const updateChild = async (id: string, childData: Partial<ChildProfile>): Promise<ChildProfile> => {
    try {
      console.log('Updating child:', id);
      const response = await fetch('/api/admin-sdk/children', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...childData }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update child profile: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      toast.success('Child profile updated successfully');
      fetchChildren(); // Refresh list
      return result;
    } catch (error) {
      console.error('Error updating child profile:', error);
      toast.error('Failed to update child profile');
      throw error;
    }
  };

  // Delete child
  const deleteChild = async (id: string): Promise<boolean> => {
    try {
      console.log('Deleting child:', id);
      const response = await fetch(`/api/admin-sdk/children?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete child profile: ${response.status} ${errorText}`);
      }
      
      toast.success('Child profile deleted successfully');
      fetchChildren(); // Refresh list
      return true;
    } catch (error) {
      console.error('Error deleting child profile:', error);
      toast.error('Failed to delete child profile');
      throw error;
    }
  };

  return {
    children,
    loading,
    error,
    fetchChildren,
    createChild,
    updateChild,
    deleteChild
  };
};