'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider as CustomAuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CustomAuthProvider>
        <Toaster position="top-right" />
        {children}
      </CustomAuthProvider>
    </SessionProvider>
  );
}