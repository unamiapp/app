'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import PhotoUpload from '@/components/ui/PhotoUpload';

interface UserProfilePhotoProps {
  photoURL?: string;
  displayName?: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  className?: string;
  onPhotoChange?: (url: string) => void;
}

export default function UserProfilePhoto({
  photoURL,
  displayName = 'User',
  size = 'md',
  editable = false,
  className = '',
  onPhotoChange
}: UserProfilePhotoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPhotoURL, setCurrentPhotoURL] = useState(photoURL || '');
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };
  
  const fontSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  };
  
  const handlePhotoChange = (url: string) => {
    setCurrentPhotoURL(url);
    if (onPhotoChange) {
      onPhotoChange(url);
    }
    setIsEditing(false);
    
    // If this is a profile update, we should update the user profile
    if (url && editable) {
      updateUserProfile(url).catch(error => {
        console.error('Error updating profile photo:', error);
        toast.error('Failed to update profile photo');
      });
    }
  };
  
  const updateUserProfile = async (photoURL: string) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoURL }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      toast.success('Profile photo updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  
  if (isEditing && editable) {
    return (
      <div className="relative">
        <PhotoUpload
          initialPhotoURL={currentPhotoURL}
          onPhotoChange={handlePhotoChange}
          path="profile-photos"
          className={sizeClasses.lg}
        />
        <button
          onClick={() => setIsEditing(false)}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      {currentPhotoURL ? (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200`}>
          <img
            src={currentPhotoURL}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-indigo-600 flex items-center justify-center text-white`}>
          <span className={fontSizeClasses[size]}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      {editable && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm border border-gray-300 hover:bg-gray-100"
          title="Change photo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
    </div>
  );
}