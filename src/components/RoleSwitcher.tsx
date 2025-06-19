'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user';
import { useSession } from 'next-auth/react';

interface RoleSwitcherProps {
  className?: string;
}

export default function RoleSwitcher({ className = '' }: RoleSwitcherProps) {
  const { switchRole } = useAuth();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  const currentRole = (session?.user as any)?.role || 'admin';
  const availableRoles = (session?.user as any)?.roles || ['admin'];
  
  const handleRoleSwitch = async (role: UserRole) => {
    if (role === currentRole) return;
    
    setIsLoading(true);
    try {
      await switchRole(role);
    } catch (error) {
      console.error('Error switching role:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (availableRoles.length <= 1) return null;
  
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-gray-500">Switch Dashboard</h3>
      <div className="flex flex-wrap gap-2">
        {availableRoles.map((role: string) => (
          <button
            key={role}
            onClick={() => handleRoleSwitch(role as UserRole)}
            disabled={isLoading || role === currentRole}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              role === currentRole
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}