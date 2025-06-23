'use client';

import UserProfile from '@/components/profile/UserProfile';
import ChildrenList from '@/components/parent/ChildrenList';
import Link from 'next/link';

export default function ParentProfilePage() {

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and edit your profile information and manage your children
          </p>
        </div>
      </div>
      
      {/* User Profile Section */}
      <div className="mb-8">
        <UserProfile />
      </div>
      
      {/* Children Management Section */}
      <div className="border-t border-gray-200 pt-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h2 className="text-xl font-semibold text-gray-900">My Children</h2>
            <p className="mt-1 text-sm text-gray-700">
              Manage your children's profiles
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href="/dashboard/parent/children/add"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Add Child
            </Link>
          </div>
        </div>

        <ChildrenList />
      </div>
    </div>
  );
}