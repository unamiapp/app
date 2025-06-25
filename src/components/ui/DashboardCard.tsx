'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  title?: string | ReactNode;
  titleAction?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated' | 'flat';
  onClick?: () => void;
  href?: string;
  isLoading?: boolean;
}

export function DashboardCard({
  children,
  className,
  title,
  titleAction,
  icon,
  footer,
  padding = 'md',
  variant = 'default',
  onClick,
  href,
  isLoading = false,
}: DashboardCardProps) {
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-md hover:shadow-lg',
    bordered: 'bg-white border border-gray-200 hover:border-gray-300',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    flat: 'bg-white',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-5 sm:p-8',
  };
  
  const baseClasses = cn(
    'rounded-xl transition-all duration-200',
    variantClasses[variant],
    padding !== 'none' && paddingClasses[padding],
    className
  );
  
  const content = (
    <>
      {(title || titleAction) && (
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          {title && (
            <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              {title}
            </h2>
          )}
          {titleAction && (
            <div>{titleAction}</div>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ) : (
        <div>{children}</div>
      )}
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </>
  );
  
  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {content}
      </a>
    );
  }
  
  if (onClick) {
    return (
      <button onClick={onClick} className={cn(baseClasses, 'w-full text-left')}>
        {content}
      </button>
    );
  }
  
  return <div className={baseClasses}>{content}</div>;
}

export default DashboardCard;