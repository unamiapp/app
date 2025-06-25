'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface DividerProps {
  className?: string;
  text?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
}

export function Divider({
  className,
  text,
  orientation = 'horizontal',
  variant = 'solid',
}: DividerProps) {
  const variantClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  if (text) {
    return (
      <div className={cn('flex items-center', className)}>
        <div className={cn('flex-grow border-t border-gray-300', variantClasses[variant])} />
        <span className="flex-shrink px-3 text-sm text-gray-500">{text}</span>
        <div className={cn('flex-grow border-t border-gray-300', variantClasses[variant])} />
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'self-stretch w-px h-auto mx-2 border-l border-gray-300',
          variantClasses[variant],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'w-full border-t border-gray-300 my-4',
        variantClasses[variant],
        className
      )}
    />
  );
}

export default Divider;