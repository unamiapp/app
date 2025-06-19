'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChildren } from '@/hooks/useAdminSdk';
import { useStorage } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function AddChildPage() {
  const router = useRouter();
  const { createChild, loading } = useChildren();
  const { uploadFile, progress } = useStorage();
  const { userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!userProfile) {
        throw new Error('User not authenticated');
      }
      
      let photoURL = '';
      
      // If there's a photo, upload it first
      if (photoFile) {
        try {
          const fileName = `${userProfile.id}-${Date.now()}-${photoFile.name}`;
          photoURL = await uploadFile(
            photoFile, 
            `child-images/${fileName}`
          );
          console.log("Photo uploaded successfully:", photoURL);
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast.error('Failed to upload photo, but will continue creating child profile.');
        }
      }
      
      // Create child profile data
      const childData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female' | 'other',
        photoURL: photoURL,
        guardians: [userProfile.id], // Explicitly set guardians array with current user ID
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
            name: formData.emergencyContactName,
            relationship: formData.emergencyContactRelationship,
            phone: formData.emergencyContactPhone,
          },
        },
      };
      
      // Create the child profile using our Firebase Admin SDK solution
      await createChild(childData);
      
      toast.success('Child profile created successfully!');
      router.push('/dashboard/parent/children');
    } catch (error) {
      console.error('Error creating child profile:', error);
      toast.error('Failed to create child profile. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                    Photo (optional)
                  </label>
                  <div className="mt-1 flex items-center">
                    {photoFile ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(photoFile)}
                          alt="Preview"
                          className="h-32 w-32 rounded-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoFile(null)}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div className="ml-5">
                      <div className="relative bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm flex items-center cursor-pointer hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <label
                          htmlFor="photo-upload"
                          className="relative text-sm font-medium text-gray-700 pointer-events-none"
                        >
                          <span>Upload a file</span>
                          <span className="sr-only"> photo</span>
                        </label>
                        <input
                          id="photo-upload"
                          name="photo-upload"
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handlePhotoChange}
                        />
                      </div>
                    </div>
                  </div>
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