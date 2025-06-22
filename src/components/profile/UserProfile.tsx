'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import PhotoUpload from '@/components/ui/PhotoUpload';
import UserProfilePhoto from '@/components/profile/UserProfilePhoto';

interface UserProfileProps {
  userId?: string;
}

export default function UserProfile({ userId }: UserProfileProps) {
  const { userProfile: sessionProfile, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photoURL, setPhotoURL] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    role: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Use the current user's profile if no userId is provided
        const targetUserId = userId || sessionProfile?.id;
        
        if (!targetUserId) {
          // If no user ID is available, use the session data directly
          if (sessionProfile) {
            setProfile(sessionProfile);
            setPhotoURL(sessionProfile.photoURL || '');
            setFormData({
              displayName: sessionProfile.displayName || '',
              email: sessionProfile.email || '',
              phoneNumber: sessionProfile.phoneNumber || '',
              role: sessionProfile.role || ''
            });
            return;
          } else if (user) {
            // Create a profile from the user object
            const userProfile = {
              id: (user as any).id || (user as any).uid || 'unknown',
              email: user.email || '',
              displayName: user.name || '',
              photoURL: user.image || '',
              role: (user as any).role || 'parent',
              phoneNumber: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isActive: true
            };
            setProfile(userProfile);
            setPhotoURL(userProfile.photoURL || '');
            setFormData({
              displayName: userProfile.displayName || '',
              email: userProfile.email || '',
              phoneNumber: userProfile.phoneNumber || '',
              role: userProfile.role || ''
            });
            return;
          } else {
            throw new Error('No user ID available');
          }
        }
        
        console.log('Fetching user profile for ID:', targetUserId);
        
        // Try to fetch user profile from debug API
        try {
          const response = await fetch(`/api/debug/users?id=${targetUserId}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('User profile data:', data);
            
            if (data.success && data.user) {
              setProfile(data.user);
              setPhotoURL(data.user.photoURL || '');
              setFormData({
                displayName: data.user.displayName || '',
                email: data.user.email || '',
                phoneNumber: data.user.phoneNumber || '',
                role: data.user.role || ''
              });
              return;
            }
          }
          
          // If API call fails, try to fetch by email
          if (sessionProfile?.email) {
            const emailResponse = await fetch(`/api/debug/users?email=${encodeURIComponent(sessionProfile.email)}`);
            
            if (emailResponse.ok) {
              const emailData = await emailResponse.json();
              
              if (emailData.success && emailData.user) {
                setProfile(emailData.user);
                setPhotoURL(emailData.user.photoURL || '');
                setFormData({
                  displayName: emailData.user.displayName || '',
                  email: emailData.user.email || '',
                  phoneNumber: emailData.user.phoneNumber || '',
                  role: emailData.user.role || ''
                });
                return;
              }
            }
          }
          
          // If all API calls fail, use the session data
          if (sessionProfile) {
            setProfile(sessionProfile);
            setPhotoURL(sessionProfile.photoURL || '');
            setFormData({
              displayName: sessionProfile.displayName || '',
              email: sessionProfile.email || '',
              phoneNumber: sessionProfile.phoneNumber || '',
              role: sessionProfile.role || ''
            });
          } else if (user) {
            // Create a profile from the user object
            const userProfile = {
              id: (user as any).id || (user as any).uid || 'unknown',
              email: user.email || '',
              displayName: user.name || '',
              photoURL: user.image || '',
              role: (user as any).role || 'parent',
              phoneNumber: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isActive: true
            };
            setProfile(userProfile);
            setPhotoURL(userProfile.photoURL || '');
            setFormData({
              displayName: userProfile.displayName || '',
              email: userProfile.email || '',
              phoneNumber: userProfile.phoneNumber || '',
              role: userProfile.role || ''
            });
          } else {
            throw new Error('User profile not found');
          }
        } catch (error) {
          console.error('Error fetching profile from API:', error);
          
          // Use session data as fallback
          if (sessionProfile) {
            setProfile(sessionProfile);
            setPhotoURL(sessionProfile.photoURL || '');
            setFormData({
              displayName: sessionProfile.displayName || '',
              email: sessionProfile.email || '',
              phoneNumber: sessionProfile.phoneNumber || '',
              role: sessionProfile.role || ''
            });
          } else if (user) {
            // Create a profile from the user object
            const userProfile = {
              id: (user as any).id || (user as any).uid || 'unknown',
              email: user.email || '',
              displayName: user.name || '',
              photoURL: user.image || '',
              role: (user as any).role || 'parent',
              phoneNumber: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isActive: true
            };
            setProfile(userProfile);
            setPhotoURL(userProfile.photoURL || '');
            setFormData({
              displayName: userProfile.displayName || '',
              email: userProfile.email || '',
              phoneNumber: userProfile.phoneNumber || '',
              role: userProfile.role || ''
            });
          } else {
            throw new Error('User profile not found');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, sessionProfile, user]);

  const handlePhotoChange = (url: string) => {
    setPhotoURL(url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!profile?.id) {
        throw new Error('No user ID available');
      }
      
      const updatedProfile = {
        ...formData,
        photoURL,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updating user profile:', updatedProfile);
      
      // Try to update user profile using debug API
      try {
        const response = await fetch(`/api/debug/users?id=${profile.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedProfile),
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            toast.success('Profile updated successfully');
            setProfile({
              ...profile,
              ...updatedProfile
            });
            setIsEditing(false);
            return;
          }
        }
        
        // If API call fails, update the local state only
        toast.success('Profile updated locally');
        setProfile({
          ...profile,
          ...updatedProfile
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile via API:', error);
        
        // Update the local state only
        toast.success('Profile updated locally');
        setProfile({
          ...profile,
          ...updatedProfile
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">User profile not found</p>
        <p className="text-sm text-red-600 mt-2">Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">User Profile</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-6">
              <PhotoUpload
                initialPhotoURL={photoURL}
                onPhotoChange={handlePhotoChange}
                path="user-photos"
                className="h-32 w-32"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
                  disabled
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex justify-center mb-6">
              <UserProfilePhoto
                photoURL={profile.photoURL}
                displayName={profile.displayName || 'User'}
                size="lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-lg text-gray-900">{profile.displayName || 'Not set'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-lg text-gray-900">{profile.email || 'Not set'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-lg text-gray-900">{profile.phoneNumber || 'Not set'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="mt-1 text-lg text-gray-900 capitalize">{profile.role || 'Not set'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}