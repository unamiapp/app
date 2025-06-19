'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { useChildren } from '@/hooks/useAdminSdk';
import { ChildProfile } from '@/types/child';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AlertFormData {
  childId: string;
  lastSeen: string;
  lastSeenLocation: string;
  lastSeenTime: string;
  description: string;
  clothingDescription: string;
  contactPhone: string;
  additionalInfo?: string;
}

export default function ReportMissingPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { getChildren } = useChildren();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<AlertFormData>();
  
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const childrenData = await getChildren();
        setChildren(childrenData);
      } catch (error) {
        console.error('Error fetching children:', error);
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildren();
  }, [getChildren]);
  
  const selectedChildId = watch('childId');
  const selectedChild = children.find(child => child.id === selectedChildId);
  
  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const onSubmit: SubmitHandler<AlertFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const alertData = {
        childId: data.childId,
        childName: `${selectedChild?.firstName} ${selectedChild?.lastName}`,
        childAge: selectedChild ? calculateAge(selectedChild.dateOfBirth) : 0,
        childPhoto: selectedChild?.photoURL || '',
        lastSeen: {
          date: data.lastSeen,
          time: data.lastSeenTime,
          location: data.lastSeenLocation,
          description: data.description
        },
        clothingDescription: data.clothingDescription,
        contactPhone: data.contactPhone,
        additionalInfo: data.additionalInfo || ''
      };
      
      const response = await fetch('/api/admin-sdk/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create alert');
      }
      
      // Navigate to confirmation page
      router.push('/dashboard/parent/report/confirmation');
    } catch (error) {
      console.error('Error submitting alert:', error);
      setSubmitError('Failed to submit alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loadingChildren) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" color="primary" />
      </div>
    );
  }
  
  if (children.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">No children registered!</strong>
          <span className="block sm:inline"> You need to register a child before you can report them missing.</span>
          <div className="mt-4">
            <button
              onClick={() => router.push('/dashboard/parent/children/add')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register a Child
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-slate-900">Report Missing Child</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please provide as much information as possible to help locate your child quickly.
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {submitError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{submitError}</span>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Child Selection */}
                <div>
                  <label htmlFor="childId" className="block text-sm font-medium text-slate-700">
                    Select Child
                  </label>
                  <select
                    id="childId"
                    {...register('childId', { required: 'Please select a child' })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a child</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.firstName} {child.lastName} ({calculateAge(child.dateOfBirth)} years old)
                      </option>
                    ))}
                  </select>
                  {errors.childId && (
                    <p className="mt-1 text-sm text-red-600">{errors.childId.message}</p>
                  )}
                </div>
                
                {selectedChild && (
                  <div className="bg-indigo-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-indigo-800">Selected Child Information</h3>
                    <div className="mt-2 flex items-center">
                      {selectedChild.photoURL ? (
                        <img 
                          src={selectedChild.photoURL} 
                          alt={`${selectedChild.firstName} ${selectedChild.lastName}`} 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-indigo-200 flex items-center justify-center">
                          <span className="text-xl font-medium text-indigo-600">
                            {selectedChild.firstName.charAt(0)}{selectedChild.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-indigo-900">
                          {selectedChild.firstName} {selectedChild.lastName}
                        </p>
                        <p className="text-sm text-indigo-700">
                          Age: {calculateAge(selectedChild.dateOfBirth)} years
                        </p>
                        <p className="text-sm text-indigo-700">
                          Gender: {selectedChild.gender}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Last Seen Information */}
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="lastSeen" className="block text-sm font-medium text-slate-700">
                      Last Seen Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        id="lastSeen"
                        {...register('lastSeen', { required: 'Last seen date is required' })}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {errors.lastSeen && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastSeen.message}</p>
                    )}
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="lastSeenTime" className="block text-sm font-medium text-slate-700">
                      Last Seen Time (Approximate)
                    </label>
                    <div className="mt-1">
                      <input
                        type="time"
                        id="lastSeenTime"
                        {...register('lastSeenTime', { required: 'Last seen time is required' })}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                      />
                    </div>
                    {errors.lastSeenTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastSeenTime.message}</p>
                    )}
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="lastSeenLocation" className="block text-sm font-medium text-slate-700">
                      Last Seen Location
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="lastSeenLocation"
                        {...register('lastSeenLocation', { required: 'Last seen location is required' })}
                        placeholder="e.g. School, Park, Home, etc."
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                      />
                    </div>
                    {errors.lastSeenLocation && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastSeenLocation.message}</p>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="clothingDescription" className="block text-sm font-medium text-slate-700">
                    Clothing Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="clothingDescription"
                      rows={3}
                      {...register('clothingDescription', { required: 'Clothing description is required' })}
                      placeholder="Describe what the child was wearing when last seen"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                  </div>
                  {errors.clothingDescription && (
                    <p className="mt-1 text-sm text-red-600">{errors.clothingDescription.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                    Circumstances
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      rows={3}
                      {...register('description', { required: 'Description is required' })}
                      placeholder="Describe the circumstances of the disappearance"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                  </div>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
                
                {/* Contact Information */}
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-700">
                    Contact Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="contactPhone"
                      {...register('contactPhone', { required: 'Contact phone is required' })}
                      placeholder="Phone number where you can be reached"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                  </div>
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                  )}
                </div>
                
                {/* Additional Information */}
                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-slate-700">
                    Additional Information (Optional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="additionalInfo"
                      rows={3}
                      {...register('additionalInfo')}
                      placeholder="Any other information that might help locate the child"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="mr-3 py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="small" color="white" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Report Missing Child'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}