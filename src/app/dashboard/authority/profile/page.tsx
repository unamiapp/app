'use client';

import UserProfile from '@/components/profile/UserProfile';

export default function AuthorityProfilePage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and edit your profile information
          </p>
        </div>
      </div>
      
      <UserProfile />
    </div>
  );
}