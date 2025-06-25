'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated' | 'flat' | 'auth' | 'interactive';
  href?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  variant = 'default',
  href,
  onClick,
  padding = 'md',
}: CardProps) {
  const variantClasses = {
    default: 'bg-white border border-slate-200 shadow-sm hover:shadow-md',
    bordered: 'bg-white border border-slate-200 hover:border-slate-300',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    flat: 'bg-white',
    auth: 'bg-white border border-slate-200 shadow-lg',
    interactive: 'bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 cursor-pointer',
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
  
  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }
  
  if (onClick) {
    return (
      <button onClick={onClick} className={cn(baseClasses, 'w-full text-left')}>
        {children}
      </button>
    );
  }
  
  return <div className={baseClasses}>{children}</div>;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}

export function CardHeader({ children, className = '', bordered = true }: CardHeaderProps) {
  return (
    <div className={cn(
      'px-4 py-3 sm:px-6 sm:py-4',
      bordered && 'border-b border-slate-200',
      className
    )}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({ children, className = '', as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component className={cn('text-lg font-medium text-slate-900', className)}>
      {children}
    </Component>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-slate-500 mt-1', className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={cn('px-4 py-3 sm:px-6 sm:py-4', className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}

export function CardFooter({ children, className = '', bordered = true }: CardFooterProps) {
  return (
    <div className={cn(
      'px-4 py-3 sm:px-6 sm:py-4',
      bordered && 'border-t border-slate-200',
      className
    )}>
      {children}
    </div>
  );
}

// Default export for backward compatibility
export default Card;