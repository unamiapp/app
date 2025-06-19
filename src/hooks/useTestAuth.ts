'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Admin email and password
const ADMIN_EMAIL = 'info@unamifoundation.org';
const ADMIN_PASSWORD = 'Proof321#';

/**
 * Hook for handling authentication with admin account for different roles
 */
export const useTestAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * Sign in with admin account using a specific role
   * @param role User role to sign in as
   */
  const signInAsRole = async (role: string) => {
    setIsLoading(true);
    try {
      console.log(`Signing in as ${role} using admin account`);
      
      // Sign in with NextAuth using admin credentials but specifying the role
      const result = await signIn('credentials', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role,
        redirect: false,
      });
      
      if (result?.error) {
        console.error('Login error:', result.error);
        toast.error(`Login failed: ${result.error}`);
        return false;
      }
      
      toast.success(`Signed in as ${role}`);
      
      // Manually redirect to the correct dashboard
      router.push(`/dashboard/${role}`);
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Failed to sign in');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in as parent
   */
  const signInAsParent = async () => {
    return signInAsRole('parent');
  };

  /**
   * Sign in as school
   */
  const signInAsSchool = async () => {
    return signInAsRole('school');
  };

  /**
   * Sign in as authority
   */
  const signInAsAuthority = async () => {
    return signInAsRole('authority');
  };

  /**
   * Sign in as admin
   */
  const signInAsAdmin = async () => {
    return signInAsRole('admin');
  };

  return {
    isLoading,
    signInAsParent,
    signInAsSchool,
    signInAsAuthority,
    signInAsAdmin,
  };
};

export default useTestAuth;