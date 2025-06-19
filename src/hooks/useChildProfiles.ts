'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';
import { toast } from 'react-hot-toast';

export interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  guardians: string[];
  photoURL?: string;
  identificationNumber?: string;
  schoolName?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateChildData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  photoURL?: string;
  guardians: string[];
  identificationNumber?: string;
  schoolName?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
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

export const useChildProfiles = () => {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { userProfile } = useAuth();
  const { 
    addDocument, 
    updateDocument, 
    deleteDocument, 
    getDocument, 
    queryDocuments, 
    whereEqual, 
    whereArrayContains,
    subscribeToCollection
  } = useFirestore();

  const fetchChildren = useCallback(async () => {
    if (!userProfile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let fetchedChildren: ChildProfile[] = [];
      
      if (userProfile.role === 'parent') {
        // For parents, fetch children where they are listed as guardians
        fetchedChildren = await queryDocuments<ChildProfile>('children', [
          whereArrayContains('guardians', userProfile.id)
        ]);
      } else if (userProfile.role === 'school' && userProfile.organization?.id) {
        // For schools, fetch children associated with their school
        fetchedChildren = await queryDocuments<ChildProfile>('children', [
          whereEqual('schoolName', userProfile.organization.id)
        ]);
      } else if (['admin', 'authority'].includes(userProfile.role)) {
        // Admins and authorities can see all children
        fetchedChildren = await queryDocuments<ChildProfile>('children', []);
      }
      
      setChildren(fetchedChildren);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError(err as Error);
      // Use empty array on error
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, [userProfile, queryDocuments, whereEqual, whereArrayContains]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userProfile) return;
    
    let unsubscribe: () => void;
    
    const setupSubscription = async () => {
      try {
        let constraints = [];
        
        if (userProfile.role === 'parent') {
          constraints = [whereArrayContains('guardians', userProfile.id)];
        } else if (userProfile.role === 'school' && userProfile.organization?.id) {
          constraints = [whereEqual('schoolName', userProfile.organization.id)];
        }
        
        unsubscribe = subscribeToCollection<ChildProfile>(
          'children',
          constraints,
          (updatedChildren) => {
            setChildren(updatedChildren);
            setLoading(false);
          },
          (err) => {
            console.error('Subscription error:', err);
            setError(err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error setting up subscription:', err);
        setError(err as Error);
        setLoading(false);
      }
    };
    
    setupSubscription();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userProfile, subscribeToCollection, whereEqual, whereArrayContains]);

  const createChild = async (childData: CreateChildData): Promise<ChildProfile> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      // Ensure guardians is an array
      const guardians = Array.isArray(childData.guardians) ? childData.guardians : [];
      
      // Ensure the current user is added as a guardian
      if (!guardians.includes(userProfile.id)) {
        guardians.push(userProfile.id);
      }
      
      // Clean up data to ensure no undefined values
      const cleanData = {
        firstName: childData.firstName,
        lastName: childData.lastName,
        dateOfBirth: childData.dateOfBirth,
        gender: childData.gender,
        photoURL: childData.photoURL || '',
        guardians: guardians,
        identificationNumber: childData.identificationNumber || '',
        schoolName: childData.schoolName || '',
        address: {
          street: childData.address?.street || '',
          city: childData.address?.city || '',
          province: childData.address?.province || '',
          postalCode: childData.address?.postalCode || '',
        },
        medicalInfo: {
          bloodType: childData.medicalInfo?.bloodType || '',
          allergies: childData.medicalInfo?.allergies || [],
          conditions: childData.medicalInfo?.conditions || [],
          medications: childData.medicalInfo?.medications || [],
          emergencyContact: {
            name: childData.medicalInfo?.emergencyContact?.name || '',
            relationship: childData.medicalInfo?.emergencyContact?.relationship || '',
            phone: childData.medicalInfo?.emergencyContact?.phone || '',
          },
        },
      };
      
      console.log('Creating child with data:', JSON.stringify({
        firstName: cleanData.firstName,
        lastName: cleanData.lastName,
        guardians: cleanData.guardians
      }));
      
      // Use the server-side API endpoint instead of direct Firestore access
      let response;
      
      if (userProfile.role === 'parent') {
        // Use the parent-specific endpoint
        response = await fetch('/api/parent/create-child', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanData),
        });
      } else if (userProfile.role === 'admin') {
        // Admins can use the regular children API
        response = await fetch('/api/children', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanData),
        });
      } else {
        throw new Error('Only parents and admins can create child profiles');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create child profile');
      }
      
      const result = await response.json();
      const newChild = userProfile.role === 'parent' ? result.child : result;
      
      toast.success('Child profile created successfully');
      return newChild as ChildProfile;
    } catch (error) {
      console.error('Error creating child profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create child profile');
      throw error;
    }
  };

  const updateChild = async (id: string, childData: Partial<ChildProfile>): Promise<ChildProfile> => {
    try {
      // Add updated timestamp
      const dataWithTimestamp = {
        ...childData,
        updatedAt: new Date().toISOString()
      };
      
      const updatedChild = await updateDocument<ChildProfile>('children', id, dataWithTimestamp);
      toast.success('Child profile updated successfully');
      return updatedChild as ChildProfile;
    } catch (error) {
      console.error('Error updating child profile:', error);
      toast.error('Failed to update child profile');
      throw error;
    }
  };

  const deleteChild = async (id: string): Promise<boolean> => {
    try {
      await deleteDocument('children', id);
      toast.success('Child profile deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting child profile:', error);
      toast.error('Failed to delete child profile');
      throw error;
    }
  };

  const getChild = async (id: string): Promise<ChildProfile> => {
    try {
      return await getDocument<ChildProfile>('children', id);
    } catch (error) {
      console.error('Error getting child profile:', error);
      toast.error('Failed to load child profile');
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
    deleteChild,
    getChild
  };
};