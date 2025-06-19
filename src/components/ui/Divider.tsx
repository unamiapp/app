'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, text, ...props }, ref) => {
    if (!text) {
      return (
        <div
          ref={ref}
          className={cn("w-full h-px bg-gray-200 my-6", className)}
          {...props}
        />
      );
    }

    return (
      <div ref={ref} className={cn("relative my-6", className)} {...props}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">{text}</span>
        </div>
      </div>
    );
  }
);

Divider.displayName = "Divider";

export { Divider };