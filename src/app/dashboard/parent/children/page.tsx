'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChildrenRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/parent/profile');
  }, [router]);
  
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}