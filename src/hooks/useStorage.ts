'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import { useAuth } from './useAuth';

export interface UploadProgress {
  progress: number;
  downloadURL: string | null;
  error: Error | null;
  isComplete: boolean;
}

export const useStorage = () => {
  const [progress, setProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const { userProfile } = useAuth();

  /**
   * Upload a file to Firebase Storage
   * @param file - The file to upload
   * @param path - The storage path (e.g., 'child-images')
   * @param customFileName - Optional custom file name
   * @returns A promise that resolves to the download URL
   */
  const uploadFile = (file: File, path: string, customFileName?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Generate a unique file name
      const timestamp = new Date().getTime();
      const userId = userProfile?.id || 'anonymous';
      const fileExtension = file.name.split('.').pop();
      const fileName = customFileName 
        ? `${customFileName}.${fileExtension}` 
        : `${userId}_${timestamp}_${file.name}`;
      
      // Create storage reference
      const storageRef = ref(storage, `${path}/${fileName}`);
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Track upload progress
      const uploadId = `${path}-${fileName}`;
      setUploadProgress(prev => ({
        ...prev,
        [uploadId]: {
          progress: 0,
          downloadURL: null,
          error: null,
          isComplete: false
        }
      }));
      
      // Listen for state changes
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Update progress
          const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(currentProgress);
          setUploadProgress(prev => ({
            ...prev,
            [uploadId]: {
              ...prev[uploadId],
              progress: currentProgress
            }
          }));
        },
        (error) => {
          // Handle error
          setUploadProgress(prev => ({
            ...prev,
            [uploadId]: {
              ...prev[uploadId],
              error,
              isComplete: true
            }
          }));
          reject(error);
        },
        async () => {
          // Upload complete, get download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(prev => ({
              ...prev,
              [uploadId]: {
                ...prev[uploadId],
                downloadURL,
                isComplete: true
              }
            }));
            resolve(downloadURL);
          } catch (error) {
            setUploadProgress(prev => ({
              ...prev,
              [uploadId]: {
                ...prev[uploadId],
                error: error as Error,
                isComplete: true
              }
            }));
            reject(error);
          }
        }
      );
    });
  };

  /**
   * Delete a file from Firebase Storage
   * @param url - The download URL of the file to delete
   * @returns A promise that resolves when the file is deleted
   */
  const deleteFile = async (url: string): Promise<void> => {
    try {
      // Extract the path from the URL
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  /**
   * Get the progress of a specific upload
   * @param path - The storage path
   * @param fileName - The file name
   * @returns The upload progress or null if not found
   */
  const getUploadProgress = (path: string, fileName: string): UploadProgress | null => {
    const uploadId = `${path}-${fileName}`;
    return uploadProgress[uploadId] || null;
  };

  /**
   * Clear the progress of a specific upload
   * @param path - The storage path
   * @param fileName - The file name
   */
  const clearUploadProgress = (path: string, fileName: string): void => {
    const uploadId = `${path}-${fileName}`;
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[uploadId];
      return newProgress;
    });
  };

  return {
    uploadFile,
    deleteFile,
    progress,
    uploadProgress,
    getUploadProgress,
    clearUploadProgress
  };
};