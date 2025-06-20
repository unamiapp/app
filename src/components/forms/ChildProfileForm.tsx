'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PhotoUpload from '@/components/ui/PhotoUpload';
import { ChildProfile } from '@/types/child';

interface ChildProfileFormProps {
  initialData?: Partial<ChildProfile>;
  isEditing?: boolean;
}

export default function ChildProfileForm({ initialData, isEditing = false }: ChildProfileFormProps) {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState<string>(initialData?.photoURL || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<ChildProfile>>({
    defaultValues: initialData || {},
  });

  const onSubmit = async (data: Partial<ChildProfile>) => {
    if (!userProfile) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare child data
      const childData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: data.dateOfBirth || new Date().toISOString().split('T')[0],
        gender: (data.gender as 'male' | 'female' | 'other') || 'other',
        photoURL: photoURL || '',
        guardians: initialData?.guardians || [userProfile.id],
        identificationNumber: data.identificationNumber || '',
        schoolName: data.schoolName || '',
        address: data.address || {
          street: '',
          city: '',
          province: '',
          postalCode: ''
        }
      };

      console.log('Submitting child data:', childData);

      let response;
      
      if (isEditing && initialData?.id) {
        // Update existing child profile using debug API
        response = await fetch(`/api/debug/children?id=${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(childData),
        });
      } else {
        // Create new child profile using debug API
        response = await fetch('/api/debug/children', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(childData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save child profile');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(isEditing ? 'Child profile updated successfully' : 'Child profile created successfully');
        router.push('/dashboard/parent/children');
      } else {
        throw new Error(result.message || 'Failed to save child profile');
      }
    } catch (error: any) {
      console.error('Error saving child profile:', error);
      toast.error(error.message || 'Failed to save child profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (url: string) => {
    setPhotoURL(url);
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

          <div className="md:col-span-2 flex justify-center">
            <PhotoUpload
              initialPhotoURL={initialData?.photoURL}
              onPhotoChange={handlePhotoChange}
              path="child-photos"
              className="h-32 w-32"
            />
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