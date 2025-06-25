'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centered?: boolean;
}

export function Container({
  children,
  className,
  as: Component = 'div',
  size = 'lg',
  padding = 'md',
  centered = false,
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
    auto: 'max-w-none',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-3 sm:px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-5 sm:px-8 lg:px-12',
  };

  return (
    <Component
      className={cn(
        'w-full mx-auto',
        sizeClasses[size],
        paddingClasses[padding],
        centered && 'flex flex-col items-center',
        className
      )}
    >
      {children}
    </Component>
  );
}

export default Container;