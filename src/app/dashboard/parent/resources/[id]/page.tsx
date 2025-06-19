'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useResources, Resource } from '@/hooks/useResources';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getResource } = useResources();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const resourceId = params.id as string;
        const fetchedResource = await getResource(resourceId);
        setResource(fetchedResource);
      } catch (err) {
        console.error('Error fetching resource:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [params.id, getResource]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safety':
        return 'bg-blue-100 text-blue-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'education':
        return 'bg-indigo-100 text-indigo-800';
      case 'health':
        return 'bg-green-100 text-green-800';
      case 'legal':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" color="primary" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load resource. It may have been removed or you don't have permission to view it.</span>
        </div>
        <div className="mt-6">
          <Link 
            href="/dashboard/parent/resources"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ← Back to Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link 
          href="/dashboard/parent/resources"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ← Back to Resources
        </Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        {resource.imageURL && (
          <div className="h-64 w-full overflow-hidden">
            <img 
              src={resource.imageURL} 
              alt={resource.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{resource.title}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
              {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
            </span>
          </div>
          
          <p className="mt-4 text-slate-600">{resource.description}</p>
          
          <div className="mt-6 prose prose-slate max-w-none">
            {resource.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {resource.documentURL && (
            <div className="mt-6 p-4 border border-slate-200 rounded-md bg-slate-50">
              <h3 className="text-lg font-medium text-slate-900">Related Document</h3>
              <div className="mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <a 
                  href={resource.documentURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Download Document
                </a>
              </div>
            </div>
          )}
          
          {resource.contactInfo && Object.keys(resource.contactInfo).some(key => !!resource.contactInfo?.[key as keyof typeof resource.contactInfo]) && (
            <div className="mt-6 p-4 border border-slate-200 rounded-md bg-slate-50">
              <h3 className="text-lg font-medium text-slate-900">Contact Information</h3>
              <dl className="mt-2 divide-y divide-slate-200">
                {resource.contactInfo.name && (
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-slate-500">Name</dt>
                    <dd className="text-sm text-slate-900">{resource.contactInfo.name}</dd>
                  </div>
                )}
                {resource.contactInfo.phone && (
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-slate-500">Phone</dt>
                    <dd className="text-sm text-slate-900">{resource.contactInfo.phone}</dd>
                  </div>
                )}
                {resource.contactInfo.email && (
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-slate-500">Email</dt>
                    <dd className="text-sm text-slate-900">
                      <a href={`mailto:${resource.contactInfo.email}`} className="text-indigo-600 hover:text-indigo-800">
                        {resource.contactInfo.email}
                      </a>
                    </dd>
                  </div>
                )}
                {resource.contactInfo.website && (
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-slate-500">Website</dt>
                    <dd className="text-sm text-slate-900">
                      <a href={resource.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                        {resource.contactInfo.website.replace(/^https?:\/\//, '')}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}