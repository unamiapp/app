'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ViewChildPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChild = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin-sdk/children?id=${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setChild(data.child);
        } else {
          throw new Error(data.error || 'Child not found');
        }
      } catch (err) {
        console.error('Error fetching child:', err);
        setError(err instanceof Error ? err.message : 'Failed to load child profile');
      } finally {
        setLoading(false);
      }
    };

    fetchChild();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || 'Child profile not found'}</p>
          <Link 
            href="/dashboard/parent/profile"
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Children List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/dashboard/parent/profile"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
        >
          ← Back to Children List
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {child.firstName} {child.lastName}
            </h1>
            <p className="text-gray-600">Child Profile</p>
          </div>
          <Link
            href={`/dashboard/parent/children/edit/${child.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Photo and Basic Info */}
          <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <div className="flex-shrink-0">
              {child.photoURL ? (
                <img 
                  className="h-32 w-32 rounded-full object-cover border-4 border-gray-200" 
                  src={child.photoURL} 
                  alt={`${child.firstName} ${child.lastName}`}
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-gray-200">
                  <span className="text-3xl font-bold text-white">
                    {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {child.firstName} {child.lastName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Date of Birth:</span>
                  <p className="text-gray-600">{new Date(child.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Gender:</span>
                  <p className="text-gray-600 capitalize">{child.gender}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Age:</span>
                  <p className="text-gray-600">
                    {Math.floor((new Date().getTime() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} years old
                  </p>
                </div>
                {child.identificationNumber && (
                  <div>
                    <span className="font-medium text-gray-700">ID Number:</span>
                    <p className="text-gray-600">{child.identificationNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* School Information */}
          {child.schoolName && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">School Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{child.schoolName}</p>
              </div>
            </div>
          )}

          {/* Address */}
          {child.address && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Address</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  {child.address.street && `${child.address.street}, `}
                  {child.address.city && `${child.address.city}, `}
                  {child.address.province && `${child.address.province} `}
                  {child.address.postalCode}
                </p>
              </div>
            </div>
          )}

          {/* Medical Information */}
          {child.medicalInfo && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {child.medicalInfo.bloodType && (
                  <div>
                    <span className="font-medium text-gray-700">Blood Type:</span>
                    <span className="ml-2 text-gray-600">{child.medicalInfo.bloodType}</span>
                  </div>
                )}
                {child.medicalInfo.allergies && child.medicalInfo.allergies.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Allergies:</span>
                    <p className="text-gray-600">{child.medicalInfo.allergies.join(', ')}</p>
                  </div>
                )}
                {child.medicalInfo.conditions && child.medicalInfo.conditions.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Medical Conditions:</span>
                    <p className="text-gray-600">{child.medicalInfo.conditions.join(', ')}</p>
                  </div>
                )}
                {child.medicalInfo.medications && child.medicalInfo.medications.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Medications:</span>
                    <p className="text-gray-600">{child.medicalInfo.medications.join(', ')}</p>
                  </div>
                )}
                {child.medicalInfo.emergencyContact && (
                  <div>
                    <span className="font-medium text-gray-700">Emergency Contact:</span>
                    <p className="text-gray-600">
                      {child.medicalInfo.emergencyContact.name} ({child.medicalInfo.emergencyContact.relationship}) - {child.medicalInfo.emergencyContact.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Dates */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
              {child.createdAt && (
                <div>
                  <span className="font-medium">Profile Created:</span>
                  <p>{new Date(child.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              {child.updatedAt && (
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p>{new Date(child.updatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}