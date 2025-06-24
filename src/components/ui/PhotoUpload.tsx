'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface PhotoUploadProps {
  initialPhotoURL?: string;
  onPhotoChange: (url: string) => void;
  path?: string;
  className?: string;
}

export default function PhotoUpload({ 
  initialPhotoURL, 
  onPhotoChange, 
  path = 'profile-photos',
  className = 'h-24 w-24'
}: PhotoUploadProps) {
  const [photoURL, setPhotoURL] = useState(initialPhotoURL || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      formData.append('fileName', `${Date.now()}_${file.name}`);

      // First try fetch API for simpler error handling
      try {
        const response = await fetch('/api/debug/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.url) {
            setPhotoURL(data.url);
            onPhotoChange(data.url);
            toast.success('Photo uploaded successfully');
            return;
          }
        }
        
        // If fetch fails, fall back to XHR for progress tracking
        throw new Error('Fetch upload failed, trying XHR');
      } catch (fetchError) {
        console.log('Falling back to XHR upload:', fetchError);
        
        // Upload using XHR with progress tracking
        const xhr = new XMLHttpRequest();
        
        const uploadPromise = new Promise<any>((resolve, reject) => {
          xhr.open('POST', '/api/debug/upload', true);
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(progress);
            }
          };
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                reject(new Error('Invalid response format'));
              }
            } else {
              reject(new Error(`HTTP Error: ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(formData);
        });
        
        const data = await uploadPromise;
        
        if (data.success && data.url) {
          setPhotoURL(data.url);
          onPhotoChange(data.url);
          
          if (data.fallback) {
            toast.success('Photo uploaded with fallback mechanism');
          } else {
            toast.success('Photo uploaded successfully');
          }
        } else {
          throw new Error('Failed to get photo URL');
        }
      }
    }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!photoURL) return;
    
    if (!confirm('Are you sure you want to remove this photo?')) {
      return;
    }

    try {
      // Extract path from URL if it's a Firebase Storage URL
      const urlPath = photoURL.split('?')[0].split('/o/')[1];
      
      if (urlPath) {
        const decodedPath = decodeURIComponent(urlPath);
        
        // Delete using the debug API
        const response = await fetch(`/api/debug/upload?path=${decodedPath}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete photo');
        }
      }
      
      setPhotoURL('');
      onPhotoChange('');
      toast.success('Photo removed successfully');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove photo');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${className} rounded-full overflow-hidden bg-gray-200 mb-2`}>
        {photoURL ? (
          <img 
            src={photoURL} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-3/4 bg-white rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <label className="cursor-pointer px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          {photoURL ? 'Change' : 'Upload'}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            ref={fileInputRef}
          />
        </label>
        
        {photoURL && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={uploading}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}