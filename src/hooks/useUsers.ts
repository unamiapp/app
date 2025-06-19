'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import { UserProfile, UserRole } from '@/types/user';

export interface CreateUserData {
  email: string;
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

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { userProfile } = useAuth();

  // Fetch users based on role
  const fetchUsers = useCallback(async () => {
    if (!userProfile || userProfile.role !== 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin-sdk/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const fetchedUsers = await response.json();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create a new user
  const createUser = async (userData: CreateUserData & { password: string }): Promise<UserProfile> => {
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      // Check if current user is admin
      if (userProfile.role !== 'admin') {
        throw new Error('Only administrators can create users');
      }
      
      // Ensure all fields have values (no undefined or null)
      const cleanedUserData = {
        email: userData.email,
        password: userData.password, // Password is required for server-side creation
        displayName: userData.displayName,
        role: userData.role,
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        organization: userData.organization ? {
          id: userData.organization.id || `org-${Date.now()}`,
          name: userData.organization.name || '',
          type: userData.organization.type || 'school'
        } : undefined,
      };
      
      console.log('Creating user with data:', JSON.stringify({
        email: cleanedUserData.email,
        displayName: cleanedUserData.displayName,
        role: cleanedUserData.role
      }));
      
      console.log('Making request to /api/admin-sdk/users...');
      
      // Use the server-side API endpoint instead of direct Firestore access
      const response = await fetch('/api/admin-sdk/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedUserData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const responseText = await response.text();
        console.log('Error response text:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Failed to create user');
        } catch (parseError) {
          throw new Error(`Server error (${response.status}): ${responseText.substring(0, 200)}...`);
        }
      }
      
      const result = await response.json();
      
      toast.success('User created successfully');
      return result as UserProfile;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
      throw error;
    }
  };



  // Update user
  const updateUser = async (id: string, userData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await fetch('/api/admin-sdk/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...userData }),
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      const result = await response.json();
      toast.success('User updated successfully');
      fetchUsers(); // Refresh list
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      throw error;
    }
  };

  // Delete user
  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin-sdk/users?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete user');
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh list
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      throw error;
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};