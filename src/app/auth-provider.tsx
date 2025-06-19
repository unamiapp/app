'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider as CustomAuthProvider } from '@/hooks/useAuth';

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CustomAuthProvider>{children}</CustomAuthProvider>
    </SessionProvider>
  );
}