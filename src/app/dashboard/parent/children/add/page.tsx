'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Using direct API calls instead of useChildren hook
import PhotoUpload from '@/components/ui/PhotoUpload';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function AddChildPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  const { userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    identificationNumber: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    schoolName: '',
    bloodType: '',
    allergies: '',
    conditions: '',
    medications: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (url: string) => {
    setPhotoURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || loading) {
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      // Create child profile data
      const childData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female' | 'other',
        photoURL: photoURL || '', // Use empty string if no photo
        guardians: [userProfile.id], // Explicitly set guardians array with current user ID
        parentId: userProfile.id, // Also set parentId for new data model
        identificationNumber: formData.identificationNumber || '',
        schoolName: formData.schoolName || '',
        address: {
          street: formData.street || '',
          city: formData.city || '',
          province: formData.province || '',
          postalCode: formData.postalCode || '',
        },
        medicalInfo: {
          bloodType: formData.bloodType || '',
          allergies: formData.allergies ? formData.allergies.split(',').map(item => item.trim()) : [],
          conditions: formData.conditions ? formData.conditions.split(',').map(item => item.trim()) : [],
          medications: formData.medications ? formData.medications.split(',').map(item => item.trim()) : [],
          emergencyContact: {
            name: formData.emergencyContactName || '',
            relationship: formData.emergencyContactRelationship || '',
            phone: formData.emergencyContactPhone || '',
          },
        },
      };
      
      console.log('Creating child profile with data:', { ...childData, photoURL: photoURL ? 'Set' : 'Not set' });
      
      // Try debug API first as it's more reliable
      let success = false;
      
      try {
        console.log('Trying debug API first');
        const debugResponse = await fetch('/api/debug/children', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(childData),
        });
        
        const debugResult = await debugResponse.json();
        
        if (debugResult.success) {
          success = true;
          console.log('Debug API success:', debugResult);
          toast.success('Child profile created successfully!');
          
          // Log activity
          try {
            await fetch('/api/debug/activities', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'profile',
                title: 'Child Profile Created',
                description: `Created profile for ${formData.firstName} ${formData.lastName}`,
                status: 'success'
              })
            });
          } catch (activityError) {
            console.error('Failed to log activity:', activityError);
          }
        } else {
          console.log('Debug API failed:', debugResult);
          throw new Error(debugResult.message || 'Failed to create child profile');
        }
      } catch (debugError) {
        console.error('Debug API error:', debugError);
        
        // Fallback to admin-sdk API
        try {
          console.log('Falling back to admin-sdk API');
          const response = await fetch('/api/admin-sdk/children', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(childData),
          });
          
          const result = await response.json();
          
          if (result.success) {
            success = true;
            console.log('Admin SDK API success:', result);
            toast.success('Child profile created successfully!');
            
            // Log activity
            try {
              await fetch('/api/debug/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'profile',
                  title: 'Child Profile Created',
                  description: `Created profile for ${formData.firstName} ${formData.lastName}`,
                  status: 'success'
                })
              });
            } catch (activityError) {
              console.error('Failed to log activity:', activityError);
            }
          } else {
            throw new Error(result.message || 'Failed to create child profile');
          }
        } catch (adminError) {
          console.error('Admin SDK API error:', adminError);
          throw adminError;
        }
      }
      
      if (success) {
        // Navigate to children page only if successful
        router.push('/dashboard/parent/children');
      }
    } catch (error) {
      console.error('Error creating child profile:', error);
      toast.error('Failed to create child profile. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Add Child Profile</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create a new profile for your child with all the necessary information.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Basic Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details of your child.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of birth
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <div className="mt-1">
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="identificationNumber" className="block text-sm font-medium text-gray-700">
                    Identification Number (optional)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="identificationNumber"
                      id="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                    School Name (optional)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="schoolName"
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Photo upload field */}
                <div className="sm:col-span-6">
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                    Photo (optional)
                  </label>
                  <PhotoUpload
                    onPhotoChange={handlePhotoChange}
                    path="child-photos"
                    className="h-32 w-32"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Address Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Child's residential address.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="street"
                      id="street"
                      value={formData.street}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                    Province
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="province"
                      id="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Medical Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Child's health information.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                    Blood Type (optional)
                  </label>
                  <div className="mt-1">
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                    Allergies (optional, comma separated)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="allergies"
                      id="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="e.g. Peanuts, Dairy, Pollen"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="conditions" className="block text-sm font-medium text-gray-700">
                    Medical Conditions (optional, comma separated)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="conditions"
                      name="conditions"
                      rows={3}
                      value={formData.conditions}
                      onChange={handleChange}
                      placeholder="e.g. Asthma, Diabetes, Epilepsy"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="medications" className="block text-sm font-medium text-gray-700">
                    Medications (optional, comma separated)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="medications"
                      name="medications"
                      rows={3}
                      value={formData.medications}
                      onChange={handleChange}
                      placeholder="e.g. Insulin, Inhaler, Antihistamines"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Emergency Contact</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Person to contact in case of emergency.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">
                    Contact Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="emergencyContactName"
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700">
                    Relationship
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      id="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleChange}
                      placeholder="e.g. Grandparent, Aunt, Uncle"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting || loading ? 'Saving...' : 'Save Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}