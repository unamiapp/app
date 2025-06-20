'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ReportMissingChildPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [formData, setFormData] = useState({
    childId: '',
    type: 'missing',
    description: '',
    lastSeenLocation: '',
    lastSeenWearing: '',
    contactInfo: '',
    // Additional fields to match database structure
    lastSeenDate: new Date().toISOString().split('T')[0],
    lastSeenTime: new Date().toTimeString().slice(0, 5),
    clothingDescription: '',
    additionalInfo: ''
  });

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        // Use the debug API that's working correctly
        const response = await fetch('/api/debug/children');
        if (response.ok) {
          const data = await response.json();
          setChildren(data.children || []);
        } else {
          toast.error('Failed to load children');
        }
      } catch (error) {
        console.error('Error fetching children:', error);
        toast.error('Failed to load children');
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildren();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.childId) {
        toast.error('Please select a child');
        setLoading(false);
        return;
      }

      // Get selected child details to include in the alert
      const selectedChild = children.find(child => child.id === formData.childId);
      
      // Prepare the data with the correct structure matching the database
      const alertData = {
        ...formData,
        childName: selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : '',
        contactPhone: formData.contactInfo,
        additionalInfo: formData.description,
        clothingDescription: formData.lastSeenWearing,
        // Ensure these fields are properly set
        lastSeen: {
          date: formData.lastSeenDate,
          time: formData.lastSeenTime,
          location: formData.lastSeenLocation,
          description: formData.lastSeenWearing
        }
      };
      
      const response = await fetch('/api/parent/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Alert created successfully');
        router.push('/dashboard/parent/alerts');
      } else {
        if (data.code === 'duplicate-alert') {
          toast.error('An active alert already exists for this child');
        } else {
          toast.error(data.error || 'Failed to create alert');
        }
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report Missing Child</h1>
        <p className="mt-1 text-sm text-gray-600">
          Please provide as much information as possible to help locate your child.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="childId" className="block text-sm font-medium text-gray-700">Select Child</label>
          <select
            id="childId"
            value={formData.childId}
            onChange={(e) => setFormData({...formData, childId: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
            disabled={loadingChildren}
          >
            <option value="">Select a child</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
          {loadingChildren && (
            <p className="mt-1 text-sm text-gray-500">Loading children...</p>
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Alert Type</label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="missing">Missing Child</option>
            <option value="medical">Medical Emergency</option>
            <option value="danger">Danger Alert</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
            placeholder="Provide details about what happened"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="lastSeenDate" className="block text-sm font-medium text-gray-700">Date Last Seen</label>
            <input
              type="date"
              id="lastSeenDate"
              value={formData.lastSeenDate}
              onChange={(e) => setFormData({...formData, lastSeenDate: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label htmlFor="lastSeenTime" className="block text-sm font-medium text-gray-700">Time Last Seen</label>
            <input
              type="time"
              id="lastSeenTime"
              value={formData.lastSeenTime}
              onChange={(e) => setFormData({...formData, lastSeenTime: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="lastSeenLocation" className="block text-sm font-medium text-gray-700">Last Seen Location</label>
          <input
            type="text"
            id="lastSeenLocation"
            value={formData.lastSeenLocation}
            onChange={(e) => setFormData({...formData, lastSeenLocation: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Where was your child last seen?"
            required
          />
        </div>

        <div>
          <label htmlFor="lastSeenWearing" className="block text-sm font-medium text-gray-700">Last Seen Wearing</label>
          <input
            type="text"
            id="lastSeenWearing"
            value={formData.lastSeenWearing}
            onChange={(e) => setFormData({...formData, lastSeenWearing: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="What was your child wearing?"
          />
        </div>

        <div>
          <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">Contact Information</label>
          <input
            type="text"
            id="contactInfo"
            value={formData.contactInfo}
            onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
            placeholder="Your phone number or other contact information"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Report Missing Child'}
          </button>
        </div>
      </form>
    </div>
  );
}