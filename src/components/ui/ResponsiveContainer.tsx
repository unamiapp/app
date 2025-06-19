'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * A responsive container component that adapts to different screen sizes
 */
export default function ResponsiveContainer({
  children,
  className,
  as: Component = 'div',
  maxWidth = 'lg',
  padding = 'md',
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
    none: '',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-3 sm:px-4',
    md: 'px-4 sm:px-6',
    lg: 'px-4 sm:px-6 md:px-8',
  };

  return (
    <Component
      className={cn(
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}