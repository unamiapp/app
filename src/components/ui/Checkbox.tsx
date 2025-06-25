'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  className?: string;
  labelClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, labelClassName, ...props }, ref) => {
    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            className={cn(
              'h-4 w-4 sm:h-5 sm:w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500',
              error && 'border-red-500',
              props.disabled && 'opacity-50 cursor-not-allowed'
            )}
            ref={ref}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-2 sm:ml-3 text-sm">
            {label && (
              <label
                htmlFor={props.id}
                className={cn(
                  'font-medium text-gray-700',
                  props.disabled && 'opacity-50 cursor-not-allowed',
                  labelClassName
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500 mt-0.5">{description}</p>
            )}
            {error && <p className="text-red-600 mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;