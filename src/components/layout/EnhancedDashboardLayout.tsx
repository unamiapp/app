'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types/user';

interface EnhancedDashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  role: UserRole;
  showBackButton?: boolean;
  backUrl?: string;
  actions?: ReactNode;
}

export default function EnhancedDashboardLayout({
  children,
  title,
  description,
  role,
  showBackButton = false,
  backUrl,
  actions
}: EnhancedDashboardLayoutProps) {
  const { userProfile } = useAuth();
  
  return (
    <Container size="lg" padding="md" className="py-4 sm:py-6">
      {(title || description || actions) && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 mb-5 sm:mb-6 transition-all duration-200 hover:shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-auto">
              {showBackButton && (
                <Button 
                  as="a"
                  href={backUrl || `/dashboard/${role}`} 
                  variant="link"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2 p-0"
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  }
                >
                  Back
                </Button>
              )}
              {title && (
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 animate-fade-in">{title}</h1>
              )}
              {description && (
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              )}
            </div>
            {actions && (
              <div className="mt-4 sm:mt-0 sm:ml-16 flex-none">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="animate-fade-in">
        {children}
      </div>
    </Container>
  );
}