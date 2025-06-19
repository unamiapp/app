import { useState } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import { UserProfile, UserRole } from '@/types/user';
import { ChildProfile } from '@/types/child';

// Interface for user creation data
export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  organization?: {
    id: string;
    name: string;
    type: 'school' | 'authority' | 'community';
  };
}

// Interface for child creation data
export interface CreateChildData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  photoURL?: string;
  guardians?: string[];
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

// Hook for user management
export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { userProfile } = useAuth();

  // Create a new user (admin only)
  const createUser = async (userData: CreateUserData): Promise<UserProfile> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      // Check if current user is admin
      if (userProfile.role !== 'admin') {
        throw new Error('Only administrators can create users');
      }
      
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin-sdk/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      
      const result = await response.json();
      
      toast.success('User created successfully');
      return result;
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error);
      toast.error(error.message || 'Failed to create user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get all users (admin only)
  const getUsers = async (filters?: { role?: UserRole; isActive?: boolean }): Promise<UserProfile[]> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      // Check if current user is admin
      if (userProfile.role !== 'admin') {
        throw new Error('Only administrators can list users');
      }
      
      setLoading(true);
      setError(null);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters?.role) queryParams.append('role', filters.role);
      if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
      
      const response = await fetch(`/api/admin-sdk/users?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const users = await response.json();
      return users;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error);
      toast.error(error.message || 'Failed to fetch users');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    createUser,
    getUsers,
    loading,
    error
  };
};

// Hook for child profile management
export const useChildren = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { userProfile } = useAuth();

  // Create a new child profile (parent or admin)
  const createChild = async (childData: CreateChildData): Promise<ChildProfile> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      // Check if user can create children
      if (userProfile.role !== 'parent' && userProfile.role !== 'admin') {
        throw new Error('Only parents and admins can create child profiles');
      }
      
      setLoading(true);
      setError(null);
      
      // Ensure guardians includes current user if parent
      let guardians = childData.guardians || [];
      if (userProfile.role === 'parent' && !guardians.includes(userProfile.id)) {
        guardians = [...guardians, userProfile.id];
      }
      
      const response = await fetch('/api/admin-sdk/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...childData,
          guardians
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create child profile');
      }
      
      const result = await response.json();
      
      toast.success('Child profile created successfully');
      return result;
    } catch (error: any) {
      console.error('Error creating child profile:', error);
      setError(error);
      toast.error(error.message || 'Failed to create child profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get child profiles
  const getChildren = async (): Promise<ChildProfile[]> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin-sdk/children');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch children' }));
        throw new Error(errorData.message || 'Failed to fetch children');
      }
      
      const result = await response.json();
      return result.children || [];
    } catch (error: any) {
      console.error('Error fetching children:', error);
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update child profile
  const updateChild = async (id: string, childData: Partial<CreateChildData>): Promise<ChildProfile> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin-sdk/children', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...childData }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update child profile');
      }
      
      const result = await response.json();
      toast.success('Child profile updated successfully');
      return result;
    } catch (error: any) {
      console.error('Error updating child profile:', error);
      setError(error);
      toast.error(error.message || 'Failed to update child profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete child profile
  const deleteChild = async (id: string): Promise<boolean> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin-sdk/children?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete child profile');
      }
      
      toast.success('Child profile deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting child profile:', error);
      setError(error);
      toast.error(error.message || 'Failed to delete child profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createChild,
    getChildren,
    updateChild,
    deleteChild,
    loading,
    error
  };
};