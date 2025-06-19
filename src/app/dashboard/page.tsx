'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardRedirect() {
  const router = useRouter();
  const { userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && userProfile) {
      // Redirect based on user role
      const role = userProfile.role || 'parent';
      router.push(`/dashboard/${role}`);
    }
  }, [userProfile, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="large" color="primary" />
    </div>
  );
}