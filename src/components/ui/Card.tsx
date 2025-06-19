'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated' | 'flat';
  href?: string;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  variant = 'default',
  href,
  onClick,
}: CardProps) {
  const variantClasses = {
    default: 'bg-white border border-slate-200 shadow-sm hover:shadow-md',
    bordered: 'bg-white border border-slate-200 hover:border-slate-300',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    flat: 'bg-white',
  };
  
  const baseClasses = `rounded-xl transition-all duration-200 ${variantClasses[variant]} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }
  
  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClasses} w-full text-left`}>
        {children}
      </button>
    );
  }
  
  return <div className={baseClasses}>{children}</div>;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`px-6 py-4 border-b border-slate-200 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return <h3 className={`text-lg font-medium text-slate-900 ${className}`}>{children}</h3>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`px-6 py-4 border-t border-slate-200 ${className}`}>{children}</div>;
}

// Default export for backward compatibility
export default Card;