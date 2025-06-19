'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useStorage } from '@/hooks/useStorage';
import { useChildProfiles, CreateChildData } from '@/hooks/useChildProfiles';
import { ChildProfile } from '@/types/child';

interface ChildProfileFormProps {
  initialData?: Partial<ChildProfile>;
  isEditing?: boolean;
}

export default function ChildProfileForm({ initialData, isEditing = false }: ChildProfileFormProps) {
  const { user, userProfile } = useAuth();
  const { uploadFile } = useStorage();
  const { createChild, updateChild } = useChildProfiles();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoURL || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<ChildProfile>>({
    defaultValues: initialData || {},
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: Partial<ChildProfile>) => {
    if (!user || !userProfile) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setIsLoading(true);
    try {
      let photoURL = initialData?.photoURL || '';

      // Upload photo if a new one was selected
      if (photoFile) {
        try {
          photoURL = await uploadFile(photoFile, 'child-images');
          console.log('Photo uploaded successfully:', photoURL);
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
          toast.error('Photo upload failed, but profile will be saved without photo');
          // Don't return - continue with form submission
          photoURL = initialData?.photoURL || ''; // Keep existing photo or empty
        }
      }

      // Prepare child data
      const childData: CreateChildData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: data.dateOfBirth || new Date().toISOString().split('T')[0],
        gender: (data.gender as 'male' | 'female' | 'other') || 'other',
        photoURL: photoURL || undefined,
        guardians: initialData?.guardians || [userProfile.id],
        identificationNumber: data.identificationNumber,
        schoolName: data.schoolName,
        address: data.address,
        medicalInfo: data.medicalInfo
      };

      console.log('Submitting child data:', childData);

      if (isEditing && initialData?.id) {
        // Update existing child profile
        await updateChild(initialData.id, childData);
        toast.success('Child profile updated successfully');
      } else {
        // Create new child profile
        await createChild(childData);
        toast.success('Child profile created successfully');
      }

      router.push('/dashboard/parent/children');
    } catch (error: any) {
      console.error('Error saving child profile:', error);
      toast.error('Failed to create child profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.firstName ? 'border-red-500' : ''}`}
              {...register('firstName', { required: 'First name is required' })}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.lastName ? 'border-red-500' : ''}`}
              {...register('lastName', { required: 'Last name is required' })}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.dateOfBirth ? 'border-red-500' : ''}`}
              {...register('dateOfBirth', { required: 'Date of birth is required' })}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.gender ? 'border-red-500' : ''}`}
              {...register('gender', { required: 'Gender is required' })}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <div className="mt-1 flex items-center">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Child photo preview"
                    className="h-32 w-32 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="ml-5">
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Change
                </label>
                <input
                  id="photo-upload"
                  name="photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* School Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">School Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
              School Name
            </label>
            <input
              type="text"
              id="schoolName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              {...register('schoolName')}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
              {isEditing ? 'Updating...' : 'Saving...'}
            </div>
          ) : (
            isEditing ? 'Update Child Profile' : 'Save Child Profile'
          )}
        </button>
      </div>
    </form>
  );
}