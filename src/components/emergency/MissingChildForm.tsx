import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { useNotifications } from '@/hooks/useNotifications';
import { ChildProfile } from '@/types/child';
import { MissingChildAlert } from '@/types/child';

export default function MissingChildForm() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Partial<MissingChildAlert> & { childId: string }>();
  const selectedChildId = watch('childId');
  
  const router = useRouter();
  const { user } = useAuth();
  const { queryDocuments, createDocument, where } = useFirestore();
  const { createNotification } = useNotifications();

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const childrenData = await queryDocuments<ChildProfile>(
          'children',
          [where('guardians', 'array-contains', user.uid), where('isActive', '==', true)]
        );
        
        setChildren(childrenData);
      } catch (error) {
        console.error('Error fetching children:', error);
        toast.error('Failed to load children profiles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChildren();
  }, [user, queryDocuments, where]);

  const selectedChild = children.find(child => child.id === selectedChildId);

  const onSubmit = async (data: Partial<MissingChildAlert> & { childId: string }) => {
    if (!user) {
      toast.error('You must be logged in to report a missing child');
      return;
    }
    
    if (!selectedChild) {
      toast.error('Please select a child');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const alertId = `alert_${selectedChild.id}_${Date.now()}`;
      const dateReported = new Date().toISOString();
      
      const alertData: MissingChildAlert = {
        id: alertId,
        childId: selectedChild.id,
        reporterId: user.uid,
        status: 'active',
        dateReported,
        lastSeenLocation: {
          address: data.lastSeenLocation?.address,
          latitude: data.lastSeenLocation?.latitude,
          longitude: data.lastSeenLocation?.longitude,
          timestamp: data.lastSeenLocation?.timestamp || dateReported,
        },
        lastSeenWearing: data.lastSeenWearing,
        additionalDetails: data.additionalDetails,
      };
      
      await createDocument('alerts', alertId, alertData);
      
      // Create notifications for authorities
      await createNotification({
        userId: 'authorities', // This would be replaced with actual authority IDs in a real system
        title: 'URGENT: Missing Child Alert',
        message: `${selectedChild.firstName} ${selectedChild.lastName}, age ${calculateAge(selectedChild.dateOfBirth)}, has been reported missing.`,
        type: 'alert',
        read: false,
        data: {
          alertId,
          childId: selectedChild.id,
        }
      });
      
      toast.success('Missing child alert created successfully');
      router.push('/dashboard/parent/report/confirmation');
    } catch (error) {
      console.error('Error creating missing child alert:', error);
      toast.error('Failed to create missing child alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-sm text-gray-500">Loading children profiles...</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No children profiles found</h3>
        <p className="mt-1 text-sm text-gray-500">
          You need to add a child profile before you can report a missing child.
        </p>
        <div className="mt-6">
          <a
            href="/dashboard/parent/children/add"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add Child Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        {/* Emergency Alert Banner */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Emergency Alert
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  This form should only be used in genuine emergency situations when a child is missing. False reports are a criminal offense.
                </p>
                <p className="mt-2">
                  If you believe your child is in immediate danger, please also contact emergency services directly by calling 10111.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Select Child */}
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Select Child</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select the child who is missing.
          </p>
          
          <div className="mt-6">
            <label htmlFor="childId" className="sr-only">
              Select Child
            </label>
            <select
              id="childId"
              {...register('childId', { required: 'Please select a child' })}
              className={`input ${errors.childId ? 'border-red-300 focus:ring-red-500' : ''}`}
            >
              <option value="">Select a child</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName} ({calculateAge(child.dateOfBirth)} years old)
                </option>
              ))}
            </select>
            {errors.childId && (
              <p className="mt-2 text-sm text-red-600">{errors.childId.message}</p>
            )}
          </div>
        </div>

        {selectedChild && (
          <>
            {/* Child Information Summary */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-md font-medium text-gray-900">Child Information</h4>
              <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedChild.firstName} {selectedChild.lastName}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Age</dt>
                  <dd className="mt-1 text-sm text-gray-900">{calculateAge(selectedChild.dateOfBirth)} years old</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{selectedChild.gender}</dd>
                </div>
                {selectedChild.school?.name && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">School</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedChild.school.name}</dd>
                  </div>
                )}
                {selectedChild.physicalAttributes && (
                  <>
                    {selectedChild.physicalAttributes.height && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Height</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedChild.physicalAttributes.height} cm</dd>
                      </div>
                    )}
                    {selectedChild.physicalAttributes.weight && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Weight</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedChild.physicalAttributes.weight} kg</dd>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Last Seen Information */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Last Seen Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please provide details about when and where the child was last seen.
              </p>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="lastSeenAddress" className="label">
                    Last seen location (address or description)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="lastSeenAddress"
                      {...register('lastSeenLocation.address', { required: 'Last seen location is required' })}
                      className={`input ${errors.lastSeenLocation?.address ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="e.g. Corner of Main St and Park Ave, or Sunshine Mall"
                    />
                    {errors.lastSeenLocation?.address && (
                      <p className="mt-2 text-sm text-red-600">{errors.lastSeenLocation.address.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastSeenDate" className="label">
                    Date last seen
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="lastSeenDate"
                      {...register('lastSeenLocation.timestamp', { required: 'Date last seen is required' })}
                      className={`input ${errors.lastSeenLocation?.timestamp ? 'border-red-300 focus:ring-red-500' : ''}`}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {errors.lastSeenLocation?.timestamp && (
                      <p className="mt-2 text-sm text-red-600">{errors.lastSeenLocation.timestamp.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastSeenTime" className="label">
                    Time last seen (approximate)
                  </label>
                  <div className="mt-1">
                    <input
                      type="time"
                      id="lastSeenTime"
                      {...register('lastSeenTime')}
                      className="input"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="lastSeenWearing" className="label">
                    What was the child wearing?
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="lastSeenWearing"
                      rows={3}
                      {...register('lastSeenWearing', { required: 'This information is required' })}
                      className={`input ${errors.lastSeenWearing ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Describe clothing, shoes, accessories, etc."
                    />
                    {errors.lastSeenWearing && (
                      <p className="mt-2 text-sm text-red-600">{errors.lastSeenWearing.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="additionalDetails" className="label">
                    Additional details
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="additionalDetails"
                      rows={4}
                      {...register('additionalDetails')}
                      className="input"
                      placeholder="Any other relevant information such as who they were with, their emotional state, where they might have gone, etc."
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="pt-5 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 btn bg-red-600 hover:bg-red-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Emergency Alert'}
          </button>
        </div>
      </div>
    </form>
  );
}