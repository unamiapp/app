'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';
import { toast } from 'react-hot-toast';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'emergency' | 'education' | 'health' | 'legal' | 'other';
  content: string;
  imageURL?: string;
  documentURL?: string;
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateResourceData {
  title: string;
  description: string;
  category: 'safety' | 'emergency' | 'education' | 'health' | 'legal' | 'other';
  content: string;
  imageURL?: string;
  documentURL?: string;
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  isPublished?: boolean;
}

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
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
    subscribeToCollection
  } = useFirestore();

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let fetchedResources: Resource[] = [];
      
      // For regular users, only fetch published resources
      if (userProfile?.role === 'parent' || userProfile?.role === 'school' || userProfile?.role === 'community') {
        fetchedResources = await queryDocuments<Resource>('resources', [
          whereEqual('isPublished', true)
        ]);
      } else {
        // For admins and authorities, fetch all resources
        fetchedResources = await queryDocuments<Resource>('resources', []);
      }
      
      // If no resources found and we're in development, use mock data
      if (fetchedResources.length === 0 && process.env.NODE_ENV === 'development') {
        const mockResources: Resource[] = [
          {
            id: '1',
            title: 'Child Safety Guide',
            description: 'Essential safety tips for parents and guardians',
            category: 'safety',
            content: 'This comprehensive guide covers essential safety practices for children of all ages.',
            imageURL: 'https://via.placeholder.com/300',
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system'
          },
          {
            id: '2',
            title: 'Emergency Contact Information',
            description: 'Important contacts for emergencies',
            category: 'emergency',
            content: 'Keep these emergency contacts handy for quick access during urgent situations.',
            contactInfo: {
              name: 'Emergency Services',
              phone: '10111',
              website: 'https://www.saps.gov.za'
            },
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system'
          },
          {
            id: '3',
            title: 'Child Health Resources',
            description: 'Health information for children',
            category: 'health',
            content: 'Information about common childhood illnesses, vaccinations, and health practices.',
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system'
          }
        ];
        setResources(mockResources);
      } else {
        setResources(fetchedResources);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err as Error);
      // Use empty array on error
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [userProfile, queryDocuments, whereEqual]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const subscribeToResources = useCallback(() => {
    let constraints = [];
    
    // For regular users, only subscribe to published resources
    if (userProfile?.role === 'parent' || userProfile?.role === 'school' || userProfile?.role === 'community') {
      constraints = [whereEqual('isPublished', true)];
    }
    
    return subscribeToCollection<Resource>('resources', constraints, (updatedResources) => {
      setResources(updatedResources);
      setLoading(false);
    });
  }, [userProfile, subscribeToCollection, whereEqual]);

  const createResource = async (resourceData: CreateResourceData): Promise<Resource> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      // Check for existing resource with same title
      const existingResources = await queryDocuments<Resource>('resources', [
        whereEqual('title', resourceData.title)
      ]);
      
      if (existingResources.length > 0) {
        throw new Error('A resource with this title already exists');
      }
      
      // Set default values
      const resourceWithDefaults = {
        ...resourceData,
        isPublished: resourceData.isPublished ?? false
      };
      
      // Add the document to Firestore
      const newResource = await addDocument<Resource>('resources', resourceWithDefaults);
      
      // Update local state
      setResources(prev => [...prev, newResource]);
      
      toast.success('Resource created successfully');
      return newResource;
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create resource');
      throw error;
    }
  };

  const updateResource = async (id: string, resourceData: Partial<Resource>): Promise<Resource> => {
    try {
      const updatedResource = await updateDocument<Resource>('resources', id, resourceData);
      
      // Update local state
      setResources(prev => 
        prev.map(resource => resource.id === id ? { ...resource, ...updatedResource } : resource)
      );
      
      toast.success('Resource updated successfully');
      return updatedResource as Resource;
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
      throw error;
    }
  };

  const deleteResource = async (id: string): Promise<boolean> => {
    try {
      await deleteDocument('resources', id);
      
      // Update local state
      setResources(prev => prev.filter(resource => resource.id !== id));
      
      toast.success('Resource deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
      throw error;
    }
  };

  const getResource = async (id: string): Promise<Resource> => {
    try {
      return await getDocument<Resource>('resources', id);
    } catch (error) {
      console.error('Error getting resource:', error);
      toast.error('Failed to load resource');
      throw error;
    }
  };

  return {
    resources,
    loading,
    error,
    fetchResources,
    subscribeToResources,
    createResource,
    updateResource,
    deleteResource,
    getResource
  };
};